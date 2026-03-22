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
    <div v-if="store.uploads.length > 0" class="mt-4">
      <h4 class="font-bold mb-2">
        Hochgeladene Dateien
      </h4>
      <ul class="space-y-2">
        <li
          v-for="upload in store.uploads"
          :key="upload.id"
          class="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
        >
          <div class="flex items-center gap-2 overflow-hidden">
            <span
              class="w-3 h-3 rounded-full flex-shrink-0"
              :style="{ backgroundColor: upload.type === 'shapefile' ? '#3498db' : '#2ecc71' }"
            ></span>
            <span class="text-sm truncate" :title="upload.name">{{ upload.name }}</span>
            <span class="text-xs text-gray-500">({{ upload.featureCount }})</span>
          </div>
          <button
            type="button"
            class="flex-shrink-0 text-red-500 hover:text-red-700 text-xs px-2 py-1"
            @click="confirmDeleteUpload(upload)"
          >
            ✕
          </button>
        </li>
      </ul>
    </div>
    <confirm-dialog
      v-if="uploadToDelete"
      :is-open="showDeleteConfirm"
      :title="'Datei löschen'"
      :message="`Möchten Sie '${uploadToDelete.name}' wirklich löschen? ${uploadToDelete.featureCount} Feld(er) werden entfernt.`"
      confirm-text="Löschen"
      cancel-text="Abbrechen"
      :danger="true"
      @confirm="handleDeleteUpload"
      @cancel="cancelDeleteUpload"
    />
    <farm-duplicate-dialog
      :is-open="showDuplicateDialog"
      :duplicate="currentDuplicate"
      @resolve="handleDuplicateResolve"
      @cancel="handleDuplicateCancel"
    />
    <div>
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-xl font-bold">
          Felder
        </h4>
        <span class="text-sm text-gray-600">
          {{ store.selectedCount }} / {{ store.geojson.features.length }} ausgewählt
        </span>
      </div>
      <div v-if="store.farmInfo.length > 0" class="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <div class="text-xs font-medium text-gray-500 uppercase mb-2">Nach Betrieb auswählen:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="farm in store.farmInfo"
            :key="farm.id"
            type="button"
            :style="{
              backgroundColor: isFarmFullySelected(farm.id) ? farm.color : 'transparent',
              borderColor: farm.color,
              color: isFarmFullySelected(farm.id) ? 'white' : farm.color
            }"
            class="px-3 py-1 text-sm rounded border-2 transition-colors hover:opacity-80"
            @click="toggleFarmSelection(farm.id)"
          >
            <span class="inline-block w-3 h-3 rounded-sm mr-1" :style="{ backgroundColor: farm.color }"></span>
            {{ farm.name }}
            <span class="ml-1 text-xs opacity-75">({{ getFarmFeatureCount(farm.id) }})</span>
          </button>
        </div>
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
              <td class="px-4 py-4 whitespace-nowrap">
                <div>{{ feature.properties?.partfieldDesignator || feature.properties?.feature_id }}</div>
                <div v-if="feature.properties?.geo_id" class="text-xs text-gray-400">{{ feature.properties?.geo_id }}</div>
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
import { ref, computed } from "vue"
import FeatureEditDialog from "./FeatureEditDialog.vue"
import FarmDuplicateDialog from "./FarmDuplicateDialog.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import type { Upload } from "@/store/geojson"
import { useGeojsonStore } from "@/store/geojson"
import { useIsoXmlStore } from "@/store/isoxml"

const shapeFileInput = ref(null)
const store = useGeojsonStore()
const isoxmlStore = useIsoXmlStore()
const showFarmDropdown = ref(false)
const showEditDialog = ref(false)
const editingFeature = ref<any>(null)

const showDeleteConfirm = ref(false)
const uploadToDelete = ref<Upload | null>(null)
const pendingFeatures = ref<{ features: any[]; uploadId: string } | null>(null)

const currentDuplicate = computed(() => 
  store.pendingDuplicates.length > 0 ? store.pendingDuplicates[0] : null
)
const showDuplicateDialog = computed(() => store.hasPendingDuplicates())

const extractGeoIds = (features: any[]): string[] => {
  const geoIds = new Set<string>()
  features.forEach(feature => {
    const geoId = feature.properties?.geo_id
    if (geoId) {
      geoIds.add(geoId)
    }
  })
  return Array.from(geoIds)
}

