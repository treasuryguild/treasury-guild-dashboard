<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "../store/index";
import { supabase } from "../supabase";

//Navbar javascript below
const route = useRoute();
const store = useStore();
const group = route.params.group;
const project = route.params.project;
const home = route.params.home;
const selGroup = ref();
const orgEl = "treasuryguild";
const repoEl = "treasury-system-v4";
const projectJ = ref("");
const fundJ = ref("");
const poolJ = ref("");
const loadGroup = ref(false);
//const { projects, projectData, projectNames } = await useGetAllProjects()
onMounted(() => {
  setTimeout(function () {
    //console.log("Navbar params", store.group);
  }, 2000);
  //
});
function onChange3() {
  loadGroup.value = false;
}
</script>

<template>
  <nav>
    <menu>
      <menuitem @click="store.$reset"
        ><RouterLink to="/" @click="onChange3()">Home</RouterLink></menuitem
      >
      <menuitem v-if="route.path.startsWith(`/${store.group}/${store.project}`)"
        ><RouterLink :to="`/${store.group}`"
          >Back to {{ store.group }}</RouterLink
        ></menuitem
      >
      <menuitem v-if="route.path.startsWith(`/transactions/`) && store.project != ''"
        ><RouterLink :to="`/${store.group}/${store.project}`"
          >View all {{ store.project }} transactions</RouterLink
        ></menuitem
      >
      <menuitem
        ><RouterLink to="/transactions/entertx" @click="onChange3()"
          >Transaction</RouterLink
        ></menuitem
      >
      <menuitem
        ><RouterLink to="/wallet" @click="onChange3()"
          >Wallet</RouterLink
        ></menuitem
      >
    </menu>
  </nav>
</template>

<style scoped>
html,
body {
  padding: 0px;
  margin: 0px;
  background: #191a1d;
  font-family: "Karla", sans-serif;
  width: 100vw;
}
body * {
  margin: 0;
  padding: 0;
}
/* HTML Nav Styles */
/* HTML Nav Styles */
/* HTML Nav Styles */
nav menuitem {
  position: relative;
  display: block;
  opacity: 0;
  cursor: pointer;
}
nav menuitem > menu {
  position: absolute;
  pointer-events: none;
}
nav > menu {
  display: flex;
}

@media (max-width: 1150px) {
  menu {
    flex-direction: column;
  }
}

nav > menu > menuitem {
  pointer-events: all;
  opacity: 1;
}
menu menuitem a {
  white-space: nowrap;
  display: block;
}

menuitem:hover > menu {
  pointer-events: initial;
}
nav {
  margin-top: 20px;
  margin-left: 20px;
}
nav a {
  background: rgb(23, 74, 193);
  color: #fff;
  min-width: 190px;
  transition: background 0.5s, color 0.5s, transform 0.5s;
  margin: 0px 6px 6px 0px;
  padding: 8px 40px;
  box-sizing: border-box;
  border-radius: 3px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
}
nav a:hover:before {
  content: "";
  top: 0;
  left: 0;
  position: absolute;
  background: rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
}
</style>
