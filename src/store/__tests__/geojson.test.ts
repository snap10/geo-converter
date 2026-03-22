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
})
