<template>
  <main id="map" class="flex-1 h-screen">
    <l-map ref="map" :zoom="data.zoom" :center="data.center" :use-global-leaflet="false">
      <l-tile-layer :url="data.url" layer-type="base" name="OpenStreetMap" />
      <l-geo-json :geojson="geojson" :options="data.options" />
    </l-map>
  </main>
</template>

<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet"
import { ref, computed } from "vue"
import "leaflet/dist/leaflet.css"
import { useGeojsonStore } from "@/store/geojson"

const { geojson } = toRefs(useGeojsonStore())
const data = ref({
  zoom: 12,
  center: [48.190, 9.89] as L.PointExpression,
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  options: {}
})



</script>