<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "../store/index";
import { useGetWallet } from "../composables/getwallet";
import { useGetAllStats } from "../composables/getallstats";
import { useGetProject } from "../composables/getproject";
import { useGetAllProjects } from "../composables/getallprojects";
import { useGetTransactions } from "../composables/gettransactions";
import { useGetContributions } from "../composables/getcontributions";
import { useGetAllContributions } from "../composables/getallcontributions";
import { useGetDistributions } from "../composables/getdistributions";
import { useGetAllDistributions } from "../composables/getalldistributions";
import { useGetAllStatsPerWallet } from "../composables/allstatsperwallet";
import Chart from "chart.js/auto";
import { Colors } from "chart.js";

Chart.register(Colors);
let chart = null;

const store = useStore();
const route = useRoute();

const loading = ref(false);
let totaltxs = ref(0);
let totalIn = ref("");
let totalOut = ref("");
let totalFees = ref(0);
let balance = ref("");
let totalPayouts = ref(0);
const lovelaceR = ref();

let labels = [];
let labelsData = [];
let projectLabels = [];
let projectLabelsData = [];
let projectId = "";
const allStats = ref();
const allStats2 = ref();

const txrows = ref([]);
const header = ref([]);
const tableHeader = ref([]);
const headerTokens = ref([]);
const tokenrows = ref([]);
const amountrows = ref([]);

const project_idRender = ref("");
const walletRender = ref("");
const group_idRender = ref("");
const websiteRender = ref("");
const project_typeRender = ref("");
const budget_itemsRender = ref("");

const txId = ref([]);
const transactionId = ref([]);
const transactionDate = ref([]);
const txType = ref({});
const exchangeRate = ref([]);
const recipientsR = ref([]);
const txJsonUrl = ref([]);
const txTotalTokens = ref([]);
const txTotalAmounts = ref([]);
const feeR = ref([]);
const walletBalanceAfter = ref([]);

const contributionId = ref([]);
const taskCreator = ref([]);
const taskName = ref([]);
const taskLabel = ref([]);
const taskDescription = ref([]);
const taskType = ref([]);

const all_contributionId = ref([]);
const all_transactionId = ref([]);
const all_taskCreator = ref([]);
const all_taskName = ref([]);
const all_taskLabel = ref([]);
const all_taskDescription = ref([]);
const all_taskType = ref([]);

const distId = ref([]);
const contributorId = ref([]);
const tokensR = ref([]);
const amountsR = ref([]);
const agixR = ref([]);

const allProjects = ref({});
let everyProject = [];
let lastRefresh3 = [];
let tableRows = [];
let tableHeaders = [];

const group = route.params.group;
const project = route.params.project;

onMounted(async () => {
  loading.value = true;
  store.changeGroup(group);
  store.changeProject(project);
  lastRefresh3 = parseInt(localStorage.getItem("refreshtime3"))
    ? parseInt(localStorage.getItem("refreshtime3"))
    : 0;
  if (parseInt(lastRefresh3) < parseInt(Date.now()) - 300000) {
    localStorage.setItem("refreshtime3", Date.now());
    lastRefresh3 = Date.now();
    localStorage.removeItem("allprojects");
    //console.log("projectDate", Date.now());
    await getGroups();
    await getProjectDetails();
  }
  //localStorage.removeItem("allprojects");
  everyProject = JSON.parse(localStorage.getItem("allprojects"));
  if (everyProject == null || everyProject.length == 0) {
    //console.log("Its null", everyProject)
    localStorage.removeItem("allprojects");
    await getGroups();
    store.changeAllProjects(everyProject);
    await stats2();
    await getProjectDetails();
    //console.log("now its not", everyProject)
  } else {
    //console.log("Its not null", everyProject)
  }
  store.changeAllProjects(everyProject);

  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          txrows.value = everyProject[i].projects[j].txrows;
          header.value = everyProject[i].projects[j].header;
          totalPayouts.value = everyProject[i].projects[j].total_payouts;
          totaltxs.value = everyProject[i].projects[j].total_txs;
          totalIn.value = everyProject[i].projects[j].total_in;
          totalOut.value = everyProject[i].projects[j].total_out;
          totalFees.value = everyProject[i].projects[j].total_fees;
          lovelaceR.value = everyProject[i].projects[j].balance;
          projectLabels = everyProject[i].projects[j].stat_labels;
          projectLabelsData = everyProject[i].projects[j].stat_labels_data;
          projectId = everyProject[i].projects[j].project_id;
        }
      }
    }
  }
  if (txrows.value == undefined) {
    await getProjectDetails();
  }
  if (projectLabels) {
    await projectChart();
    //console.log("passed");
  } else {
    await stats();
    await projectChart();
  }
  //console.log("PView loading", txrows.value, header.value);
  //await getProjectDetails();
  loading.value = false;
});

