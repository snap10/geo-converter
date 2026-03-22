<template>
  <main id="map" class="flex-1">
    <l-map
      ref="mapRef"
      :zoom="data.zoom"
      :center="data.center"
      :use-global-leaflet="false"
      @ready="onMapReady"
    >
      <l-tile-layer :url="data.url" layer-type="base" name="OpenStreetMap" />
      <l-geo-json :geojson="filteredGeoJson" :options="data.options" />
    </l-map>
  </main>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet"
import { ref, computed } from "vue"
import "leaflet/dist/leaflet.css"
import type { Map, LatLngBoundsExpression } from "leaflet"
import { useGeojsonStore } from "@/store/geojson"
import { useMapStore } from "@/store/map"

const geojsonStore = useGeojsonStore()
const mapStore = useMapStore()
const mapRef = ref(null)

const filteredGeoJson = computed(() => {
  if (geojsonStore.selectedCount === 0) {
    // Show nothing when nothing is selected
    return { type: "FeatureCollection", features: [] }
  }
  return {
    type: "FeatureCollection",
    features: geojsonStore.selectedFeatures
  }
})

// Reference to the geoJson layer to access individual feature layers
const geoJsonLayer = ref<LGeoJson | null>(null)

function onMapReady(map: any) {
  console.log("Map component: Map ready, storing in map store")
  mapStore.setMap(map)
  console.log("Map component: Map stored in store:", mapStore.map)
}

// Function to zoom to a feature and show its popup
function zoomToFeature(feature: any) {
  const map = mapStore.map
  if (!map || !geoJsonLayer.value) { return }
  console.log("Click to Zoom")
  // Find the layer corresponding to this feature
  // This is a simplified approach - in practice, you'd need to keep a mapping of features to layers
  // For now, we'll zoom to the feature's bounds and show a popup for the first matching feature

  // Create a temporary geoJSON layer to get bounds
  const tempLayer = L.geoJSON(feature)
  const bounds = tempLayer.getBounds() as LatLngBoundsExpression

  // Fit the map to the bounds
  map.fitBounds(bounds, { padding: [50, 50] })

  // Show popup for this feature (simplified - in practice you'd find the exact layer)
  if (feature.properties.partfieldDesignator) {
    // Create a popup content
    const popupContent = `Name: ${feature.properties.partfieldDesignator}</br>Area: ${feature.properties.partfieldArea} ha</br>Farm: ${feature.properties.farmName || feature.properties.farmId || feature.properties.ud_id}`

    // Open a popup at the center of the bounds
    const center = bounds.getCenter()
    map.openPopup(popupContent, center)
  }
}

// Function to generate a color from a string (like upload_id)
function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Convert hash to a color
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return `#${"00000".substring(0, 6 - c.length)}${c}`
}

// Function to adjust color brightness for better contrast
function getContrastColor(hexColor: string): string {
  // Remove the # if present
  const cleanHex = hexColor.replace("#", "")

  // Convert to RGB
  const r = parseInt(cleanHex.substr(0, 2), 16)
  const g = parseInt(cleanHex.substr(2, 2), 16)
  const b = parseInt(cleanHex.substr(4, 2), 16)

  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return black for bright colors, white for dark colors
  return brightness > 125 ? "#000000" : "#FFFFFF"
}

// Function to get border color based on area
function getBorderColorFromArea(areaHa: number | undefined): string {
  if (!areaHa) { return "#000000" } // Default black

  if (areaHa > 100) {
    return "#8B0000" // Dark red for large areas
  } else if (areaHa > 50) {
    return "#FF8C00" // Dark orange for medium areas
  } else {
    return "#000000" // Default black for small areas
  }
}

// Function to get farm color (same logic as Toolbox)
function getFarmColor(farmId: string | undefined): string {
  if (!farmId) return "#3388ff"
  if (geojsonStore.farmInfo.length === 1) return "#3388ff"
  return getColorFromString(farmId)
}

const data = ref({
  zoom: 12,
  center: [48.190, 9.89] as L.PointExpression,
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  options: {
    onEachFeature: function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
      if (feature.properties.partfieldDesignator) {
        layer.bindPopup(`Name: ${feature.properties.partfieldDesignator}</br>Area: ${feature.properties.partfieldArea} ha</br>Farm: ${feature.properties.farmName || feature.properties.farmId || feature.properties.ud_id}`)
      }

      // Apply dynamic styling based on farm
      let fillColor = "#3388ff" // Default Leaflet blue
      let color = "#000000" // Default black border

      if (feature.properties) {
        if (feature.properties.farmId) {
          fillColor = getFarmColor(feature.properties.farmId)
        } else if (feature.properties.upload_id) {
          fillColor = getColorFromString(feature.properties.upload_id)
        }

        // Border color based on area
        if (feature.properties.partfieldArea) {
          const area = parseFloat(feature.properties.partfieldArea)
          color = getBorderColorFromArea(area)
        }
      }

      // Apply the styles to the layer
      layer.setStyle({
        fillColor,
        color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      })
    },
  },
})
</script>
