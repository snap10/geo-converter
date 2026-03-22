<template>
  <aside class="bg-gray-200 w-1/3 py-4 px-8 overflow-y-scroll h-screen">
    <h2 class="text-2xl font-bold mb-4">
      Toolbox
    </h2>
    <div>
      <h4
        class=" font-bold mb-4"
      >
        Importiere ESRI-Shapefile (ZIP)
      </h4>
      <form class="flex items-center space-x-6 mb-4">
        <label class="block">
          <input
            id="shapeFileInput"
            ref="shapeFileInput"
            type="file"
            class="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          "
            @change="loadShapeZipFile()"
          >
        </label>
      </form>
    </div>
    <div>
      <h4
        class="font-bold mb-4"
      >
        Importiere ISOXML-Taskdata (ZIP/XML)
      </h4>
      <form class="flex items-center space-x-6 mb-4">
        <label class="block">
          <input
            id="isoxmlFileInput"
            ref="isoxmlFileInput"
            type="file"
            class="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          "
            @change="loadIsoXmlFile()"
          >
        </label>
      </form>
    </div>
    <div>
      <h4
        class="text-xl font-bold mb-4"
      >
        Felder
      </h4>
      <div
        class="
        bg-white
        rounded-lg
        shadow
        overflow-x-auto"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fläche (ha)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Betrieb
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
<tr 
   v-for="(feature, index) in store.geojson.features" 
   :key="index"
   @click="console.log('Toolbox row clicked:', feature.properties.bez); zoomToFeature(feature)"
   class="cursor-pointer hover:bg-gray-100"
>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <div 
                    v-if="feature.properties.upload_id"
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: getColorFromString(feature.properties.upload_id), border: '1px solid ' + getContrastColor(getColorFromString(feature.properties.upload_id)) }"
                  ></div>
                  <div 
                    v-else-if="feature.properties.betrieb"
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: getOperationColor(feature.properties.betrieb), border: '1px solid #000000' }"
                  ></div>
                  <div 
                    v-else
                    class="w-3 h-3 rounded-full" 
                    style="backgroundColor: #ff7800; border: 1px solid #000000"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.bez }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.flaeche_ha }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.betriebName || feature.properties.betrieb || feature.properties.ud_id }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useGeojsonStore } from "@/store/geojson"
import { useIsoXmlStore } from "@/store/isoxml"
import { ref } from "vue"

const shapeFileInput = ref(null)
const store = useGeojsonStore()
const isoxmlStore = useIsoXmlStore()

const loadShapeZipFile = function() {
  console.log("fileInput", shapeFileInput)
  const f = shapeFileInput?.value?.files[0]
  console.log("file", f)
  if (f) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(f)
    reader.onload = function(event) {
      const fileContent = event?.target?.result
      store.parseShapeToGeoJson(fileContent)
    }
  } else {
    console.error("No file found", f)
  }
}

const isoxmlFileInput = ref(null)
const loadIsoXmlFile = function() {
  console.log("fileInput", isoxmlFileInput)
  const f = isoxmlFileInput?.value?.files[0]
  console.log("file", f)
  if (f) {
    const reader = new FileReader()
    reader.onload = function(event) {
      const fileContent = event?.target?.result
      isoxmlStore.parseAsGeoJson(fileContent, f.type)
    }
    if (f.type?.toLowerCase().includes("zip")) {
      console.log("reading as buffer")
      reader.readAsArrayBuffer(f)
    } else {
      console.log("reading as text")
      reader.readAsText(f)
    }
  } else {
    console.error("No file found", f)
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

// Emit an event to zoom to a feature (will be handled by parent component)
const zoomToFeature = (feature: any) => {
  console.log("Toolbox: Clicked on feature:", feature.properties.bez || feature.properties.feature_id)
  // Emit custom event that parent can listen to
  const event = new CustomEvent('zoom-to-feature', { 
    detail: { feature } 
  })
  document.dispatchEvent(event)
}
</script>
