<template>
  <Header>
    <div class="flex h-full">
      <Toolbox />
      <Map />
    </div>
  </Header>
</template>

<script setup>
  import { useMapStore } from "@/store/map"
  
  const mapStore = useMapStore()
  
  // Listen for zoom-to-feature events from the toolbox
  document.addEventListener('zoom-to-feature', (event) => {
    console.log("App: Received zoom-to-feature event")
    // Get the feature from the event detail
    const feature = event.detail.feature
    console.log("App: Feature received:", feature.properties.bez || feature.properties.feature_id)
    
    // Use the map store's zoomToFeature method
    mapStore.zoomToFeature(feature)
  })
</script>
