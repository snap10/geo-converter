<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('cancel')"></div>
    <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">
          GeoJSON exportieren
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ featureCount }} {{ featureCount === 1 ? 'Feld' : 'Felder' }} werden exportiert
        </p>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6">
        <div class="mb-4">
          <h4 class="font-medium mb-2">Eigenschafts-Zuordnung</h4>
          <p class="text-sm text-gray-500 mb-4">
            Wählen Sie, welche Eigenschaften im exportierten GeoJSON enthalten sein sollen und wie sie heißen sollen.
          </p>
          
          <div class="space-y-2">
            <div v-for="(mapping, index) in mappings" :key="index" class="flex items-center gap-2">
              <select
                v-model="mapping.source"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                @change="updateTargetName(index)"
              >
                <option value="">-- Auswählen --</option>
                <option v-for="prop in availableProperties" :key="prop" :value="prop">
                  {{ prop }}
                </option>
              </select>
              <span class="text-gray-400">→</span>
              <input
                v-model="mapping.target"
                type="text"
                placeholder="Neuer Name"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
              <button
                v-if="mappings.length > 1"
                type="button"
                class="p-2 text-red-500 hover:bg-red-50 rounded"
                @click="removeMapping(index)"
              >
                ✕
              </button>
            </div>
          </div>
          
          <button
            type="button"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
            @click="addMapping"
          >
            + Eigenschaft hinzufügen
          </button>
        </div>
        
        <div v-if="previewFeature" class="mt-6">
          <h4 class="font-medium mb-2">Vorschau</h4>
          <p class="text-sm text-gray-500 mb-2">
            So sieht das erste Feld nach der Transformation aus:
          </p>
          <pre class="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48">{{ formatJson(previewTransformedFeature) }}</pre>
        </div>
      </div>
      
      <div class="p-6 border-t flex justify-end gap-3">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          @click="handleExport"
        >
          Exportieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useGeojsonStore } from "@/store/geojson"

const props = defineProps<{
  isOpen: boolean
  featureCount: number
}>()

const emit = defineEmits<{
  export: [mappings: { source: string; target: string }[]]
  cancel: []
}>()

const geojsonStore = useGeojsonStore()

interface PropertyMapping {
  source: string
  target: string
}

const mappings = ref<PropertyMapping[]>([
  { source: "partfieldDesignator", target: "name" },
  { source: "partfieldArea", target: "area_ha" },
  { source: "farmName", target: "farm" },
])

const availableProperties = computed(() => {
  const props = new Set<string>()
  const features = geojsonStore.selectedCount > 0 
    ? geojsonStore.selectedFeatures 
    : geojsonStore.geojson.features
  
  features.forEach(feature => {
    if (feature.properties) {
      Object.keys(feature.properties).forEach(key => props.add(key))
    }
  })
  return Array.from(props).sort()
})

const previewFeature = computed(() => {
  const features = geojsonStore.selectedCount > 0 
    ? geojsonStore.selectedFeatures 
    : geojsonStore.geojson.features
  return features[0] || null
})

const previewTransformedFeature = computed(() => {
  if (!previewFeature.value) return null
  
  const result: Record<string, any> = {
    type: previewFeature.value.type,
    geometry: previewFeature.value.geometry,
    properties: {}
  }
  
  mappings.value.forEach(mapping => {
    if (mapping.source && mapping.target && previewFeature.value?.properties) {
      result.properties[mapping.target] = previewFeature.value.properties[mapping.source]
    }
  })
  
  return result
})

function formatJson(obj: any): string {
  return JSON.stringify(obj, null, 2)
}

function updateTargetName(index: number) {
  const source = mappings.value[index].source
  if (source && !mappings.value[index].target) {
    mappings.value[index].target = source
  }
}

function addMapping() {
  mappings.value.push({ source: "", target: "" })
}

function removeMapping(index: number) {
  mappings.value.splice(index, 1)
}

function handleExport() {
  const validMappings = mappings.value.filter(m => m.source && m.target)
  emit('export', validMappings)
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    mappings.value = [
      { source: "partfieldDesignator", target: "name" },
      { source: "partfieldArea", target: "area_ha" },
      { source: "farmName", target: "farm" },
    ]
  }
})
</script>
