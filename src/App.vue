<template>
  <div id="app">
    <Index/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Index from "./components/index.vue"
export default {
  name: 'App',
  components: {
    HelloWorld,
    Index,
  }
}
</script>
