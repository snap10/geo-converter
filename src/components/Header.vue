<template>
  <div class="flex flex-col h-screen">
    <header class="bg-gray-800 text-white py-4 px-8 flex flex-row justify-between shrink-0">
      <h1 class="text-3xl font-bold">
        Geo Converter
      </h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-400">
          Lizenz: <a href="/LICENSE" target="_blank" class="underline hover:text-white">MIT / Apache-2.0</a>
        </span>
        <a href="https://github.com/snap10/geo-converter" target="_blank" class="text-gray-400 hover:text-white" title="GitHub Repository">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!geojson?.features?.length" @click="loadIsoxml()">
          ISOXML-Taskdata herunterladen
        </button>
      </div>
    </header>
    <div class="flex-1 overflow-hidden min-h-0">
      <slot />
    </div>
    <footer class="bg-gray-900 text-gray-400 py-3 px-8 text-sm shrink-0">
      <div class="flex justify-between items-center">
        <span>
          Open Source: 
          <a href="https://github.com/snap10/geo-converter" target="_blank" class="underline hover:text-white">GeoConverter</a>
          | Verwendet <a href="https://github.com/dev4Agriculture/isoxml-js" target="_blank" class="underline hover:text-white">isoxml-js</a> (Apache-2.0)
          | <a href="/TERMS.html" target="_blank" class="underline hover:text-white">Nutzungsbedingungen</a>
        </span>
        <span>
          <a href="/LICENSE" target="_blank" class="underline hover:text-white">MIT / Apache-2.0</a>
          | Verwendung auf eigene Gefahr
        </span>
      </div>
    </footer>
  </div>
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
