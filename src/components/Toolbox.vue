<template>
  <aside class="bg-gray-200 w-1/4 py-4 px-8">
    <h2 class="text-2xl font-bold mb-4">
      Toolbox
    </h2>
    <input ref="fileInput" type="file" id="fileInput">
    <button class="button" v-on:click="loadFile()">Lade ShapeFile</button>
    <button class="button" v-on:click="loadIsoxml()">ISOXML Taskdata herunterladen</button>

  </aside>
  <modal ref="fileUploadModal">
    <file-upload-popup></file-upload-popup>
  </modal>
</template>
<script setup lang="ts">
import { useGeojsonStore } from '@/store/geojson';
import { useIsoXmlStore } from '@/store/isoxml';
import { writeFileSync } from 'fs'

const fileInput = ref(null)
const store = useGeojsonStore()
const loadFile = function () {
  console.log("fileInput", fileInput)
  const f = fileInput?.value?.files[0]
  console.log("file", f)
  if (f) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onload = function (event) {
      var fileContent = event?.target?.result;
      store.parseShapeToGeoJson(fileContent)
    }
  } else {
    console.error("No file found", f)
  }

}

const loadIsoxml = async function () {
  const xmlData = await useIsoXmlStore().createIsoXml()
  // create a Blob object from the byte array data
  const blob = new Blob([xmlData], { type: 'application/octet-stream' });

  // create a URL for the blob
  const url = URL.createObjectURL(blob);

  // create an anchor element with the URL as its href attribute
  const link = document.createElement('a');
  link.href = url;

  // set the download attribute to specify the filename
  link.download = "TaskData.zip";

  // simulate a click on the anchor element to open the download prompt
  link.click();

  // release the URL object
  URL.revokeObjectURL(url);
}
</script>
