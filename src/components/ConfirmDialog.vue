<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleCancel"></div>
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold" :class="danger ? 'text-red-600' : 'text-gray-900'">
            {{ title }}
          </h3>
        </div>
        <div class="p-6">
          <p class="text-gray-600">
            {{ message }}
          </p>
        </div>
        <div class="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            :class="[
              'px-4 py-2 rounded-md text-white',
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            ]"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>
