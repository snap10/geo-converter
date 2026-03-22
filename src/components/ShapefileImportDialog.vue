<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center" style="z-index: 9999 !important;">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleCancel"></div>
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold">
            Shapefile importieren
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ featureCount }} {{ featureCount === 1 ? 'Feld' : 'Felder' }} werden importiert
          </p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div class="mb-4">
            <h4 class="font-medium mb-2">Eigenschafts-Zuordnung</h4>
            <p class="text-sm text-gray-500 mb-4">
              Ordnen Sie die Shapefile-Eigenschaften den gewünschten GeoJSON-Eigenschaften zu.
            </p>
            
            <div class="space-y-2">
              <div v-for="(mapping, index) in mappings" :key="index" class="flex items-center gap-2">
                <select
                  v-model="mapping.source"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">-- Auswählen --</option>
                  <option v-for="prop in availableProperties" :key="prop" :value="prop">
                    {{ prop }}
                  </option>
                </select>
                <span class="text-gray-400">→</span>
                <select
                  v-model="mapping.target"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">-- Auswählen --</option>
                  <option v-for="prop in targetProperties" :key="prop.value" :value="prop.value">
                    {{ prop.label }}
                  </option>
                </select>
              </div>
            </div>
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
            @click="handleCancel"
          >
            Abbrechen
          </button>
          <button
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            @click="handleImport"
          >
            Importieren
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

interface PropertyMapping {
  source: string
  target: string
}

interface TargetProperty {
  value: string
  label: string
}

const props = defineProps<{
  isOpen: boolean
  features: any[]
  featureCount: number
}>()

const emit = defineEmits<{
  import: [mappings: { source: string; target: string }[]]
  cancel: []
}>()

const mappings = ref<PropertyMapping[]>([
  { source: "", target: "geo_id" },
  { source: "", target: "partfieldDesignator" },
  { source: "", target: "partfieldArea" },
])

const targetProperties: TargetProperty[] = [
  { value: "geo_id", label: "geo_id (Feld-ID)" },
  { value: "partfieldDesignator", label: "partfieldDesignator (Feldname)" },
  { value: "partfieldArea", label: "partfieldArea (Fläche in ha)" },
  { value: "farmId", label: "farmId (Betriebs-ID)" },
  { value: "farmName", label: "farmName (Betriebsname)" },
  { value: "customerId", label: "customerId (Kunden-ID)" },
  { value: "customerName", label: "customerName (Kundenname)" },
]

const availableProperties = computed(() => {
  const propsSet = new Set<string>()
  if (props.features && props.features.length > 0) {
    props.features.forEach(feature => {
      if (feature.properties) {
        Object.keys(feature.properties).forEach(key => propsSet.add(key))
      }
    })
  }
  return Array.from(propsSet).sort()
})

const previewFeature = computed(() => {
  return props.features?.[0] || null
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

function handleImport() {
  const validMappings = mappings.value.filter(m => m.source && m.target)
  emit('import', validMappings)
}

function handleCancel() {
  emit('cancel')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    mappings.value = [
      { source: "", target: "geo_id" },
      { source: "", target: "partfieldDesignator" },
      { source: "", target: "partfieldArea" },
    ]
  }
})
</script>
