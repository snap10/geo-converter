import { defineStore } from "pinia"
import { ref } from "vue"
import type { Map } from "leaflet"

export const useMapStore = defineStore("map", {
  state: () => ({
    map: ref<Map | null>(null),
  }),
  actions: {
    setMap(map: Map) {
      this.map = map
    },
  },
})