async function getGroups() {
  const { all_projects } = await useGetAllProjects();
  allProjects.value = all_projects.value;
  everyProject = JSON.parse(localStorage.getItem("allprojects"));
}
async function stats2() {
  labels = [];
  labelsData = [];
  const { all_stats } = await useGetAllStats(store.group);
  allStats2.value = all_stats.value;
  const sortedKeys = Object.keys(allStats2.value).sort();
  const sortedObj = {};
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    sortedObj[key] = allStats2.value[key];
  }
  allStats2.value = sortedObj;

  for (let i in allStats2.value) {
    if (
      i != "" &&
      i != "Incoming" &&
      i != "Rewards Withdrawal" &&
      i != "Staking" &&
      i != "Internal transfer"
    ) {
      labels.push(i);
      labelsData.push(allStats2.value[i]);
    }
  }
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      everyProject[i].stat_labels = labels;
      everyProject[i].stat_labels_data = labelsData;
    }
  }
  localStorage.setItem("allprojects", JSON.stringify(everyProject));
  //localStorage.setItem("projectlabels", JSON.stringify(labels));
  //localStorage.setItem("projectlabelsdata", JSON.stringify(labelsData));
  //console.log("all_stats.value", allStats2.value, labels, labelsData);
}

async function getProjectDetails() {
  // still busy building and testing
  txrows.value = [];
  totalPayouts.value = 0;
  totaltxs.value = 0;
  totalFees.value = 0;
  totalIn.value = 0;
  totalOut.value = 0;
  header.value = [
    "Date",
    "TxType",
    "ExchangeRate",
    "Recipients",
    "TxView",
    "Metadata",
    "Fees",
    "Balance",
  ];
  //tableHeader.value = ['Date','TxType','ExchangeRate','Recipients','Link','Fees','ADA','Balance']
  headerTokens.value = [];
  tokenrows.value = [];
  amountrows.value = [];
  txType.value = {};

  const { project_id, wallet, group_id, website, project_type, budget_items } =
    await useGetProject();
  project_idRender.value = project_id.value;
  walletRender.value = wallet.value;
  group_idRender.value = group_id.value;
  websiteRender.value = website.value;
  project_typeRender.value = project_type.value;
  budget_itemsRender.value = budget_items.value;

  const { lovelace, tokens, tokenAmounts, nfts, nftPicture } =
    await useGetWallet(walletRender.value);
  lovelaceR.value = parseFloat(lovelace.value).toFixed(2);
  const {
    tx_id,
    transaction_id,
    transaction_date,
    exchange_rate,
    tx_json_url,
    total_tokens,
    total_amounts,
    recipients,
    wallet_balance_after,
    fee,
  } = await useGetTransactions(project_idRender.value);
  txId.value = tx_id.value;
  transactionId.value = transaction_id.value;
  transactionDate.value = transaction_date.value;
  exchangeRate.value = exchange_rate.value;
  recipientsR.value = recipients.value;
  feeR.value = fee.value;
  walletBalanceAfter.value = wallet_balance_after.value;
  txJsonUrl.value = tx_json_url.value;
  txTotalTokens.value = total_tokens.value;
  txTotalAmounts.value = total_amounts.value;
  const {
    all_contribution_id,
    all_transaction_id,
    all_task_creator,
    all_task_name,
    all_task_label,
    all_task_description,
    all_task_type,
  } = await useGetAllContributions(project_idRender.value);
  all_contributionId.value = all_contribution_id.value;
  all_transactionId.value = all_transaction_id.value;
  all_taskCreator.value = all_task_creator.value;
  all_taskName.value = all_task_name.value;
  all_taskLabel.value = all_task_label.value;
  all_taskDescription.value = all_task_description.value;
  all_taskType.value = all_task_type.value;
  const { all_dist_id, all_contributor_id } = await useGetAllDistributions(
    project_idRender.value
  );
  distId.value = all_dist_id.value;
  contributorId.value = all_contributor_id.value;
  /*console.log(
    "test dist tokens",
    tokens.value,
    tokenAmounts.value,
    nfts.value,
    nftPicture.value
  );*/
  totalPayouts.value = distId.value.length;
  totaltxs.value = txId.value.length;
  for (let k in all_transactionId.value) {
    txType.value[all_transactionId.value[k]] = all_taskType.value[k];
  }
  //console.log("txtypes", txType.value);

  for (let j in txTotalTokens.value) {
    for (let i in txTotalTokens.value[j]) {
      //console.log("test tokens", txTotalTokens.value[j][i]);
      if (!headerTokens.value.includes(txTotalTokens.value[j][i])) {
        headerTokens.value.push(txTotalTokens.value[j][i]);
        header.value.push(txTotalTokens.value[j][i].toUpperCase());
        /*if (txTotalTokens.value[j][i].toUpperCase() != "ADA") {
            tableHeader.value.push(txTotalTokens.value[j][i].toUpperCase())
          } */
      }
    }
  }

  for (let i in txId.value) {
    txrows.value[i] = {
      Txid: "",
      TransactionId: "",
      Date: "",
      ExchangeRate: "",
      Recipients: "",
      TxView: "",
      Metadata: "",
      TxType: "",
      Fees: "",
      Balance: "",
    };

    for (let j in txTotalTokens.value[i]) {
      txrows.value[i][txTotalTokens.value[i][j].toUpperCase()] =
        txTotalAmounts.value[i][j];
    }

    if (
      txType.value[txId.value[i]] == "Incoming" ||
      txType.value[txId.value[i]] == "Rewards Withdrawal"
    ) {
      totalIn.value = totalIn.value + parseFloat(txrows.value[i].ADA);
    } else {
      if (txrows.value[i].ADA > 0) {
        totalOut.value = totalOut.value + parseFloat(txrows.value[i].ADA);
      }
    }
    totalFees.value = totalFees.value + parseFloat(feeR.value[i]) / 1000000;
    txrows.value[i].Txid = txId.value[i];
    txrows.value[i].TransactionId = transactionId.value[i];
    txrows.value[i].Date = new Date(
      parseInt(transactionDate.value[i])
    ).toDateString();
    txrows.value[i].ExchangeRate = exchangeRate.value[i];
    txrows.value[i].Recipients = recipientsR.value[i];
    txrows.value[i].TxType =
      txType.value[txId.value[i]] == "Incoming" ||
      txType.value[txId.value[i]] == "Rewards Withdrawal"
        ? txType.value[txId.value[i]]
        : "";
    txrows.value[i].TxView = transactionId.value[i];
    txrows.value[i].Metadata = txJsonUrl.value[i];
    txrows.value[i].Fees = parseFloat(feeR.value[i]) / 1000000;
    txrows.value[i].Balance = parseFloat(walletBalanceAfter.value[i]).toFixed(
      2
    );
    txrows.value[i].dateSort = parseInt(transactionDate.value[i]);
    //const { Date, TxType, ExchangeRate,Recipients,Link,Fees,Balance,ADA, ...rest } = txrows.value[i];
    //txrows.value[i] = { Date, TxType, ExchangeRate,Recipients,Link,Fees,ADA,Balance, ...rest };
  }
  totalFees.value = parseFloat(totalFees.value).toFixed(2);
  totalIn.value = parseFloat(totalIn.value).toFixed(2);
  totalOut.value = parseFloat(totalOut.value).toFixed(2);
  txrows.value.sort((a, b) => new Date(b.dateSort) - new Date(a.dateSort));
  /*console.log(
    "Everything is fine, but is it",
    txrows.value,
    txTotalAmounts.value,
    txTotalTokens.value,
    headerTokens.value
  );*/
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          everyProject[i].projects[j].txrows = txrows.value;
          everyProject[i].projects[j].header = header.value;
          everyProject[i].projects[j].total_payouts = totalPayouts.value;
          everyProject[i].projects[j].total_txs = totaltxs.value;
          everyProject[i].projects[j].total_in = totalIn.value;
          everyProject[i].projects[j].total_out = totalOut.value;
          everyProject[i].projects[j].total_fees = totalFees.value;
          everyProject[i].projects[j].balance = lovelaceR.value;
          //console.log("Its alive", j);
        }
      }
    }
  }
  localStorage.setItem("allprojects", JSON.stringify(everyProject));
  //console.log("everyProject", everyProject);
}

