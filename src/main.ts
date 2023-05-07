import { createPinia } from "pinia"
import App from "./App.vue"
import "./assets/css/style.css"

function initialiseVue() {
  app.use(createPinia())
    .mount("#app")
    // useGeojsonStore().$patch({})
}

const app = createApp(App)
initialiseVue()
