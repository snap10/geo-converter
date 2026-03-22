import { defineStore } from "pinia"
import shp from "shpjs"

export const useGeojsonStore = defineStore("geojson", {
  state: () => ({
    geojson: { type: "FeatureCollection", features: [] },
    uploadCounter: 0, // Counter to generate unique upload IDs
    featureIdCounter: 0, // Counter to generate unique feature IDs
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
        // Assign a unique feature id
        feature.properties.feature_id = `feature_${++this.featureIdCounter}`
      })
      this.addFeatures(geojson.features)
    },
    addFeatures(features: any[]) {
      // Assign a unique feature id to each feature if it doesn't have one
      features.forEach(feature => {
        if (!feature.properties.feature_id) {
          feature.properties.feature_id = `feature_${++this.featureIdCounter}`
        }
      })
      const newJson = { ...this.geojson, features: [...this.geojson.features, ...features] }
      this.geojson = newJson
      console.log("new", this.geojson)
    },
    setGeoJson(geojson: any) {
      // Assign unique feature ids to features in the new geojson if they don't have one
      geojson.features.forEach(feature => {
        if (!feature.properties.feature_id) {
          feature.properties.feature_id = `feature_${++this.featureIdCounter}`
        }
      })
      this.geojson = geojson
    },
  },
})