async function getSingleTransaction(txid) {
  // place txid in await usegetContributions
  const {
    contribution_id,
    task_creator,
    task_name,
    task_label,
    task_description,
    task_type,
  } = await useGetContributions(transactionId.value[0]);
  contributionId.value = contribution_id.value;
  taskCreator.value = task_creator.value;
  taskName.value = task_name.value;
  taskLabel.value = task_label.value;
  taskDescription.value = task_description.value;
  taskType.value = task_type.value;
  const { dist_id, contributor_id } = await useGetDistributions(
    contributionId.value[0]
  );
  distId.value = dist_id.value;
  contributorId.value = contributor_id.value;
}

const rowClasses = computed(() => (row) => {
  if (row.TxType == "Incoming" || row.TxType == "Rewards Withdrawal") {
    return "incoming-row";
  } else {
    return "outgoing-row";
  }
});

function pageBottom() {
  const scrollHeight = document.body.scrollHeight;
  const scrollStep = Math.PI / (500 / 15);
  let count = 0;
  let currPos = 0;
  let scrollInterval = setInterval(function () {
    if (currPos < scrollHeight) {
      count += 1;
      const newPos = Math.round(
        scrollHeight - (scrollHeight - currPos) * Math.cos(count * scrollStep)
      );
      window.scrollTo(0, newPos);
      currPos = newPos;
    } else {
      clearInterval(scrollInterval);
    }
  }, 15);
}

