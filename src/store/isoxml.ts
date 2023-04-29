import { defineStore } from "pinia"
import { useGeojsonStore } from "./geojson"

import {
    ISOXMLManager, TAGS, TaskTaskStatusEnum, ExtendedPolygon,
    Partfield,
    PolygonPolygonTypeEnum
} from "isoxml"


export const useIsoXmlStore = defineStore("isoxml", {
    state: () => ({
        taskManager: new ISOXMLManager()
    }),
    getters: {

    },
    actions: {
        async parseShapeToGeoJson(fileContent) {
            const geojson = await shp.parseZip(fileContent)
            console.log("geojson", geojson)
            this.geojson = geojson
        },
        async createIsoXml() {


            const { geojson } = useGeojsonStore()
            const customer = this.taskManager.createEntityFromAttributes(TAGS.Customer, { CustomerLastName: "Kunden Name", CustomerCity: "Ort" })
            const farm = this.taskManager.createEntityFromAttributes(TAGS.Farm, { FarmDesignator: "Hof Name", FarmCity: "Ort" })

            // assign a local ID to the task ("TSK1" in our case)
            this.taskManager.registerEntity(customer)
            this.taskManager.registerEntity(farm)
            const partFields = []
            geojson.features.forEach(feature => {
                console.log("feature", feature)

                if (feature.geometry.type == "Polygon") {
                    // create a Partfield
                    const partfield = this.taskManager.createEntityFromAttributes(TAGS.Partfield, {
                        PartfieldDesignator: feature.properties.bez,
                        PartfieldCode: feature.properties.geo_id,
                    }) as Partfield
                    partfield.boundaryFromGeoJSON(feature.geometry, this.taskManager)

                    partFields.push(partfield)
                }
            })
            // add the task to the root element

            this.taskManager.rootElement.attributes.Customer = [customer]
            this.taskManager.rootElement.attributes.Farm = [farm]
            this.taskManager.rootElement.attributes.Partfield = partFields
            const data = await this.taskManager.saveISOXML()
            console.log("xmldata", new TextDecoder().decode(data))
            return data
        }

    },

})
