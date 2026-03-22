import { defineStore } from "pinia"
import shp from "shpjs"
import { computed } from "vue"

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return `#${"00000".substring(0, 6 - c.length)}${c}`
}

export const useGeojsonStore = defineStore("geojson", {
  state: () => ({
    geojson: { type: "FeatureCollection", features: [] },
    uploadCounter: 0, // Counter to generate unique upload IDs
    featureIdCounter: 0, // Counter to generate unique feature IDs
    selectedFeatureIds: new Set<string>(), // Track selected feature IDs
  }),
  getters: {
    selectedFeatures: (state) => {
      return state.geojson.features.filter(
        (feature) => feature.properties?.feature_id && state.selectedFeatureIds.has(feature.properties.feature_id)
      )
    },
    selectedCount: (state) => state.selectedFeatureIds.size,
    isFeatureSelected: (state) => {
      return (featureId: string) => state.selectedFeatureIds.has(featureId)
    },
    allSelected: (state) => {
      return state.geojson.features.length > 0 && 
             state.selectedFeatureIds.size === state.geojson.features.length
    },
    availableFarms: (state) => {
      const farms = new Set<string>()
      state.geojson.features.forEach(feature => {
        const farmId = feature.properties?.farmId
        if (farmId) {
          farms.add(farmId)
        }
      })
      return Array.from(farms)
    },
    farmInfo: (state) => {
      const farmsMap = new Map<string, { id: string; name: string; color: string }>()
      const allFarmIds = new Set<string>()
      state.geojson.features.forEach(feature => {
        const farmId = feature.properties?.farmId
        if (farmId) {
          allFarmIds.add(farmId)
        }
      })
      const totalFarms = allFarmIds.size
      
      state.geojson.features.forEach(feature => {
        const farmId = feature.properties?.farmId
        const farmName = feature.properties?.farmName
        if (farmId && !farmsMap.has(farmId)) {
          const color = totalFarms === 1 ? "#3388ff" : getColorFromString(farmId)
          farmsMap.set(farmId, { id: farmId, name: farmName || farmId, color })
        }
      })
      return Array.from(farmsMap.values())
    },
  },
  actions: {
    selectFeature(featureId: string) {
      this.selectedFeatureIds.add(featureId)
    },
    deselectFeature(featureId: string) {
      this.selectedFeatureIds.delete(featureId)
    },
    toggleSelection(featureId: string) {
      if (this.selectedFeatureIds.has(featureId)) {
        this.selectedFeatureIds.delete(featureId)
      } else {
        this.selectedFeatureIds.add(featureId)
      }
    },
    selectAll() {
      this.geojson.features.forEach(feature => {
        const featureId = feature.properties?.feature_id
        if (featureId) {
          this.selectedFeatureIds.add(featureId)
        }
      })
    },
    deselectAll() {
      this.selectedFeatureIds.clear()
    },
    selectByFarm(farmId: string) {
      this.geojson.features.forEach(feature => {
        if (feature.properties?.farmId === farmId) {
          const featureId = feature.properties?.feature_id
          if (featureId) {
            this.selectedFeatureIds.add(featureId)
          }
        }
      })
    },
    deselectByFarm(farmId: string) {
      this.geojson.features.forEach(feature => {
        if (feature.properties?.farmId === farmId) {
          const featureId = feature.properties?.feature_id
          if (featureId) {
            this.selectedFeatureIds.delete(featureId)
          }
        }
      })
    },
    toggleFarmSelection(farmId: string) {
      const allSelected = this.geojson.features
        .filter(f => f.properties?.farmId === farmId)
        .every(f => this.selectedFeatureIds.has(f.properties?.feature_id))
      
      if (allSelected) {
        this.deselectByFarm(farmId)
      } else {
        this.selectByFarm(farmId)
      }
    },
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
      const newFeatureIds: string[] = []
      features.forEach(feature => {
        if (!feature.properties) {
          feature.properties = {}
        }
        if (!feature.properties.feature_id) {
          feature.properties.feature_id = `feature_${++this.featureIdCounter}`
        }
        newFeatureIds.push(feature.properties.feature_id)
      })
      const newJson = { ...this.geojson, features: [...this.geojson.features, ...features] }
      this.geojson = newJson
      // Auto-select all newly added features
      newFeatureIds.forEach(id => this.selectedFeatureIds.add(id))
      console.log("new", this.geojson)
    },
    setGeoJson(geojson: any) {
      // Assign unique feature ids to features in the new geojson if they don't have one
      // and select them all
      this.selectedFeatureIds.clear()
      geojson.features.forEach(feature => {
        if (!feature.properties) {
          feature.properties = {}
        }
        if (!feature.properties.feature_id) {
          feature.properties.feature_id = `feature_${++this.featureIdCounter}`
        }
        this.selectedFeatureIds.add(feature.properties.feature_id)
      })
      this.geojson = geojson
    },
    updateFeature(featureId: string, properties: Record<string, any>) {
      const featureIndex = this.geojson.features.findIndex(
        f => f.properties?.feature_id === featureId
      )
      if (featureIndex !== -1) {
        this.geojson.features[featureIndex].properties = {
          ...this.geojson.features[featureIndex].properties,
          ...properties
        }
      }
    },
    getFeatureById(featureId: string) {
      return this.geojson.features.find(f => f.properties?.feature_id === featureId)
    },
  },
})