function pageTop() {
  const scrollStep = window.scrollY / 15;
  let scrollInterval = requestAnimationFrame(function scrollToTop() {
    if (window.scrollY > 0) {
      window.scrollTo(0, window.scrollY - scrollStep);
      scrollInterval = requestAnimationFrame(scrollToTop);
    }
  });
}

async function downloadCSV() {
  const rows = [
    [
      "Date",
      "TxType",
      "ExchangeRate",
      "Recipients",
      "Metadata",
      "Fees",
      "Balance",
      ...headerTokens.value,
    ],
  ];
  for (let i = 0; i < txrows.value.length; i++) {
    const row = [
      txrows.value[i].Date,
      txrows.value[i].TxType,
      txrows.value[i].ExchangeRate,
      txrows.value[i].Recipients,
      txrows.value[i].Metadata,
      txrows.value[i].TxView,
      txrows.value[i].Fees,
      txrows.value[i].Balance,
      ...headerTokens.value.map(
        (token) => txrows.value[i][token.toUpperCase()] ?? ""
      ),
    ];
    rows.push(row);
  }

  const csvContent =
    "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function stats() {
  labels = [];
  labelsData = [];
  const { all_stats } = await useGetAllStatsPerWallet(store.group, projectId);
  allStats.value = all_stats.value;
  const sortedKeys = Object.keys(allStats.value).sort();
  const sortedObj = {};
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    sortedObj[key] = allStats.value[key];
  }
  allStats.value = sortedObj;
  //console.log("allStats.value", allStats.value);
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

  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          everyProject[i].projects[j].stat_labels = labels;
          everyProject[i].projects[j].stat_labels_data = labelsData;
          //console.log("Its alive", j);
        }
      }
    }
  }
  localStorage.setItem("allprojects", JSON.stringify(everyProject));
  //localStorage.setItem("projectlabels", JSON.stringify(labels));
  //localStorage.setItem("projectlabelsdata", JSON.stringify(labelsData));
  //console.log("all_stats.value", allStats.value, labels, labelsData);
}
async function projectChart() {
  everyProject = JSON.parse(localStorage.getItem("allprojects"));
  store.changeAllProjects(everyProject);
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          projectLabels = everyProject[i].projects[j].stat_labels;
          projectLabelsData = everyProject[i].projects[j].stat_labels_data;
          //console.log("Its alive", j);
        }
      }
    }
  }
  const label = projectLabels;
  const data = {
    labels: label,
    datasets: [
      {
        label: "total tasks",
        data: projectLabelsData,
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

  if (chart) {
    chart.destroy();
    chart = null;
  }

  // Create a new chart instance
  const ctx = document.getElementById("myChart2");
  chart = new Chart(ctx, config);
}
</script>

<template>
  <main>
    <div class="cont">
      <div class="title">
        {{ store.project }}
        <div class="buttons">
          <button id="titlebuttons" @click="downloadCSV()">Export CSV</button>
          <button id="titlebuttons" @click="pageBottom()">
            Go to bottom of the page
          </button>
        </div>
      </div>
      <div class="minicont">
        <div id="stats">
          <div id="stat">Number of txs - {{ totaltxs }}</div>
          <div id="stat">Total Distributions - {{ totalPayouts }}</div>
          <div id="stat">Total In - {{ totalIn }}</div>
          <div id="stat">Total Out - {{ totalOut }}</div>
          <div id="stat">Fees - {{ totalFees }}</div>
          <div id="stat">Balance - {{ lovelaceR }}</div>
        </div>
        <div id="statschart">
          <canvas id="myChart2"></canvas>
        </div>
      </div>
    </div>
    <div class="cont" v-if="loading == false" id="fadeIn">
      <div id="table-container">
        <table id="dynamic-table">
          <thead>
            <tr>
              <th v-for="column in header" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody class="tbody">
            <tr v-for="row in txrows" :key="row.id" :class="rowClasses(row)">
              <td v-for="column in header" :key="column">
                <template v-if="column === 'TxView'">
                  <a
                    ><RouterLink :to="`/transactions/${row[column]}`"
                      >TxView</RouterLink
                    ></a
                  >
                </template>
                <template v-if="column === 'Metadata'">
                  <a v-bind:href="row[column]" target="_blank">Metadata</a>
                </template>
                <template v-if="column != 'Metadata' && column != 'TxView'">
                  {{ row[column] }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="buttons">
        <div>
          <button id="titlebuttons" @click="downloadCSV()">Export CSV</button>
          <button id="titlebuttons" @click="pageTop()">
            Scroll to top of the page
          </button>
        </div>
      </div>
    </div>
    <div v-else class="loading">Loading...</div>
  </main>
</template>

<style scoped>
div {
  border-radius: 8px;
  margin: 0.6em;
  border: 1px solid transparent;
  padding: 0.5em 1em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  transition: border-color 0.25s;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-radius: 8px;
  margin: 1.4em;
  margin-bottom: 0.6em;
  border: 1px solid transparent;
  padding: 0.1em 1em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: rgb(18, 19, 19);
  transition: border-color 0.25s;
}

.buttons {
  margin-left: 0.9em;
  padding: 0em;
}
#titlebuttons {
  margin-left: 1.1em;
  margin-bottom: 0em;
  background: rgb(23, 74, 193);
  color: aliceblue;
  border-radius: 3px;
}
.cont {
  margin-bottom: -1.6em;
  text-align: center;
}
@media (max-width: 900px) {
  #titlebuttons {
    margin-bottom: 0.5em;
  }
}

.minicont {
  padding: 0.1em 0.1em;
  background-color: rgba(58, 55, 51, 0);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

#stats {
  margin-top: -0.5em;
  margin-right: -0.9em;
  margin-left: -0.9em;
  background-color: rgba(58, 55, 51, 0);
  flex-grow: 1;
  margin-bottom: -0.8em;
}

#stat {
  background-color: rgba(19, 18, 18, 1);
}

