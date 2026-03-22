<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center" style="z-index: 9999 !important;">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('cancel')"></div>
      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold">
            Feld bearbeiten
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ feature.properties?.partfieldDesignator || feature.properties?.feature_id }}
          </p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-4">
            <div v-for="(value, key) in editableProperties" :key="key">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ key }}
              </label>
              <input
                v-model="editedProperties[key]"
                :type="getInputType(value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                :disabled="isReadOnly(key)"
              >
            </div>
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
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            @click="handleSave"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

const props = defineProps<{
  isOpen: boolean
  feature: any | null
}>()

const emit = defineEmits<{
  save: [featureId: string, properties: Record<string, any>]
  cancel: []
}>()

const editedProperties = ref<Record<string, any>>({})

const editableProperties = computed(() => {
  if (!props.feature?.properties) return {}
  
  const excludedKeys = ['feature_id', 'upload_id', 'geo_id']
  const result: Record<string, any> = {}
  
  Object.entries(props.feature.properties).forEach(([key, value]) => {
    if (!excludedKeys.includes(key)) {
      result[key] = value
    }
  })
  
  return result
})

const readOnlyKeys = ['feature_id', 'upload_id', 'geo_id']

function isReadOnly(key: string): boolean {
  return readOnlyKeys.includes(key)
}

function getInputType(value: any): string {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'checkbox'
  return 'text'
}

function handleSave() {
  if (props.feature?.properties?.feature_id) {
    emit('save', props.feature.properties.feature_id, editedProperties.value)
  }
}

watch(() => props.feature, (newFeature) => {
  if (newFeature?.properties) {
    editedProperties.value = { ...newFeature.properties }
    readOnlyKeys.forEach(key => delete editedProperties.value[key])
  }
}, { immediate: true })
</script>
