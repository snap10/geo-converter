<template>
  <div>
    <vue-dropzone ref="dropzone" :options="options" @vdropzone-success="onSuccess" />
  </div>
</template>

<script setup lang="ts">
import { useDropzone } from "vue3-dropzone"

const options = {
  url: "https://your-file-upload-api.com/upload",
  acceptedFileTypes: ".jpg,.jpeg,.png",
  maxFileSize: 2 * 1024 * 1024, // in bytes
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
}

const onSuccess = (file, response) => {
  console.log("file uploaded successfully:", file, response)
}

const dropzone = useDropzone()

const reset = () => {
  dropzone.value.removeAllFiles()
}
</script>
