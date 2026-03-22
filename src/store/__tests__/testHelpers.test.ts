import { describe, it, expect } from "vitest"
import { 
  createTestFeature, 
  createTestFeatureCollection,
  createMultiPolygonFeature,
  createPolygonFeature,
  randomizeCoordinates,
  anonymizeProperties
} from "@/test/fixtures/testHelpers"

describe("testHelpers", () => {
  describe("createTestFeature", () => {
    it("should create a feature with default values", () => {
      const feature = createTestFeature()
      
      expect(feature.type).toBe("Feature")
      expect(feature.geometry.type).toBe("Polygon")
      expect(feature.properties).toEqual({})
    })

    it("should override default values", () => {
      const feature = createTestFeature({
        properties: { bez: "Test Field", flaeche_ha: 1.5 }
      })
      
      expect(feature.properties.bez).toBe("Test Field")
      expect(feature.properties.flaeche_ha).toBe(1.5)
    })
  })

  describe("createTestFeatureCollection", () => {
    it("should create an empty FeatureCollection", () => {
      const fc = createTestFeatureCollection()
      
      expect(fc.type).toBe("FeatureCollection")
      expect(fc.features).toEqual([])
    })

    it("should create a FeatureCollection with features", () => {
      const feature1 = createTestFeature()
      const feature2 = createTestFeature()
      const fc = createTestFeatureCollection([feature1, feature2])
      
      expect(fc.features).toHaveLength(2)
    })
  })

  describe("createPolygonFeature", () => {
    it("should create a Polygon feature", () => {
      const coords = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
      const properties = { bez: "Test" }
      const feature = createPolygonFeature(coords, properties)
      
      expect(feature.geometry.type).toBe("Polygon")
      expect(feature.properties.bez).toBe("Test")
    })
  })

  describe("createMultiPolygonFeature", () => {
    it("should create a MultiPolygon feature", () => {
      const coords = [[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]]
      const properties = { bez: "MultiTest" }
      const feature = createMultiPolygonFeature(coords, properties)
      
      expect(feature.geometry.type).toBe("MultiPolygon")
      expect(feature.properties.bez).toBe("MultiTest")
    })
  })

  describe("randomizeCoordinates", () => {
    it("should randomize coordinates by offset", () => {
      const coords = [[9.85, 48.15], [9.86, 48.16]]
      const randomized = randomizeCoordinates(coords, 0.01)
      
      expect(randomized).toHaveLength(2)
      randomized.forEach(coord => {
        expect(coord[0]).toBeGreaterThan(9.84)
        expect(coord[0]).toBeLessThan(9.87)
        expect(coord[1]).toBeGreaterThan(48.14)
        expect(coord[1]).toBeLessThan(48.17)
      })
    })
  })

  describe("anonymizeProperties", () => {
    it("should anonymize kunde field", () => {
      const props = { kunde: "CTR1" }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.kunde).toMatch(/^CTR_ANON_/)
    })

    it("should anonymize kundenName field", () => {
      const props = { kundenName: "Max Mustermann" }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.kundenName).toMatch(/^Anonymer Kunde/)
    })

    it("should anonymize betrieb field", () => {
      const props = { betrieb: "FRM1" }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.betrieb).toMatch(/^FRM_ANON_/)
    })

    it("should anonymize betriebName field", () => {
      const props = { betriebName: "Musterhof" }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.betriebName).toMatch(/^Anonymer Betrieb/)
    })

    it("should anonymize geo_id field", () => {
      const props = { geo_id: "abc-123" }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.geo_id).toMatch(/^test-/)
    })

    it("should not modify unknown fields", () => {
      const props = { name: "Field 1", area: 100 }
      const anonymized = anonymizeProperties(props)
      
      expect(anonymized.name).toBe("Field 1")
      expect(anonymized.area).toBe(100)
    })
  })
})
