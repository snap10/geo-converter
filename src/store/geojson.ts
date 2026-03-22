import { defineStore } from "pinia"
import shp from "shpjs"

export const useGeojsonStore = defineStore("geojson", {
  state: () => ({
    geojson: { type: "FeatureCollection", features: [] },
    uploadCounter: 0, // Counter to generate unique upload IDs
  }),
  actions: {
    async parseShapeToGeoJson(fileContent: any) {
      const geojson = await shp.parseZip(fileContent)
      // Add upload_id to each feature
      const uploadId = `upload_${++this.uploadCounter}`
      geojson.features.forEach(feature => {
        if (!feature.properties) {
          feature.properties = {}
        }
        feature.properties.upload_id = uploadId
      })
      this.addFeatures(geojson.features)
    },
    addFeatures(features: any[]) {
      const newJson = { ...this.geojson, features: [...this.geojson.features, ...features] }
      this.geojson = newJson
      console.log("new", this.geojson)
    },
    setGeoJson(geojson: any) {
      this.geojson = geojson
    },
  },
})
