<script setup>
import { onMounted, ref, watch } from 'vue' 
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import { useStore } from '../store/index'
import { useGetAllProjects } from '../composables/getallprojects'

const loading = ref(true)
const group_updated_at = ref([])
const groupname = ref([])
const groupid = ref([])
const logo_url = ref([])
const sortedgroupname = ref([])
const allProjects = ref({})
let everyProject = []
const store = useStore()
let lastRefresh = 0

onMounted(() => {
    lastRefresh = parseInt(localStorage.getItem("refreshtime"))?parseInt(localStorage.getItem("refreshtime")):0;
    //localStorage.removeItem("allprojects"); 
    everyProject = JSON.parse(localStorage.getItem("allprojects"));
    store.changeAllProjects(everyProject)
    if (everyProject == null) { // all_projects == null
      getGroups()
    } else {
      getMenu()
    }
    setTimeout(function() {
      if (parseInt(lastRefresh) < parseInt(Date.now()) - 300000) {
        localStorage.setItem("refreshtime", Date.now());
        lastRefresh = Date.now()
        console.log('PView loading', everyProject, Date.now());
        getGroups()
      }
    }, 1000);
  })

async function getGroups() {
    const { all_projects } = await useGetAllProjects()
    allProjects.value = all_projects.value
    everyProject = JSON.parse(localStorage.getItem("allprojects"));
    await getMenu()
  }

async function getMenu() {
  groupname.value = []
  logo_url.value = []
  for (let i in store.allprojects) {
    groupname.value.push(store.allprojects[i].group_name)
    if (store.allprojects[i].logo_url) {
        logo_url.value.push(store.allprojects[i].logo_url)
      } else {
        logo_url.value.push("https://vgfuwxqfnkkqwyyospxi.supabase.co/storage/v1/object/sign/orgprofiles/teamwork.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJvcmdwcm9maWxlcy90ZWFtd29yay5wbmciLCJpYXQiOjE2NzYyNjQxMTcsImV4cCI6MTcwNzgwMDExN30.aJiWDJb9ikkW9wqjGk3Y2JGsJw__5h87DSRy9q2DEik&t=2023-02-13T04%3A55%3A17.494Z")
      }
  }
  sortedgroupname.value = groupname.value.slice().sort();
}
</script>

<template>
    <main>
      <div class="cardcontainer"> 
        <RouterLink :to="`/${group}`" class="groups" v-for="group in sortedgroupname" :key="group">
          <div class="images">
            <img :src="logo_url[groupname.indexOf(group)]" alt="An example image">
          </div>
          <div class="groupnames">{{ group }}</div>
        </RouterLink>
      </div>
    </main>
    <footer>
      <a class="tribute" v-if="loading == false" href="https://www.flaticon.com/free-icons/organization" title="organization icons">Organization icons created by xnimrodx - Flaticon</a>
    </footer>
</template>

<style scoped>

.cardcontainer {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
}
.groups {
    margin: 0.5em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.6em;
    width: 150px;
    height: 150px; /* add the height property */
    
    border-radius: 8px;
}
.groupnames {
    font-size: 14px;
    text-align: center;
}

.images img {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.2em;
    width: 6em;
    height: 6em;
    object-fit:contain;
    will-change: filter;
}
.images img:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.tribute {
  font-size: 10px;
}
</style>