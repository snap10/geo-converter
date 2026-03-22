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
      let partfieldCounter = 0

      for (const feature of geojson.features) {
        if (feature.geometry?.type === "Polygon" || feature.geometry?.type === "MultiPolygon") {
          const geoIdStr = feature.properties?.geo_id?.toString() || ""

          // PartfieldId: PFD- prefix (4 chars) + incrementing number, max 14 chars
          // Pattern: (PFD|PFD-)([0-9])+
          const partfieldId = `PFD-${++partfieldCounter}`

          // PartfieldCode: max 32 chars
          const partfieldCode = geoIdStr.substring(0, 32)

          // PartfieldDesignator: max 32 chars
          const partfieldDesignator = (feature.properties?.partfieldDesignator || feature.properties?.bez || "").substring(0, 32)

          // PartfieldArea: in m² (partfieldArea is in hectares, multiply by 10000)
          const areaHa = parseFloat(feature.properties?.partfieldArea || feature.properties?.flaeche_ha) || 0
          const areaM2 = Math.round(areaHa * 10000)

          // create a Partfield
          const partfield = taskManager.createEntityFromAttributes(isoxml.TAGS.Partfield, {
            PartfieldId: partfieldId,
            PartfieldDesignator: partfieldDesignator,
            PartfieldCode: partfieldCode,
            PartfieldArea: areaM2,
          })

          partfield.boundaryFromGeoJSON(feature.geometry, taskManager)
          
          const farmId = getOrCreateFarmXmlRef(taskManager, feature.properties?.farmId, feature.properties?.farmName)
          if (farmId) {
            partfield.attributes.FarmIdRef = farmId
          }
          
          const customerId = getOrCreateCustomerXmlRef(taskManager, feature.properties?.customerId, feature.properties?.customerName)
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

    async parseAsGeoJson(content: Uint8Array | string, type: string) {
      const isoxml = await getIsoxmlModule()
      const taskManager = new isoxml.ISOXMLManager()
      await taskManager.parseISOXMLFile(content, type as any)
      const partfields = taskManager.rootElement.attributes.Partfield
      const featureCollection = { type: "FeatureCollection", features: [] }

      const customers = taskManager.rootElement.attributes.Customer || []
      const farms = taskManager.rootElement.attributes.Farm || []
      
      for (const field of partfields) {
        const feature = { type: "Feature" }
        const geometry = field.toGeoJSON?.()
        feature.geometry = geometry
        
        const customerRef = field.attributes.CustomerIdRef
        const farmRef = field.attributes.FarmIdRef
        
        const customerEntity = customerRef?.entity || customers.find(c => c.attributes.CustomerId === customerRef?.xmlId)
        const farmEntity = farmRef?.entity || farms.find(f => f.attributes.FarmId === farmRef?.xmlId)
        
        const customerName = customerEntity?.attributes?.CustomerLastName || customerEntity?.attributes?.CustomerName || customerRef?.xmlId
        const farmName = farmEntity?.attributes?.FarmDesignator || farmEntity?.attributes?.FarmName || farmRef?.xmlId
        
        feature.properties = {
          geo_id: field.attributes?.PartfieldCode,
          partfieldDesignator: field.attributes?.PartfieldDesignator,
          partfieldArea: field.attributes?.PartfieldArea ? parseFloat(field.attributes.PartfieldArea) / 10000 : undefined,
          customerId: customerRef?.xmlId,
          customerName: customerName === "undefined" ? customerRef?.xmlId : customerName,
          farmId: farmRef?.xmlId,
          farmName: farmName === "undefined" ? farmRef?.xmlId : farmName,
        }
        featureCollection.features.push(feature)
      }

      useGeojsonStore().addFeatures(featureCollection.features)
      return featureCollection
    },
  },
})

function getOrCreateCustomerXmlRef(taskManager: any, customerId: string | undefined, customerName: string | undefined): any {
  if (customerId) {
    const existingCustomer = taskManager.rootElement.attributes.Customer?.find(c => c.attributes.CustomerId == customerId)
    if (existingCustomer) {
      return taskManager.getReferenceByEntity(existingCustomer)
    }
  }
  
  const name = customerName || "unbekannt"
  const customer = taskManager.rootElement.attributes.Customer?.find(c => c.attributes.CustomerLastName == name)
  if (customer) {
    return taskManager.getReferenceByEntity(customer)
  }
  
  const newCustomerId = customerId || `CTR${(taskManager.rootElement.attributes.Customer?.length || 0) + 1}`
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Customer, {
    CustomerId: newCustomerId,
    CustomerLastName: name,
  })
  taskManager.rootElement.attributes.Customer?.push(entity)
  return taskManager.registerEntity(entity)
}

function getOrCreateFarmXmlRef(taskManager: any, farmId: string | undefined, farmName: string | undefined): any {
  if (farmId) {
    const existingFarm = taskManager.rootElement.attributes.Farm?.find(f => f.attributes.FarmId == farmId)
    if (existingFarm) {
      return taskManager.getReferenceByEntity(existingFarm)
    }
  }
  
  const name = farmName || "unbekannt"
  const farm = taskManager.rootElement.attributes.Farm?.find(f => f.attributes.FarmDesignator == name)
  if (farm) {
    return taskManager.getReferenceByEntity(farm)
  }
  
  const newFarmId = farmId || `FRM${(taskManager.rootElement.attributes.Farm?.length || 0) + 1}`
  const entity = taskManager.createEntityFromAttributes(isoxmlModule?.TAGS.Farm, {
    FarmId: newFarmId,
    FarmDesignator: name,
  })
  taskManager.rootElement.attributes.Farm?.push(entity)
  return taskManager.registerEntity(entity)
}
