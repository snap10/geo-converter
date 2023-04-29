import { defineStore } from "pinia"
import shp from "shpjs"

export const useGeojsonStore = defineStore("geojson", {
    state: () => ({
        geojson: {
            "type": "FeatureCollection", "features":
                [{
                    "type": "Feature", "geometry": { "type": "Point", "coordinates": [9.89, 48.190] },
                    "properties": { "popupContent": "This point loves Karl MALONE" }
                },
                {
                    "type": "Feature", "geometry": {
                        "type": "LineString", "coordinates": [[9.89, 48.190],
                        [36.67, 38.97], [40.82, 39.28], [40.01, 40.59]]
                    }, "properties": { "popupContent": "This line loves John STOCKTON" }
                },
                { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[9.89, 48.190], [30.06, 39.58], [32.06, 39.58], [32.06, 39.58], [9.89, 48.190]]] }, "properties": { "popupContent": "This polygon loves Jeff HORNACEK" } }]
        } as GeoJSON.FeatureCollection
    }),
    actions: {
        async parseShapeToGeoJson(fileContent) {
            const geojson = await shp.parseZip(fileContent)
            console.log("geojson", geojson)
            this.geojson = geojson
        }

    },

})
