<template>
  <main id="map" class="flex-1 h-screen">
    <l-map
      ref="map"
      :zoom="data.zoom"
      :center="data.center"
      :use-global-leaflet="false"
    >
      <l-tile-layer :url="data.url" layer-type="base" name="OpenStreetMap" />
      <l-geo-json :geojson="geojson" :options="data.options" />
    </l-map>
  </main>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet"
import { ref } from "vue"
import "leaflet/dist/leaflet.css"
import { useGeojsonStore } from "@/store/geojson"

const { geojson } = toRefs(useGeojsonStore())

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

// Function to get color based on operation type
function getOperationColor(operation: string | undefined): string {
  if (!operation) { return "#ff7800" } // Default orange

  const operationColors: Record<string, string> = {
    "Operation A": "#ff0000", // Red
    "Operation B": "#00ff00", // Green
    "Operation C": "#0000ff", // Blue
  }

  return operationColors[operation] || "#ff7800"
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

const data = ref({
  zoom: 12,
  center: [48.190, 9.89] as L.PointExpression,
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  options: {
    onEachFeature: function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
      if (feature.properties.bez) {
        layer.bindPopup(`Name:  ${feature.properties.bez}</br>Fläche: ${feature.properties.flaeche_ha} ha</br>Betrieb: ${feature.properties.betriebName || feature.properties.betrieb || feature.properties.ud_id}`)
      }

      // Apply dynamic styling
      let fillColor = "#ff7800" // Default orange
      let color = "#000000" // Default black border

      // Generate consistent color based on upload_id for unique upload visualization
      if (feature.properties && feature.properties.upload_id) {
        fillColor = getColorFromString(feature.properties.upload_id)
        color = getContrastColor(fillColor)
        console.log("Styling feature with upload_id:", feature.properties.upload_id, "fillColor:", fillColor, "color:", color)
      } else if (feature.properties) {
        // Fallback to operation-based coloring if upload_id is not available
        // Color based on operation type
        if (feature.properties.betrieb) {
          fillColor = getOperationColor(feature.properties.betrieb)
        }

        // Border color based on area
        if (feature.properties.flaeche_ha) {
          const area = parseFloat(feature.properties.flaeche_ha)
          color = getBorderColorFromArea(area)
        }

        console.log("Styling feature with operation:", feature.properties.betrieb, "fillColor:", fillColor, "color:", color)
      } else {
        console.log("Styling feature with no properties, using defaults")
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
