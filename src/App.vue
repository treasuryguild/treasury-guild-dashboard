<script setup>
  import { onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useStore } from './store/index'
  import NavBar from './components/NavBar.vue'

  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const group = route.params.group
  const project = route.params.project

  onMounted(() => {
    //router.push('/')
  })
</script>

<template>
  <div>
  <div class="navbox">
    <NavBar class="navbar" />
  </div>
    <RouterView></RouterView>
  
  <!-- <Suspense>
    <ProjectUpdater />
  </Suspense> -->
  </div>
</template>

<style scoped>
.logo {
  height: 5em;
  padding: 0.2em;
  padding-right: 1.8em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.navbox {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.navbar {
  padding: 0.5em;
}
</style>
