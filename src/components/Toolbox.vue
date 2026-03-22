<template>
  <aside class="bg-gray-200 w-1/3 py-4 px-8 overflow-y-scroll">
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
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold">
          Felder
        </h4>
        <span class="text-sm text-gray-600">
          {{ store.selectedCount }} / {{ store.geojson.features.length }} ausgewählt
        </span>
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="store.allSelected"
                  :indeterminate="store.selectedCount > 0 && !store.allSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                >
              </th>
              <th class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fläche (ha)
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="relative group inline-block">
                  <button
                    type="button"
                    class="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    @click="showFarmDropdown = !showFarmDropdown"
                  >
                    Betrieb ▼
                  </button>
                  <div
                    v-if="showFarmDropdown"
                    class="absolute left-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200"
                  >
                    <div class="py-1">
                      <button
                        v-for="farm in store.availableFarms"
                        :key="farm"
                        type="button"
                        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        @click.stop="toggleFarmSelection(farm)"
                      >
                        <span>{{ farm }}</span>
                        <span v-if="isFarmSelected(farm)" class="text-green-600">✓</span>
                      </button>
                      <button
                        v-if="store.availableFarms.length > 0"
                        type="button"
                        class="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-200"
                        @click.stop="showFarmDropdown = false"
                      >
                        Schließen
                      </button>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="(feature, index) in store.geojson.features" 
              :key="index"
              :class="[
                'cursor-pointer hover:bg-blue-50',
                isSelected(feature.properties?.feature_id) ? 'bg-blue-100' : ''
              ]"
              @click="openEditDialog(feature)"
            >
              <td class="px-4 py-4 whitespace-nowrap" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(feature.properties?.feature_id)"
                  @change="toggleSelection(feature.properties?.feature_id)"
                  class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                >
              </td>
              <td class="px-2 py-4 whitespace-nowrap">
                {{ index + 1 }}
              </td>
              <td class="px-2 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <div 
                    v-if="feature.properties?.upload_id"
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: getColorFromString(feature.properties.upload_id), border: '1px solid ' + getContrastColor(getColorFromString(feature.properties.upload_id)) }"
                  ></div>
                  <div 
                    v-else-if="feature.properties?.farmId"
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: getOperationColor(feature.properties.farmId), border: '1px solid #000000' }"
                  ></div>
                  <div 
                    v-else
                    class="w-3 h-3 rounded-full" 
                    style="backgroundColor: #ff7800; border: 1px solid #000000"
                  ></div>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                {{ feature.properties?.partfieldDesignator || feature.properties?.feature_id }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                {{ feature.properties?.partfieldArea }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                {{ feature.properties?.farmName || feature.properties?.farmId || feature.properties?.ud_id }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <FeatureEditDialog
      :is-open="showEditDialog"
      :feature="editingFeature"
      @save="handleFeatureSave"
      @cancel="showEditDialog = false"
    />
  </aside>
</template>

<script setup lang="ts">
import { useGeojsonStore } from "@/store/geojson"
import { useIsoXmlStore } from "@/store/isoxml"
import { ref } from "vue"
import FeatureEditDialog from "./FeatureEditDialog.vue"

const shapeFileInput = ref(null)
const store = useGeojsonStore()
const isoxmlStore = useIsoXmlStore()
const showFarmDropdown = ref(false)
const showEditDialog = ref(false)
const editingFeature = ref<any>(null)

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

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return `#${"00000".substring(0, 6 - c.length)}${c}`
}

function getContrastColor(hexColor: string): string {
  const cleanHex = hexColor.replace("#", "")
  const r = parseInt(cleanHex.substr(0, 2), 16)
  const g = parseInt(cleanHex.substr(2, 2), 16)
  const b = parseInt(cleanHex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 125 ? "#000000" : "#FFFFFF"
}

function getOperationColor(operation: string | undefined): string {
  if (!operation) { return "#ff7800" }
  
  const operationColors: Record<string, string> = {
    "Operation A": "#ff0000",
    "Operation B": "#00ff00",
    "Operation C": "#0000ff",
  }
  
  return operationColors[operation] || "#ff7800"
}

function isSelected(featureId: string | undefined): boolean {
  if (!featureId) return false
  return store.isFeatureSelected(featureId)
}

function toggleSelectAll() {
  if (store.allSelected) {
    store.deselectAll()
  } else {
    store.selectAll()
  }
}

function toggleSelection(featureId: string | undefined) {
  if (featureId) {
    store.toggleSelection(featureId)
  }
}

function toggleFarmSelection(farmId: string) {
  store.toggleFarmSelection(farmId)
  showFarmDropdown.value = false
}

function isFarmSelected(farmId: string): boolean {
  const farmFeatures = store.geojson.features.filter(f => f.properties?.farmId === farmId)
  return farmFeatures.length > 0 && farmFeatures.every(f => store.isFeatureSelected(f.properties?.feature_id))
}

function openEditDialog(feature: any) {
  editingFeature.value = { ...feature }
  showEditDialog.value = true
}

function handleFeatureSave(featureId: string, properties: Record<string, any>) {
  store.updateFeature(featureId, properties)
  showEditDialog.value = false
  editingFeature.value = null
}
</script>
