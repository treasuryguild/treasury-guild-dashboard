<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "../store/index";
import { useGetAllStats } from "../composables/getallstats";
import Chart from "chart.js/auto";
import { Colors } from "chart.js";

Chart.register(Colors);

const store = useStore();
const route = useRoute();
let everyProject = [];
const allStats = ref();
const projectNames = ref([]);
const proposals = ref([]);
const treasuryWallets = ref([]);
const project_id = ref();
const labels = [];
const labelsData = [];
let wallets = [];
const group = route.params.group;

onMounted(() => {
  everyProject = JSON.parse(localStorage.getItem("allprojects"));
  window.scrollTo(0, 0);
  store.changeGroup(group);
  loadProjects();
  stats();
  setTimeout(function () {
    console.log("GView loading", store.group, everyProject);
  }, 1000);
});
async function loadProjects() {
  wallets = [];
  console.log("everyProject", everyProject);
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_type.includes("Proposal")) {
          proposals.value.push(everyProject[i].projects[j].project_name);
        } else {
          treasuryWallets.value.push(everyProject[i].projects[j].project_name);
        }
      }
    }
  }
  console.log("Lets go", proposals.value);
}
async function stats() {
  const { all_stats } = await useGetAllStats(store.group);
  allStats.value = all_stats.value;
  for (let i in allStats.value) {
    if (
      i != "" &&
      i != "Incoming" &&
      i != "Rewards Withdrawal" &&
      i != "Staking" &&
      i != "Internal transfer"
    ) {
      labels.push(i);
      labelsData.push(allStats.value[i]);
    }
  }
  console.log("all_stats.value", allStats.value, labels, labelsData);
  const label = labels;
  const data = {
    labels: label,
    datasets: [
      {
        label: "total tasks",
        data: labelsData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)", // color for first bar
          "rgba(54, 162, 235, 0.2)", // color for second bar
          "rgba(255, 206, 86, 0.2)", // color for third bar
          // add more colors here for additional bars
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)", // border color for first bar
          "rgba(54, 162, 235, 1)", // border color for second bar
          "rgba(255, 206, 86, 1)", // border color for third bar
          // add more border colors here for additional bars
        ],
        borderWidth: 1,
      },
    ],
  };
  const config = {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: {
          ticks: {
            color: "rgba(255, 255, 255, 0.87)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.87)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };
  const chart = new Chart(document.getElementById("myChart"), config);
}
</script>

<template>
  <main class="main">
    <div>
      <h2 class="group">{{ store.group }}</h2>
    </div>
    <div class="container">
      <div class="container-child">
        <h2>Choose a wallet</h2>
        <h3 v-if="treasuryWallets.length > 0">Treasury Wallets</h3>
        <RouterLink
          :to="`/${store.group}/${wallet}`"
          class="wallets"
          v-for="wallet in treasuryWallets"
          :key="wallet"
        >
          <div>{{ wallet }}</div>
        </RouterLink>
        <h3 v-if="proposals.length > 0">Proposals</h3>
        <RouterLink
          :to="`/${store.group}/${wallet}`"
          class="wallets"
          v-for="wallet in proposals"
          :key="wallet"
        >
          <div>{{ wallet }}</div>
        </RouterLink>
      </div>
      <div class="container-child">
        <h2>{{ store.group }} insights</h2>
        <div v-if="labels" class="stat1">
          <canvas id="myChart"></canvas>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.container-child {
  border-radius: 8px;
  flex-grow: 1;
  margin: 0.5em;
  padding: 0.5em;
  max-width: 800px;
}
.stat1 {
  border-radius: 8px;
  padding: 0.8em;
  margin: 0.8em;
}
.group {
  text-align: center;
}
</style>
