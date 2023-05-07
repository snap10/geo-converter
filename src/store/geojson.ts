import { defineStore } from "pinia"
import shp from "shpjs"

export const useGeojsonStore = defineStore("geojson", {
  state: () => ({
    geojson: { type: "FeatureCollection", features: [] },
  }),
  actions: {
    async parseShapeToGeoJson(fileContent: any) {
      const geojson = await shp.parseZip(fileContent)
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
