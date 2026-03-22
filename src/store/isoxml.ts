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
          const geoIdStr = feature.properties?.geo_id?.toString() || ""
          
          // PartfieldId: PFD- prefix (4 chars) + numeric suffix, max 14 chars total
          // Pattern: (PFD|PFD-)([0-9])+ - must be numeric after PFD-
          const numericSuffix = geoIdStr.replace(/[^0-9]/g, "").substring(0, 10) || "1"
          const partfieldId = `PFD-${numericSuffix}`.substring(0, 14)
          
          // PartfieldCode: max 32 chars
          const partfieldCode = geoIdStr.substring(0, 32)
          
          // PartfieldDesignator: max 32 chars
          const partfieldDesignator = (feature.properties?.bez || "").substring(0, 32)
          
          // PartfieldArea: in m² (flaeche_ha is in hectares, multiply by 10000)
          const areaHa = parseFloat(feature.properties?.flaeche_ha) || 0
          const areaM2 = Math.round(areaHa * 10000)
          
          // create a Partfield
          const partfield = taskManager.createEntityFromAttributes(isoxml.TAGS.Partfield, {
            PartfieldId: partfieldId,
            PartfieldDesignator: partfieldDesignator,
            PartfieldCode: partfieldCode,
            PartfieldArea: areaM2,
          })

          partfield.boundaryFromGeoJSON(feature.geometry, taskManager)
          
          const farmId = getOrCreateFarmXmlRef(taskManager, feature.properties?.betriebName)
          if (farmId) {
            partfield.attributes.FarmIdRef = farmId
          }
          
          const customerId = getOrCreateCustomerXmlRef(taskManager, feature.properties?.kundenName)
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
  const customerName = name || "unbekannt"
  const customer = taskManager.rootElement.attributes.Customer?.find(c => c.attributes.CustomerLastName == customerName)
  if (customer) {
    return taskManager.getReferenceByEntity(customer)
  }
  // CustomerId pattern: (CTR|CTR-)([0-9])+, max 14 chars
  const customerId = `CTR-${taskManager.rootElement.attributes.Customer?.length || 1}`
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Customer, { 
    CustomerId: customerId,
    CustomerLastName: customerName 
  })
  taskManager.rootElement.attributes.Customer?.push(entity)
  return taskManager.registerEntity(entity)
}

function getOrCreateFarmXmlRef(taskManager: any, name: string | undefined): any {
  const farmName = name || "unbekannt"
  const farm = taskManager.rootElement.attributes.Farm?.find(c => c.attributes.FarmDesignator == farmName)
  if (farm) {
    return taskManager.getReferenceByEntity(farm)
  }
  // FarmId pattern: (FRM|FRM-)([0-9])+, max 14 chars
  const farmId = `FRM-${taskManager.rootElement.attributes.Farm?.length || 1}`
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Farm, { 
    FarmId: farmId,
    FarmDesignator: farmName 
  })
  taskManager.rootElement.attributes.Farm?.push(entity)
  return taskManager.registerEntity(entity)
}