#statschart {
  flex-grow: 1;
  max-width: 600px;
  max-height: 280px;
  margin-left: 0.9em;
  margin-right: 0.9em;
  justify-content: space-around;
  background-color: rgba(19, 18, 18, 1);
}

@media (max-width: 996px) {
  #statschart {
    max-width: 996px;
  }
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-thumb {
  background-color: #888;
}

#ministats {
  background-color: rgb(58, 55, 51);
}

#table-container {
  background-color: #131212;
  width: 95%;
  margin: 0 auto;
  overflow-x: scroll;
  overflow-y: scroll;
}

#dynamic-table {
  width: 100%;
  border-collapse: collapse;
}

#dynamic-table tr {
  border-bottom: 1px solid rgb(81, 75, 75);
  padding-inline: 10px;
}

th {
  text-align: center;
}

tr {
  text-align: center;
  font-size: 0.95em;
}

table td:nth-of-type(1) {
  text-align: left;
  min-width: 20px;
}
table th:nth-of-type(1) {
  text-align: left;
  min-width: 128px;
}

table td:nth-of-type(n + 5) {
  /* Columns after 5 are text aligned right*/
  text-align: right;
}
table th:nth-of-type(n + 5) {
  text-align: right;
}

table td:nth-of-type(n + 2) {
  padding-right: 10px;
}

table th:nth-of-type(n + 2) {
  padding-right: 10px;
}

.incoming-row {
  background-color: rgb(8, 57, 8);
}
.outgoing-row {
  background-color: #131212;
}

#fadeIn {
  margin-top: 25px;
  -webkit-animation: fadein 2s; /* Safari, Chrome and Opera > 12.1 */
  -moz-animation: fadein 2s; /* Firefox < 16 */
  -ms-animation: fadein 2s; /* Internet Explorer */
  -o-animation: fadein 2s; /* Opera < 12.1 */
  animation: fadein 2s;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Internet Explorer */
@-ms-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Opera < 12.1 */
@-o-keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fade-in-out {
  0% {
    opacity: 0;
  } /* Start with 0% opacity */
  50% {
    opacity: 1;
  } /* Fade in to 100% opacity */
  100% {
    opacity: 0;
  } /* Fade out to 0% opacity */
}

/* Apply the animation to the text element */
.loading {
  background-color: none;
  text-align: center;
  margin: 1em;
  font-size: 2.5em;
  animation: fade-in-out 2s ease-in-out infinite; /* Use the defined animation */
}
</style>
