import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson"

export function createTestFeature(overrides: Partial<Feature> = {}): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[9.85, 48.15], [9.86, 48.15], [9.86, 48.16], [9.85, 48.16], [9.85, 48.15]]]
    } as Polygon,
    properties: {},
    ...overrides
  } as Feature
}

export function createTestFeatureCollection(features: Feature[] = []): FeatureCollection {
  return {
    type: "FeatureCollection",
    features
  }
}

export function createMultiPolygonFeature(coords: number[][][], properties: Record<string, any> = {}): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: coords
    } as MultiPolygon,
    properties
  }
}

export function createPolygonFeature(coords: number[][], properties: Record<string, any> = {}): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: coords
    } as Polygon,
    properties
  }
}

export function randomizeCoordinates(coords: number[][], offset: number = 0.01): number[][] {
  return coords.map(coord => [
    coord[0] + (Math.random() - 0.5) * offset,
    coord[1] + (Math.random() - 0.5) * offset
  ])
}

export function anonymizeProperties(properties: Record<string, any>): Record<string, any> {
  const anonymized = { ...properties }
  
  if (anonymized.customerId) {
    anonymized.customerId = `CTR_ANON_${Math.random().toString(36).substring(7).toUpperCase()}`
  }
  if (anonymized.customerName) {
    anonymized.customerName = `Anonymous Customer ${Math.floor(Math.random() * 1000)}`
  }
  if (anonymized.farmId) {
    anonymized.farmId = `FRM_ANON_${Math.random().toString(36).substring(7).toUpperCase()}`
  }
  if (anonymized.farmName) {
    anonymized.farmName = `Anonymous Farm ${Math.floor(Math.random() * 1000)}`
  }
  if (anonymized.geo_id) {
    anonymized.geo_id = `test-${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}`
  }
  
  return anonymized
}
