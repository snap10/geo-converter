<template>
  <header class="bg-gray-800 text-white py-4 px-8 flex flex-row justify-between">
    <h1 class="text-3xl font-bold">
      Geo Converter
    </h1>
    <div class="">
      <button class="bg-blue-500  hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!geojson?.features?.length" @click="loadIsoxml()">
        ISOXML Taskdata herunterladen
      </button>
    </div>
  </header>
</template>
<script setup lang="ts">
import { useGeojsonStore } from "@/store/geojson"
import { useIsoXmlStore } from "@/store/isoxml"

const { geojson } = toRefs(useGeojsonStore())

const loadIsoxml = async function() {
  const xmlData = await useIsoXmlStore().createIsoXml()
  // create a Blob object from the byte array data
  const blob = new Blob([xmlData], { type: "application/octet-stream" })

  // create a URL for the blob
  const url = URL.createObjectURL(blob)

  // create an anchor element with the URL as its href attribute
  const link = document.createElement("a")
  link.href = url

  // set the download attribute to specify the filename
  link.download = "TaskData.zip"

  // simulate a click on the anchor element to open the download prompt
  link.click()

  // release the URL object
  URL.revokeObjectURL(url)
}
</script>
