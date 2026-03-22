import { defineStore } from "pinia"
import { ref } from "vue"
import * as L from "leaflet"
import type { Map } from "leaflet"

export const useMapStore = defineStore("map", {
  state: () => ({
    map: ref<Map | null>(null),
  }),
  actions: {
    setMap(map: Map) {
      this.map = map
    },
    zoomToFeature(feature: any) {
      const map = this.map
      if (!map) { 
        console.log("Map store: No map available")
        return 
      }
      console.log("Map store: Zoom to feature called")
      
      try {
        const tempLayer = L.geoJSON(feature)
        const bounds = tempLayer.getBounds()
        
        if (!bounds.isValid()) {
          console.log("Map store: Bounds are not valid")
          return
        }
        
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        
        if (!isFinite(ne.lat) || !isFinite(ne.lng) || !isFinite(sw.lat) || !isFinite(sw.lng)) {
          console.log("Map store: Bounds have non-finite values")
          return
        }
        
        const center = bounds.getCenter()
        const latSpan = ne.lat - sw.lat
        const lngSpan = ne.lng - sw.lng
        
        let zoom = 15
        if (latSpan < 0.001 || lngSpan < 0.001) {
          zoom = 18
        } else if (latSpan < 0.01 || lngSpan < 0.01) {
          zoom = 16
        } else if (latSpan < 0.1 || lngSpan < 0.1) {
          zoom = 14
        }
        
        console.log("Map store: Using flyTo with center:", center, "zoom:", zoom)
        map.flyTo(center, zoom, { duration: 0.5 })
        
        if (feature.properties && feature.properties.bez) {
          const popupContent = `Name:  ${feature.properties.bez}</br>Fläche: ${feature.properties.flaeche_ha} ha</br>Betrieb: ${feature.properties.betriebName || feature.properties.betrieb || feature.properties.ud_id}`
          setTimeout(() => {
            map.openPopup(popupContent, center)
          }, 600)
        }
      } catch (error) {
        console.error("Map store: Error in zoomToFeature:", error)
      }
    }
  },
})