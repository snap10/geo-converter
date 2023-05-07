<template>
  <aside class="bg-gray-200 w-1/3 py-4 px-8 overflow-y-scroll h-screen">
    <h2 class="text-2xl font-bold mb-4">
      Toolbox
    </h2>
    <div>
      <h4
        class=" font-bold mb-4"
      >
        Importiere Fiona Shape (ZIP)
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
        Importiere Isoxml TASKDATA (ZIP/XML)
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
    <div>
      <h4
        class="text-xl font-bold mb-4"
      >
        Felder
      </h4>
      <div
        class="
        bg-white
        rounded-lg
        shadow
        overflow-x-auto"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fläche (Ha)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Betrieb
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(feature, index) in store.geojson.features" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.bez }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.flaeche_ha }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ feature.properties.betriebName || feature.properties.betrieb || feature.properties.ud_id }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { useGeojsonStore } from "@/store/geojson"
import { useIsoXmlStore } from "@/store/isoxml"

const shapeFileInput = ref(null)
const store = useGeojsonStore()
const isoxmlStore = useIsoXmlStore()
const loadShapeZipFile = function() {
  console.log("fileInput", shapeFileInput)
  const f = shapeFileInput?.value?.files[0]
  console.log("file", f)
  if (f) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(f)
    reader.onload = function(event) {
      const fileContent = event?.target?.result
      store.parseShapeToGeoJson(fileContent)
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
    const reader = new FileReader()
    reader.onload = function(event) {
      const fileContent = event?.target?.result
      isoxmlStore.parseAsGeoJson(fileContent, f.type)
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
</script>
