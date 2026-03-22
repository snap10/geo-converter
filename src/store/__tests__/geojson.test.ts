import { setActivePinia, createPinia } from "pinia"
import { describe, it, expect, beforeEach } from "vitest"
import { useGeojsonStore } from "../geojson"

describe("useGeojsonStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("should initialize with empty FeatureCollection", () => {
    const store = useGeojsonStore()
    expect(store.geojson).toEqual({ type: "FeatureCollection", features: [] })
    expect(store.uploadCounter).toBe(0)
    expect(store.featureIdCounter).toBe(0)
  })

  it("should add features with unique feature_ids", () => {
    const store = useGeojsonStore()
    
    const features = [
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
        properties: { name: "Field 1" }
      },
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]] },
        properties: { name: "Field 2" }
      }
    ]

    store.addFeatures(features)

    expect(store.geojson.features).toHaveLength(2)
    expect(store.geojson.features[0].properties.feature_id).toBe("feature_1")
    expect(store.geojson.features[1].properties.feature_id).toBe("feature_2")
    expect(store.featureIdCounter).toBe(2)
  })

  it("should not overwrite existing feature_id", () => {
    const store = useGeojsonStore()
    
    const features = [
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
        properties: { feature_id: "existing_id" }
      }
    ]

    store.addFeatures(features)

    expect(store.geojson.features[0].properties.feature_id).toBe("existing_id")
  })

  it("should set geojson and assign feature_ids to features without one", () => {
    const store = useGeojsonStore()
    
    const newGeoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
          properties: { name: "Field 1" }
        },
        {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]] },
          properties: { name: "Field 2" }
        }
      ]
    }

    store.setGeoJson(newGeoJson)

    expect(store.geojson.features).toHaveLength(2)
    expect(store.geojson.features[0].properties.feature_id).toBe("feature_1")
    expect(store.geojson.features[1].properties.feature_id).toBe("feature_2")
  })

  it("should increment feature_id counter correctly", () => {
    const store = useGeojsonStore()
    
    store.addFeatures([
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
        properties: {}
      }
    ])
    
    expect(store.featureIdCounter).toBe(1)
    
    store.addFeatures([
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]] },
        properties: {}
      },
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]] },
        properties: {}
      }
    ])
    
    expect(store.featureIdCounter).toBe(3)
  })

  it("should create feature_id even for features without properties", () => {
    const store = useGeojsonStore()
    
    const features = [
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }
    ]

    store.addFeatures(features)

    expect(store.geojson.features[0].properties.feature_id).toBe("feature_1")
  })

  describe("selection functionality", () => {
    it("should initialize with empty selection", () => {
      const store = useGeojsonStore()
      expect(store.selectedFeatureIds.size).toBe(0)
      expect(store.selectedCount).toBe(0)
    })

    it("should select and deselect features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: {} }
      ])
      
      const featureId = store.geojson.features[0].properties.feature_id
      
      store.selectFeature(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(true)
      expect(store.selectedCount).toBe(1)
      
      store.deselectFeature(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(false)
      expect(store.selectedCount).toBe(0)
    })

    it("should toggle selection", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: {} }
      ])
      
      const featureId = store.geojson.features[0].properties.feature_id
      // Feature is auto-selected on add, so toggle deselects it
      store.toggleSelection(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(false)
      
      store.toggleSelection(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(true)
    })

    it("should select all features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: {} },
        { type: "Feature", geometry: {}, properties: {} },
        { type: "Feature", geometry: {}, properties: {} }
      ])
      
      store.selectAll()
      expect(store.selectedCount).toBe(3)
      expect(store.allSelected).toBe(true)
    })

    it("should deselect all features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: {} },
        { type: "Feature", geometry: {}, properties: {} }
      ])
      
      store.selectAll()
      store.deselectAll()
      
      expect(store.selectedCount).toBe(0)
      expect(store.allSelected).toBe(false)
    })

    it("should select features by farm", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM2" } }
      ])
      
      // All features are auto-selected on add, so deselect all first
      store.deselectAll()
      store.selectByFarm("FRM1")
      expect(store.selectedCount).toBe(2)
    })

    it("should deselect features by farm", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM2" } }
      ])
      
      store.selectAll()
      store.deselectByFarm("FRM1")
      
      expect(store.selectedCount).toBe(1)
    })

    it("should toggle farm selection", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } }
      ])
      
      // All features are auto-selected, so first toggle deselects them
      store.toggleFarmSelection("FRM1")
      expect(store.selectedCount).toBe(0)
      
      // Second toggle selects them again
      store.toggleFarmSelection("FRM1")
      expect(store.selectedCount).toBe(2)
    })

    it("should return selected features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 1" } },
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 2" } },
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 3" } }
      ])
      
      // All features are auto-selected, so deselect all first
      store.deselectAll()
      store.selectFeature(store.geojson.features[0].properties.feature_id)
      store.selectFeature(store.geojson.features[2].properties.feature_id)
      
      expect(store.selectedFeatures).toHaveLength(2)
      expect(store.selectedFeatures[0].properties.name).toBe("Field 1")
      expect(store.selectedFeatures[1].properties.name).toBe("Field 3")
    })

    it("should return available farms", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM2" } },
        { type: "Feature", geometry: {}, properties: { farmId: "FRM1" } },
        { type: "Feature", geometry: {}, properties: {} }
      ])
      
      expect(store.availableFarms).toEqual(["FRM1", "FRM2"])
    })

    it("should update feature properties", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { partfieldDesignator: "Field1", partfieldArea: 10 } }
      ])
      
      const featureId = store.geojson.features[0].properties.feature_id
      store.updateFeature(featureId, { partfieldDesignator: "Updated Field", partfieldArea: 20 })
      
      expect(store.geojson.features[0].properties.partfieldDesignator).toBe("Updated Field")
      expect(store.geojson.features[0].properties.partfieldArea).toBe(20)
    })

    it("should get feature by id", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { partfieldDesignator: "Field1" } },
        { type: "Feature", geometry: {}, properties: { partfieldDesignator: "Field2" } }
      ])
      
      const featureId = store.geojson.features[1].properties.feature_id
      const feature = store.getFeatureById(featureId)
      
      expect(feature?.properties?.partfieldDesignator).toBe("Field2")
    })
  })

  describe("upload management", () => {
    it("should add an upload", () => {
      const store = useGeojsonStore()
      
      const uploadId = store.addUpload("test.zip", "shapefile", 10, ["FRM1", "FRM2"])
      
      expect(uploadId).toBe("upload_1")
      expect(store.uploads).toHaveLength(1)
      expect(store.uploads[0].name).toBe("test.zip")
      expect(store.uploads[0].type).toBe("shapefile")
      expect(store.uploads[0].featureCount).toBe(10)
      expect(store.uploads[0].farmIds).toEqual(["FRM1", "FRM2"])
    })

    it("should track multiple uploads with incrementing ids", () => {
      const store = useGeojsonStore()
      
      store.addUpload("file1.zip", "isoxml", 5, ["A"])
      store.addUpload("file2.zip", "shapefile", 10, ["B"])
      store.addUpload("file3.zip", "isoxml", 15, ["C"])
      
      expect(store.uploads).toHaveLength(3)
      expect(store.uploads[0].id).toBe("upload_1")
      expect(store.uploads[1].id).toBe("upload_2")
      expect(store.uploads[2].id).toBe("upload_3")
    })

    it("should get upload by id", () => {
      const store = useGeojsonStore()
      
      store.addUpload("test.zip", "shapefile", 10, ["FRM1"])
      const upload = store.getUploadById("upload_1")
      
      expect(upload).toBeDefined()
      expect(upload?.name).toBe("test.zip")
    })

    it("should return undefined for non-existent upload id", () => {
      const store = useGeojsonStore()
      
      const upload = store.getUploadById("non_existent")
      
      expect(upload).toBeUndefined()
    })

    it("should remove upload and its features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F2" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_2", geo_id: "F3" } }
      ])
      
      store.addUpload("test.zip", "shapefile", 2, ["F1", "F2"])
      store.addUpload("test2.zip", "isoxml", 1, ["F3"])
      
      const removedCount = store.removeUpload("upload_1")
      
      expect(removedCount).toBe(2)
      expect(store.geojson.features).toHaveLength(1)
      expect(store.geojson.features[0].properties.geo_id).toBe("F3")
      expect(store.uploads).toHaveLength(1)
      expect(store.uploads[0].id).toBe("upload_2")
    })

    it("should get features by upload id", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F2" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_2", geo_id: "F3" } }
      ])
      
      const features = store.getFeaturesByUploadId("upload_1")
      
      expect(features).toHaveLength(2)
    })
  })

  describe("duplicate detection", () => {
    it("should detect duplicate geo_ids", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { geo_id: "F2" } },
        { type: "Feature", geometry: {}, properties: { geo_id: "F3" } }
      ])
      
      const duplicates = store.getDuplicateGeoIds(["F1", "F4", "F5"])
      
      expect(duplicates).toEqual(["F1"])
    })

    it("should return empty array when no duplicates", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { geo_id: "F1" } }
      ])
      
      const duplicates = store.getDuplicateGeoIds(["F2", "F3"])
      
      expect(duplicates).toEqual([])
    })

    it("should return empty array when no existing features", () => {
      const store = useGeojsonStore()
      
      const duplicates = store.getDuplicateGeoIds(["F1", "F2"])
      
      expect(duplicates).toEqual([])
    })
  })

  describe("pending duplicates", () => {
    it("should add pending duplicate", () => {
      const store = useGeojsonStore()
      
      const existingUpload = {
        id: "upload_1",
        name: "existing.zip",
        type: "shapefile" as const,
        featureCount: 5,
        farmIds: ["F1"],
        timestamp: new Date()
      }
      const newUpload = {
        id: "upload_2",
        name: "new.zip",
        type: "isoxml" as const,
        featureCount: 5,
        farmIds: ["F1"],
        timestamp: new Date()
      }
      
      store.addPendingDuplicate(
        existingUpload,
        newUpload,
        [{ geo_id: "F1", partfieldDesignator: "Field 1" }],
        [{ geo_id: "F1", partfieldDesignator: "Field 1 Copy" }]
      )
      
      expect(store.pendingDuplicates).toHaveLength(1)
      expect(store.hasPendingDuplicates()).toBe(true)
    })

    it("should resolve duplicate with keep_existing", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_2", geo_id: "F1" } }
      ])
      store.addUpload("existing.zip", "shapefile", 1, ["F1"])
      store.addUpload("new.zip", "isoxml", 1, ["F1"])
      
      const existingUpload = store.uploads[0]
      const newUpload = store.uploads[1]
      
      store.addPendingDuplicate(
        existingUpload,
        newUpload,
        [{ geo_id: "F1" }],
        [{ geo_id: "F1" }]
      )
      
      store.resolveDuplicate(0, "keep_existing")
      
      expect(store.geojson.features).toHaveLength(1)
      expect(store.geojson.features[0].properties.upload_id).toBe("upload_1")
      expect(store.pendingDuplicates).toHaveLength(0)
    })

    it("should resolve duplicate with keep_new", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_2", geo_id: "F1" } }
      ])
      store.addUpload("existing.zip", "shapefile", 1, ["F1"])
      store.addUpload("new.zip", "isoxml", 1, ["F1"])
      
      const existingUpload = store.uploads[0]
      const newUpload = store.uploads[1]
      
      store.addPendingDuplicate(
        existingUpload,
        newUpload,
        [{ geo_id: "F1" }],
        [{ geo_id: "F1" }]
      )
      
      store.resolveDuplicate(0, "keep_new")
      
      expect(store.geojson.features).toHaveLength(1)
      expect(store.geojson.features[0].properties.upload_id).toBe("upload_2")
      expect(store.pendingDuplicates).toHaveLength(0)
    })

    it("should resolve duplicate with keep_both and rename geo_ids", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_1", geo_id: "F1" } },
        { type: "Feature", geometry: {}, properties: { upload_id: "upload_2", geo_id: "F1" } }
      ])
      store.addUpload("existing.zip", "shapefile", 1, ["F1"])
      store.addUpload("new.zip", "isoxml", 1, ["F1"])
      
      const existingUpload = store.uploads[0]
      const newUpload = store.uploads[1]
      
      store.addPendingDuplicate(
        existingUpload,
        newUpload,
        [{ geo_id: "F1" }],
        [{ geo_id: "F1" }]
      )
      
      store.resolveDuplicate(0, "keep_both")
      
      expect(store.geojson.features).toHaveLength(2)
      const newFeature = store.geojson.features.find(f => f.properties.upload_id === "upload_2")
      expect(newFeature?.properties.geo_id).toBe("F1_copy")
      expect(store.pendingDuplicates).toHaveLength(0)
    })
  })

  describe("clear all data", () => {
    it("should clear all state", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([{ type: "Feature", geometry: {}, properties: {} }])
      store.addUpload("test.zip", "shapefile", 1, ["F1"])
      store.addPendingDuplicate(
        { id: "u1", name: "e", type: "shapefile", featureCount: 1, farmIds: [], timestamp: new Date() },
        { id: "u2", name: "n", type: "isoxml", featureCount: 1, farmIds: [], timestamp: new Date() },
        [],
        []
      )
      
      store.clearAllData()
      
      expect(store.geojson.features).toHaveLength(0)
      expect(store.uploads).toHaveLength(0)
      expect(store.pendingDuplicates).toHaveLength(0)
      expect(store.uploadCounter).toBe(0)
      expect(store.featureIdCounter).toBe(0)
    })
  })
})
