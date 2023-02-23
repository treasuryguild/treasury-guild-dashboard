<script setup>
import { onMounted, ref, watchEffect, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "../store/index";
import { supabase } from "../supabase";
import { useGetWallet } from "../composables/getwallet";
import { useGetProject } from "../composables/getproject";
import { useGetTransactions } from "../composables/gettransactions";
import { useGetContributions } from "../composables/getcontributions";
import { useGetAllContributions } from "../composables/getallcontributions";
import { useGetDistributions } from "../composables/getdistributions";
import { useGetAllDistributions } from "../composables/getalldistributions";

const store = useStore();
const route = useRoute();

const loading = ref(false);
let totaltxs = ref();
let totalIn = ref("");
let totalOut = ref("");
let totalFees = ref(0);
let balance = ref("");
let totalPayouts = ref();
const lovelaceR = ref();

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

let everyProject = [];
let lastRefresh3 = [];
let tableRows = [];
let tableHeaders = [];

const group = route.params.group;
const project = route.params.project;

onMounted(async () => {
  lastRefresh3 = parseInt(localStorage.getItem("refreshtime3"))
    ? parseInt(localStorage.getItem("refreshtime3"))
    : 0;
  loading.value = true;
  everyProject = JSON.parse(localStorage.getItem("allprojects"));
  store.changeAllProjects(everyProject);
  store.changeGroup(group);
  store.changeProject(project);
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          txrows.value = everyProject[i].projects[j].txrows;
          header.value = everyProject[i].projects[j].header;
        }
      }
    }
  }
  console.log("PView loading", txrows.value, header.value);
  //await getProjectDetails();
  if (parseInt(lastRefresh3) < parseInt(Date.now()) - 300000) {
    localStorage.setItem("refreshtime3", Date.now());
    lastRefresh3 = Date.now();
    console.log("projectDate", Date.now());
    await getProjectDetails();
  }
  loading.value = false;
});

async function getProjectDetails() {
  // still busy building and testing
  txrows.value = [];
  totalPayouts.value = 0;
  totaltxs.value = 0;
  totalIn.value = 0;
  totalOut.value = 0;
  header.value = [
    "Date",
    "TxType",
    "ExchangeRate",
    "Recipients",
    "Link",
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
  const { all_dist_id, all_contributor_id, all_tokens, all_amounts } =
    await useGetAllDistributions(project_idRender.value);
  distId.value = all_dist_id.value;
  contributorId.value = all_contributor_id.value;
  tokensR.value = all_tokens.value;
  amountsR.value = all_amounts.value;
  console.log(
    "test dist tokens",
    tokens.value,
    tokenAmounts.value,
    nfts.value,
    nftPicture.value
  );
  totalPayouts.value = distId.value.length;
  totaltxs.value = txId.value.length;
  for (let k in all_transactionId.value) {
    txType.value[all_transactionId.value[k]] = all_taskType.value[k];
  }
  console.log("txtypes", txType.value);

  for (let j in txTotalTokens.value) {
    for (let i in txTotalTokens.value[j]) {
      console.log("test tokens", txTotalTokens.value[j][i]);
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
      Date: "",
      ExchangeRate: "",
      Recipients: "",
      Link: "",
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
    txrows.value[i].Link = txJsonUrl.value[i];
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
  txrows.value.sort((a, b) => new Date(a.dateSort) - new Date(b.dateSort));
  console.log(
    "Everything is fine, but is it",
    txrows.value,
    txTotalAmounts.value,
    txTotalTokens.value,
    headerTokens.value
  );
  for (let i in everyProject) {
    if (everyProject[i].group_name == store.group) {
      for (let j in everyProject[i].projects) {
        if (everyProject[i].projects[j].project_name == store.project) {
          everyProject[i].projects[j].txrows = txrows.value;
          everyProject[i].projects[j].header = header.value;
          console.log("Its alive", j);
        }
      }
    }
  }
  localStorage.setItem("allprojects", JSON.stringify(everyProject));
  console.log("everyProject", everyProject);
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
  const { dist_id, contributor_id, tokens, amounts } =
    await useGetDistributions(contributionId.value[0]);
  distId.value = dist_id.value;
  contributorId.value = contributor_id.value;
  tokensR.value = tokens.value;
  amountsR.value = amounts.value;
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
      "Link",
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
      txrows.value[i].Link,
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
        <div>Number of txs - {{ totaltxs }}</div>
        <div>Total Disbursements - {{ totalPayouts }}</div>
        <div>Total In - {{ totalIn }}</div>
        <div>Total Out - {{ totalOut }}</div>
        <div>Fees - {{ totalFees }}</div>
        <div>Balance - {{ lovelaceR }}</div>
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
          <tbody>
            <tr v-for="row in txrows" :key="row.id" :class="rowClasses(row)">
              <td v-for="column in header" :key="column">
                <template v-if="column === 'Link'">
                  <a v-bind:href="row[column]" target="_blank">Link</a>
                </template>
                <template v-else>
                  {{ row[column] }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <div class="buttons">
          <button id="titlebuttons" @click="downloadCSV()">Export CSV</button>
          <button id="titlebuttons" @click="pageTop()">
            Scroll to top of the page
          </button>
        </div>
      </div>
    </div>
    <div v-else class="loader"></div>
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
  background-color: #131212;
  transition: border-color 0.25s;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-radius: 8px;
  margin: 1.2em;
  margin-bottom: 0.6em;
  border: 1px solid transparent;
  padding: 0.5em 1em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #131212;
  transition: border-color 0.25s;
}

.buttons {
  margin: 0px;
  padding: 0em;
}
#titlebuttons {
  margin-left: 1.1em;
  background-color: rgb(58, 55, 51);
}
.cont {
  background-color: rgb(58, 55, 51);
  text-align: center;
  padding: 0.1em 0.1em;
}

.minicont {
  padding: 0.1em 0.1em;
  background-color: rgb(58, 55, 51);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
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
}

table td:nth-of-type(1) {
  text-align: left;
}
table th:nth-of-type(1) {
  text-align: left;
}

table td:nth-of-type(n + 5) {
  text-align: right;
}
table th:nth-of-type(n + 5) {
  text-align: right;
}

table td:nth-of-type(n + 2) {
  padding-right: 20px;
}

table th:nth-of-type(n + 2) {
  padding-right: 20px;
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
.loader {
  background-color: #242424;
  width: 48px;
  height: 48px;
  display: block;
  margin: 300px auto;
  position: relative;
  border: 3px solid #fff;
  border-radius: 50%;
  box-sizing: border-box;
  animation: animloader 2s linear infinite;
}
.loader::after {
  content: "";
  box-sizing: border-box;
  width: 6px;
  height: 24px;
  background: #fff;
  transform: rotate(-45deg);
  position: absolute;
  bottom: -20px;
  left: 46px;
}

@keyframes animloader {
  0% {
    transform: translate(-10px, -10px);
  }
  25% {
    transform: translate(-10px, 10px);
  }
  50% {
    transform: translate(10px, 10px);
  }
  75% {
    transform: translate(10px, -10px);
  }
  100% {
    transform: translate(-10px, -10px);
  }
}
</style>
