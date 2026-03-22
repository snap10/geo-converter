import { defineStore } from "pinia"
import { useGeojsonStore } from "./geojson"

// We'll use dynamic import to avoid circular dependency issues
let isoxmlModule: any = null

async function getIsoxmlModule() {
  if (!isoxmlModule) {
    isoxmlModule = await import("isoxml")
  }
  return isoxmlModule
}

export const useIsoXmlStore = defineStore("isoxml", {
  state: () => ({
  }),
  getters: {
  },
  actions: {
    async createIsoXml() {
      const { geojson } = useGeojsonStore()
      const isoxml = await getIsoxmlModule()
      const taskManager = new isoxml.ISOXMLManager()
      const partFields = []
      taskManager.rootElement.attributes.Customer = []
      taskManager.rootElement.attributes.Farm = []

      for (const feature of geojson.features) {
        if (feature.geometry?.type === "Polygon" || feature.geometry?.type === "MultiPolygon") {
          // Trim geo_id to max 14 characters for PartfieldCode
          const geoIdStr = feature.properties?.geo_id?.toString() || ""
          const trimmedGeoId = geoIdStr.substring(0, 14)
          // For PartfieldId, we have "PFD" prefix (3 chars) + max 11 chars from geo_id to keep total <= 14
          const trimmedGeoIdForPartFieldId = geoIdStr.substring(0, 11)

          // create a Partfield
          const partfield = taskManager.createEntityFromAttributes(isoxml.TAGS.Partfield, {
            PartfieldId: `PFD${trimmedGeoIdForPartFieldId}`,
            PartfieldDesignator: feature.properties?.bez,
            PartfieldCode: trimmedGeoId,
          })

          partfield.boundaryFromGeoJSON(feature.geometry, taskManager)
          const farmId = getOrCreateFarmXmlRef(taskManager, feature.properties?.betriebName)
          console.log("FarmRef", farmId, feature.properties?.betriebName)
          if (farmId) {
            partfield.attributes.FarmIdRef = farmId
          }
          const customerId = getOrCreateCustomerXmlRef(taskManager, feature.properties?.kundenName)
          console.log("CustomerRef", customerId, feature.properties?.kundenName)
          if (customerId) {
            partfield.attributes.CustomerIdRef = customerId
          }
          partFields.push(partfield)
        } else {
          console.warn("Feature is not of subtype polygon", feature)
        }
      }

      // add the task to the root element
      taskManager.rootElement.attributes.Partfield = partFields
      const data = await taskManager.saveISOXML()
      return data
    },

    async parseAsGeoJson(content: Uint8Array, type: string) {
      const isoxml = await getIsoxmlModule()
      const taskManager = new isoxml.ISOXMLManager()
      await taskManager.parseISOXMLFile(content, type)
      const partfields = taskManager.rootElement.attributes.Partfield
      const featureCollection = { type: "FeatureCollection", features: [] }

      for (const field of partfields) {
        const feature = { type: "Feature" }
        // Access geometry and properties safely
        const geometry = field.toGeoJSON?.()
        feature.geometry = geometry
        feature.properties = {
          geo_id: field.attributes?.PartfieldCode,
          bez: field.attributes?.PartfieldDesignator,
          flaeche_ha: field.attributes?.PartfieldArea ? parseFloat(field.attributes.PartfieldArea) / 10000 : undefined,
          kunde: field.attributes.CustomerIdRef?.xmlId,
          kundenName: field.attributes.CustomerIdRef?.entity?.attributes?.CustomerLastName,
          betrieb: field.attributes.FarmIdRef?.xmlId,
          betriebName: field.attributes.FarmIdRef?.entity?.attributes?.FarmDesignator,
        }
        featureCollection.features.push(feature)
      }

      useGeojsonStore().addFeatures(featureCollection.features)
      return featureCollection
    },
  },
})

function getOrCreateCustomerXmlRef(taskManager: any, name: string | undefined): any {
  const customer = taskManager.rootElement.attributes.Customer?.find(c => c.attributes.CustomerLastName == (name || "unbekannt"))
  if (customer) {
    console.log("found customer", customer)
    return taskManager.getReferenceByEntity(customer)
  }
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Customer, { CustomerLastName: (name || "unbekannt") })
  taskManager.rootElement.attributes.Customer?.push(entity)
  console.log("new customer", taskManager.rootElement.attributes.Customer)
  return taskManager.registerEntity(entity)
}

function getOrCreateFarmXmlRef(taskManager: any, name: string): any {
  const farm = taskManager.rootElement.attributes.Farm?.find(c => c.attributes.FarmDesignator == name)
  if (farm) {
    console.log("found farm", farm)
    return taskManager.getReferenceByEntity(farm)
  }
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Farm, { FarmDesignator: name })
  taskManager.rootElement.attributes.Farm?.push(entity)
  console.log("new farm", taskManager.rootElement.attributes.Farm)

  return taskManager.registerEntity(entity)
}
