import { defineStore } from "pinia"
import {
  ISOXMLManager, TAGS, ExtendedPartfield, type ISOXMLReference,
} from "isoxml"
import { useGeojsonStore } from "./geojson"

export const useIsoXmlStore = defineStore("isoxml", {
  state: () => ({

  }),
  getters: {

  },
  actions: {
    async createIsoXml() {
      const { geojson } = useGeojsonStore()
      const taskManager = new ISOXMLManager()
      const partFields = []
      taskManager.rootElement.attributes.Customer = []
      taskManager.rootElement.attributes.Farm = []
      geojson.features.forEach((feature) => {
        if (feature.geometry.type == "Polygon" || feature.geometry.type == "MultiPolygon") {
          // create a Partfield
          const partfield = taskManager.createEntityFromAttributes(TAGS.Partfield, {
            PartfieldId: `PFD${feature.properties.geo_id}`,
            PartfieldDesignator: feature.properties.bez,
            PartfieldCode: feature.properties.geo_id,

          }) as ExtendedPartfield
          partfield.boundaryFromGeoJSON(feature.geometry, taskManager)
          const farmId = getOrCreateFarmXmlRef(taskManager, feature.properties.betriebName)
          console.log("FarmRef", farmId, feature.properties.betriebName)
          if (farmId) {
            partfield.attributes.FarmIdRef = farmId
          }
          const customerId = getOrCreateCustomerXmlRef(taskManager, feature.properties.kundenName)
          console.log("CustomerRef", customerId, feature.properties.kundenName)
          if (customerId) {
            partfield.attributes.CustomerIdRef = customerId
          }
          partFields.push(partfield)
        } else {
          console.warn("Feature is not of subtype polygon", feature)
        }
      })
      // add the task to the root element

      taskManager.rootElement.attributes.Partfield = partFields
      const data = await taskManager.saveISOXML()
      return data
    },

    async parseAsGeoJson(content: Uint8Array, type: string) {
      const taskManager = new ISOXMLManager()
      await taskManager.parseISOXMLFile(content, type)
      const partfields = taskManager.rootElement.attributes.Partfield
      const featureCollection = { type: "FeatureCollection", features: [] }
      partfields?.forEach((field: ExtendedPartfield) => {
        const feature = { type: "Feature" }
        feature.geometry = field.toGeoJSON()
        feature.properties = {
          geo_id: field.attributes.PartfieldCode,
          bez: field.attributes.PartfieldDesignator,
          flaeche_ha: field.attributes.PartfieldArea / 10000,
          kunde: field.attributes.CustomerIdRef?.xmlId,
          kundenName: field.attributes.CustomerIdRef?.entity?.attributes?.CustomerLastName,
          betrieb: field.attributes.FarmIdRef?.xmlId,
          betriebName: field.attributes.FarmIdRef?.entity?.attributes?.FarmDesignator,
        }
        featureCollection.features.push(feature)
      })
      useGeojsonStore().addFeatures(featureCollection.features)
      return featureCollection
    },

  },

})
const getOrCreateCustomerXmlRef = (taskManager: ISOXMLManager, name: string | undefined): ISOXMLReference => {
  const customer = taskManager.rootElement.attributes.Customer?.find(c => c.attributes.CustomerLastName == (name || "unbekannt"))
  if (customer) {
    console.log("found customer", customer)
    return taskManager.getReferenceByEntity(customer)
  }
  const entity = taskManager.createEntityFromAttributes(TAGS.Customer, { CustomerLastName: (name || "unbekannt") })
  taskManager.rootElement.attributes.Customer?.push(entity)
  console.log("new customer", taskManager.rootElement.attributes.Customer)
  return taskManager.registerEntity(entity)
}
const getOrCreateFarmXmlRef = (taskManager: ISOXMLManager, name: string): ISOXMLReference => {
  const farm = taskManager.rootElement.attributes.Farm?.find(c => c.attributes.FarmDesignator == name)
  if (farm) {
    console.log("found farm", farm)
    return taskManager.getReferenceByEntity(farm)
  }
  const entity = taskManager.createEntityFromAttributes(TAGS.Farm, { FarmDesignator: name })
  taskManager.rootElement.attributes.Farm?.push(entity)
  console.log("new farm", taskManager.rootElement.attributes.Farm)

  return taskManager.registerEntity(entity)
}
