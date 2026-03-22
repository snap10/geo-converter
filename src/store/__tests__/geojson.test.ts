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
      
      store.toggleSelection(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(true)
      
      store.toggleSelection(featureId)
      expect(store.isFeatureSelected(featureId)).toBe(false)
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
      
      store.toggleFarmSelection("FRM1")
      expect(store.selectedCount).toBe(2)
      
      store.toggleFarmSelection("FRM1")
      expect(store.selectedCount).toBe(0)
    })

    it("should return selected features", () => {
      const store = useGeojsonStore()
      
      store.addFeatures([
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 1" } },
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 2" } },
        { type: "Feature", geometry: { type: "Polygon" }, properties: { name: "Field 3" } }
      ])
      
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
  })
})
