import { setActivePinia, createPinia } from "pinia"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useMapStore } from "../map"

const mockMap = {
  flyTo: vi.fn(),
  openPopup: vi.fn(),
  getBoundsZoom: vi.fn(),
  fitBounds: vi.fn(),
  setView: vi.fn()
}

describe("useMapStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it("should initialize with null map", () => {
    const store = useMapStore()
    expect(store.map).toBeNull()
  })

  it("should set the map instance", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    expect(store.map).toStrictEqual(mockMap)
  })

  it("should not zoom when map is not available", () => {
    const store = useMapStore()
    const consoleSpy = vi.spyOn(console, "log")
    
    store.zoomToFeature({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
      properties: { partfieldDesignator: "Test Field" }
    })

    expect(consoleSpy).toHaveBeenCalledWith("Map store: No map available")
  })

  it("should handle invalid bounds gracefully", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    const consoleSpy = vi.spyOn(console, "log")
    
    const feature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: { partfieldDesignator: "Test Point" }
    }

    store.zoomToFeature(feature)

    expect(consoleSpy).toHaveBeenCalledWith("Map store: Zoom to feature called")
  })

  it("should calculate correct zoom level for small features", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    
    const smallFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[9.855, 48.151], [9.856, 48.151], [9.856, 48.152], [9.855, 48.152], [9.855, 48.151]]]
      },
      properties: { partfieldDesignator: "Small Field" }
    }

    store.zoomToFeature(smallFeature)

    expect(mockMap.flyTo).toHaveBeenCalled()
    const call = mockMap.flyTo.mock.calls[0]
    expect(call[1]).toBe(18)
  })

  it("should calculate correct zoom level for medium features", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    
    const mediumFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[9.8, 48.1], [9.9, 48.1], [9.9, 48.2], [9.8, 48.2], [9.8, 48.1]]]
      },
      properties: { partfieldDesignator: "Medium Field" }
    }

    store.zoomToFeature(mediumFeature)

    expect(mockMap.flyTo).toHaveBeenCalled()
    const call = mockMap.flyTo.mock.calls[0]
    expect(call[1]).toBe(14)
  })

  it("should calculate correct zoom level for larger features", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    
    const largeFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[9.5, 48.0], [10.0, 48.0], [10.0, 48.5], [9.5, 48.5], [9.5, 48.0]]]
      },
      properties: { partfieldDesignator: "Large Field" }
    }

    store.zoomToFeature(largeFeature)

    expect(mockMap.flyTo).toHaveBeenCalled()
    const call = mockMap.flyTo.mock.calls[0]
    expect(call[1]).toBe(15)
  })

  it("should open popup after flying to feature", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    
    const feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[9.8, 48.1], [9.9, 48.1], [9.9, 48.2], [9.8, 48.2], [9.8, 48.1]]]
      },
      properties: { 
        partfieldDesignator: "Test Field",
        partfieldArea: 1.5,
        farmName: "Farm A"
      }
    }

    vi.useFakeTimers()
    store.zoomToFeature(feature)
    vi.advanceTimersByTime(600)
    vi.useRealTimers()

    expect(mockMap.openPopup).toHaveBeenCalled()
  })

  it("should handle MultiPolygon geometry", () => {
    const store = useMapStore()
    store.setMap(mockMap as any)
    
    const multiPolygonFeature = {
      type: "Feature",
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
          [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]]
        ]
      },
      properties: { partfieldDesignator: "Multi Polygon Field" }
    }

    store.zoomToFeature(multiPolygonFeature)

    expect(mockMap.flyTo).toHaveBeenCalled()
  })
})
