import { defineStore } from "pinia"
import shp from "shpjs"
import { computed } from "vue"

const FARM_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
  "#1abc9c", "#e67e22", "#34495e", "#16a085", "#c0392b",
  "#2980b9", "#27ae60", "#d35400", "#8e44ad", "#0d8195",
  "#f1c40f", "#2c3e50", "#7f8c8d", "#95a5a6", "#bdc3c7",
]

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return FARM_COLORS[Math.abs(hash) % FARM_COLORS.length]
}

export interface Upload {
  id: string
  name: string
  type: "shapefile" | "isoxml"
  featureCount: number
  farmIds: string[]
  timestamp: Date
}

export interface PendingDuplicate {
  existingUpload: Upload
  newUpload: Upload
  existingFarmIds: string[]
  newFarmIds: string[]
}

export { FARM_COLORS }

export const useGeojsonStore = defineStore("geojson", {
  state: () => ({
    geojson: { type: "FeatureCollection", features: [] },
    uploads: [] as Upload[],
    uploadCounter: 0,
    featureIdCounter: 0,
    selectedFeatureIds: new Set<string>(),
    pendingDuplicates: [] as PendingDuplicate[],
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
      const uploadId = `upload_${++this.uploadCounter}`
      geojson.features.forEach(feature => {
        if (!feature.properties) {
          feature.properties = {}
        }
        feature.properties.upload_id = uploadId
        feature.properties.feature_id = `feature_${++this.featureIdCounter}`
      })
      this.addFeatures(geojson.features)
    },
    async parseShapeToGeoJsonWithResult(fileContent: any): Promise<{ features: any[] } | null> {
      try {
        const geojson = await shp.parseZip(fileContent)
        const uploadId = `upload_${++this.uploadCounter}`
        geojson.features.forEach(feature => {
          if (!feature.properties) {
            feature.properties = {}
          }
          feature.properties.upload_id = uploadId
          feature.properties.feature_id = `feature_${++this.featureIdCounter}`
        })
        this.addFeatures(geojson.features)
        return geojson
      } catch (error) {
        console.error("Error parsing shapefile:", error)
        return null
      }
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
    addUpload(name: string, type: "shapefile" | "isoxml", featureCount: number, farmIds: string[]): string {
      const id = `upload_${++this.uploadCounter}`
      this.uploads.push({
        id,
        name,
        type,
        featureCount,
        farmIds,
        timestamp: new Date()
      })
      return id
    },
    removeUpload(uploadId: string) {
      const featureIdsToRemove = new Set<string>()
      this.geojson.features.forEach(feature => {
        if (feature.properties?.upload_id === uploadId) {
          featureIdsToRemove.add(feature.properties.feature_id)
        }
      })
      this.geojson.features = this.geojson.features.filter(
        feature => feature.properties?.upload_id !== uploadId
      )
      featureIdsToRemove.forEach(id => this.selectedFeatureIds.delete(id))
      this.uploads = this.uploads.filter(u => u.id !== uploadId)
      return featureIdsToRemove.size
    },
    getFeaturesByUploadId(uploadId: string) {
      return this.geojson.features.filter(f => f.properties?.upload_id === uploadId)
    },
    getUploadById(uploadId: string) {
      return this.uploads.find(u => u.id === uploadId)
    },
    getDuplicateFarmIds(newFarmIds: string[]): string[] {
      return newFarmIds.filter(farmId => 
        this.uploads.some(u => u.farmIds.includes(farmId))
      )
    },
    hasPendingDuplicates(): boolean {
      return this.pendingDuplicates.length > 0
    },
    addPendingDuplicate(existingUpload: Upload, newUpload: Upload, existingFarmIds: string[], newFarmIds: string[]) {
      this.pendingDuplicates.push({ existingUpload, newUpload, existingFarmIds, newFarmIds })
    },
    resolveDuplicate(index: number, action: "keep_existing" | "keep_new" | "keep_both") {
      if (index < 0 || index >= this.pendingDuplicates.length) return
      
      const duplicate = this.pendingDuplicates[index]
      if (action === "keep_existing") {
        // Remove new upload and its features
        this.geojson.features = this.geojson.features.filter(
          f => f.properties?.upload_id !== duplicate.newUpload.id
        )
        this.uploads = this.uploads.filter(u => u.id !== duplicate.newUpload.id)
      } else if (action === "keep_new") {
        // Remove existing features from this upload
        this.geojson.features = this.geojson.features.filter(
          f => f.properties?.upload_id !== duplicate.existingUpload.id
        )
        this.uploads = this.uploads.filter(u => u.id !== duplicate.existingUpload.id)
      } else if (action === "keep_both") {
        // Rename the new farm IDs to avoid collision
        this.geojson.features.forEach(feature => {
          if (feature.properties?.upload_id === duplicate.newUpload.id) {
            const oldFarmId = feature.properties?.farmId
            if (oldFarmId && duplicate.existingFarmIds.includes(oldFarmId)) {
              feature.properties.farmId = `${oldFarmId}_copy`
              feature.properties.farmName = feature.properties.farmName 
                ? `${feature.properties.farmName} (Kopie)` 
                : `${oldFarmId} (Kopie)`
            }
          }
        })
        duplicate.newUpload.farmIds = duplicate.newUpload.farmIds.map(id => 
          duplicate.existingFarmIds.includes(id) ? `${id}_copy` : id
        )
      }
      this.pendingDuplicates.splice(index, 1)
    },
    clearAllData() {
      this.geojson = { type: "FeatureCollection", features: [] }
      this.uploads = []
      this.selectedFeatureIds.clear()
      this.pendingDuplicates = []
      this.uploadCounter = 0
      this.featureIdCounter = 0
    },
  },
})