const loadShapeZipFile = function() {
  console.log("fileInput", shapeFileInput)
  const f = shapeFileInput?.value?.files[0]
  console.log("file", f)
  if (f) {
    const fileName = f.name
    const reader = new FileReader()
    reader.readAsArrayBuffer(f)
    reader.onload = async (event) => {
      const fileContent = event?.target?.result
      const geojson = await store.parseShapeToGeoJsonWithResult(fileContent)
      if (geojson && geojson.features) {
        const geoIds = extractGeoIds(geojson.features)
        const duplicateGeoIds = store.getDuplicateGeoIds(geoIds)
        
        if (duplicateGeoIds.length > 0 && store.geojson.features.length > 0) {
          const uploadId = store.addUpload(fileName, "shapefile", geojson.features.length, geoIds)
          const existingUpload = store.uploads.find(u => u.id !== uploadId)
          if (existingUpload) {
            store.addPendingDuplicate(
              existingUpload,
              store.getUploadById(uploadId)!,
              duplicateGeoIds,
              duplicateGeoIds
            )
            pendingFeatures.value = { features: geojson.features, uploadId }
          } else {
            store.addShapeFeatures(geojson.features, uploadId)
          }
        } else {
          const uploadId = store.addUpload(fileName, "shapefile", geojson.features.length, geoIds)
          store.addShapeFeatures(geojson.features, uploadId)
        }
      }
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
    const fileName = f.name
    const reader = new FileReader()
    reader.onload = async (event) => {
      const fileContent = event?.target?.result
      const geojson = await isoxmlStore.parseAsGeoJsonWithResult(fileContent, f.type)
      if (geojson && geojson.features) {
        const geoIds = extractGeoIds(geojson.features)
        const duplicateGeoIds = store.getDuplicateGeoIds(geoIds)
        
        if (duplicateGeoIds.length > 0 && store.geojson.features.length > 0) {
          const uploadId = store.addUpload(fileName, "isoxml", geojson.features.length, geoIds)
          const existingUpload = store.uploads.find(u => u.id !== uploadId)
          if (existingUpload) {
            store.addPendingDuplicate(
              existingUpload,
              store.getUploadById(uploadId)!,
              duplicateGeoIds,
              duplicateGeoIds
            )
            // Store features for later adding after resolution
            pendingFeatures.value = { features: geojson.features, uploadId }
          } else {
            isoxmlStore.addIsoXmlFeatures(geojson.features, uploadId, store.featureIdCounter)
          }
        } else {
          const uploadId = store.addUpload(fileName, "isoxml", geojson.features.length, geoIds)
          isoxmlStore.addIsoXmlFeatures(geojson.features, uploadId, store.featureIdCounter)
        }
      }
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

const confirmDeleteUpload = (upload: Upload) => {
  uploadToDelete.value = upload
  showDeleteConfirm.value = true
}

const handleDeleteUpload = () => {
  if (uploadToDelete.value) {
    store.removeUpload(uploadToDelete.value.id)
  }
  showDeleteConfirm.value = false
  uploadToDelete.value = null
}

const cancelDeleteUpload = () => {
  showDeleteConfirm.value = false
  uploadToDelete.value = null
}

const handleDuplicateResolve = (action: "keep_existing" | "keep_new" | "keep_both") => {
  if (store.pendingDuplicates.length > 0) {
    const duplicate = store.pendingDuplicates[0]
    
    if (action === "keep_existing") {
      // Remove new upload but don't add new features
      store.removeUpload(duplicate.newUpload.id)
    } else if (action === "keep_new") {
      // Remove existing, add new features
      store.removeUpload(duplicate.existingUpload.id)
      if (pendingFeatures.value) {
        isoxmlStore.addIsoXmlFeatures(pendingFeatures.value.features, pendingFeatures.value.uploadId, store.featureIdCounter)
      }
    } else if (action === "keep_both") {
      // Add new features (with renamed IDs handled elsewhere)
      if (pendingFeatures.value) {
        isoxmlStore.addIsoXmlFeatures(pendingFeatures.value.features, pendingFeatures.value.uploadId, store.featureIdCounter)
      }
    }
    
    store.pendingDuplicates = []
    pendingFeatures.value = null
  }
}

const handleDuplicateCancel = () => {
  if (store.pendingDuplicates.length > 0) {
    const newUpload = store.pendingDuplicates[0].newUpload
    store.removeUpload(newUpload.id)
    store.pendingDuplicates = []
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

function isFarmFullySelected(farmId: string): boolean {
  const farmFeatures = store.geojson.features.filter(f => f.properties?.farmId === farmId)
  return farmFeatures.length > 0 && farmFeatures.every(f => store.isFeatureSelected(f.properties?.feature_id))
}

function isFarmPartiallySelected(farmId: string): boolean {
  const farmFeatures = store.geojson.features.filter(f => f.properties?.farmId === farmId)
  if (farmFeatures.length === 0) return false
  const selectedCount = farmFeatures.filter(f => store.isFeatureSelected(f.properties?.feature_id)).length
  return selectedCount > 0 && selectedCount < farmFeatures.length
}

function getFarmFeatureCount(farmId: string): number {
  return store.geojson.features.filter(f => f.properties?.farmId === farmId).length
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
