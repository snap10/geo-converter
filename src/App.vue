<template>
  <div>
    <Header />
    <div class="flex">
      <Toolbox />
      <Map />
    </div>
  </div>
</template>

<script setup>
// Listen for zoom-to-feature events from the toolbox
document.addEventListener('zoom-to-feature', (event) => {
  // Get the feature from the event detail
  const feature = event.detail.feature
  
  // Find the Map component and call its zoomToFeature method
  // This is a simplified approach - in a real app you might use a proper event bus or state management
  const mapElement = document.querySelector('#map')
  if (mapElement && mapElement.__vue__) {
    // Access the Vue instance and call its method
    mapElement.__vue__.$refs.map.zoomToFeature(feature)
  }
})
</script>
