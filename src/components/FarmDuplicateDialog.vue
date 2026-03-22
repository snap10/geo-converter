<template>
    <Teleport to="body">
    <div v-if="isOpen && duplicate" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleCancel" />
      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-yellow-600">
            ⚠️ Doppelte Felder erkannt
          </h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <p class="text-gray-600 mb-4">
            In der neuen Datei "{{ duplicate.newUpload.name }}" wurden Felder mit gleichen geo_id wie in "{{ duplicate.existingUpload.name }}" gefunden.
          </p>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="border rounded-lg p-4 bg-gray-50">
              <h4 class="font-medium mb-2">Vorhandene Datei</h4>
              <p class="text-sm text-gray-600">{{ duplicate.existingUpload.name }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ duplicate.existingUpload.featureCount }} Felder</p>
              <div class="mt-2">
                <span class="text-xs font-medium">geo_id:</span>
                <ul class="text-xs text-gray-600 mt-1">
                  <li v-for="geoId in duplicate.existingFarmIds" :key="geoId" class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getFarmColor(geoId) }"></span>
                    {{ geoId }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="border rounded-lg p-4 bg-yellow-50">
              <h4 class="font-medium mb-2">Neue Datei</h4>
              <p class="text-sm text-gray-600">{{ duplicate.newUpload.name }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ duplicate.newUpload.featureCount }} Felder</p>
              <div class="mt-2">
                <span class="text-xs font-medium">geo_id:</span>
                <ul class="text-xs text-gray-600 mt-1">
                  <li v-for="geoId in duplicate.newFarmIds" :key="geoId" class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getFarmColor(geoId) }"></span>
                    {{ geoId }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p class="text-sm text-gray-500">
            Bitte wählen Sie, wie Sie fortfahren möchten:
          </p>
        </div>
        
        <div class="p-6 border-t flex flex-col gap-2">
          <button
            class="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-between"
            @click="handleResolve('keep_existing')"
          >
            <span>Nur vorhandene behalten</span>
            <span class="text-xs text-gray-500">({{ duplicate.existingUpload.name }} behalten)</span>
          </button>
          <button
            class="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-between"
            @click="handleResolve('keep_new')"
          >
            <span>Neue Datei behalten</span>
            <span class="text-xs text-gray-500">({{ duplicate.newUpload.name }} ersetzt vorhandene)</span>
          </button>
          <button
            class="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-between"
            @click="handleResolve('keep_both')"
          >
            <span>Beide behalten</span>
            <span class="text-xs text-gray-500">(Betriebs-IDs werden kopiert)</span>
          </button>
          <button
            class="w-full px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            @click="handleCancel"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PendingDuplicate } from "@/store/geojson"
import { useGeojsonStore } from "@/store/geojson"
import { FARM_COLORS } from "@/store/geojson"

const FARM_LOCAL_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
  "#1abc9c", "#e67e22", "#34495e", "#16a085", "#c0392b",
  "#2980b9", "#27ae60", "#d35400", "#8e44ad", "#0d8195",
  "#f1c40f", "#2c3e50", "#7f8c8d", "#95a5a6", "#bdc3c7",
]

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return FARM_LOCAL_COLORS[Math.abs(hash) % FARM_LOCAL_COLORS.length]
}

function getFarmColor(farmId: string): string {
  return getColorFromString(farmId)
}

const props = defineProps<{
  isOpen: boolean
  duplicate: PendingDuplicate | null
}>()

const emit = defineEmits<{
  resolve: [action: "keep_existing" | "keep_new" | "keep_both"]
  cancel: []
}>()

function handleResolve(action: "keep_existing" | "keep_new" | "keep_both") {
  emit('resolve', action)
}

function handleCancel() {
  emit('cancel')
}
</script>
