<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('cancel')"></div>
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <h3 class="text-lg font-semibold mb-4">
        Download bestätigen
      </h3>
      <p class="text-gray-600 mb-6">
        Möchten Sie {{ featureCount }} {{ featureCount === 1 ? 'Feld' : 'Felder' }} herunterladen?
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          @click="$emit('confirm')"
        >
          Herunterladen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  featureCount: number
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
