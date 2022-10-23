<template>
  <div id="app">
    <MegrezComment :id="2" type="article" />
  </div>
</template>

<script>
import MegrezComment from './components/MegrezComment'

export default {
  name: 'app',
  components: {
    MegrezComment
  }
}
</script>

<style>
</style>
