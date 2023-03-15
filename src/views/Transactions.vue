<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "../store/index";
import { useGetTransaction } from "../composables/gettransaction";
import { useGetContributions } from "../composables/getcontributions";
import { useGetDistributions } from "../composables/getdistributions";
import { useGetProjectName } from "../composables/getprojectname";

const mounted = ref(false);
const loading = ref(false);
const valid = ref(false);

const store = useStore();
const route = useRoute();
const router = useRouter();

const txstatus = ref();
const transhash = ref("");
const txid = ref("");
const txjsoncont = ref([]);
const inputValue = ref("");
const contr = ref();
const wallets = ref([]);
const selWallet = ref("");
const totalPayment = ref({});
const projectId = ref("");
const projectDetails = ref();
const group = ref("");
const project = ref("");

const tx = route.params.txid;

onMounted(async () => {
  mounted.value = false;
  if (tx == "entertx") {
    txstatus.value = false;
  } else {
    await getTransaction();
    selWallet.value = "All Wallets";
  }
  mounted.value = true;
});

watch(
  () => route.params.txid,
  (newTx) => {
    if (newTx !== tx) {
      window.location.reload();
    }
  }
);

function getValue(name) {
  return document.getElementById(name).value;
}

async function getTx(inputvalue) {
  //console.log("Get it", inputvalue);
  router.push({ path: `/transactions/${inputvalue}` });
  //getTransaction(inputvalue);
  selWallet.value = "All Wallets";
}

async function getTransaction(txId) {
  loading.value = true;
  if (txId == undefined) {
    //console.log("get route path", tx);
    transhash.value = tx;
  } else {
    //console.log("Getting tx", txId);
    transhash.value = txId;
  }
  const { txhash } = await useGetTransaction(transhash.value);
  txid.value = txhash.value;
  if (txid.value[0].tx_json.mdVersion) {
    txjsoncont.value = txid.value[0].tx_json.contributions;
  } else {
    txjsoncont.value = txid.value[0].tx_json;
  }

  projectId.value = txjsoncont.value = txid.value[0].project_id;
  const { project_details } = await useGetProjectName(projectId.value);
  projectDetails.value = project_details.value;
  group.value = projectDetails.value.groups.group_name;
  project.value = projectDetails.value.project_name;
  store.changeGroup(group.value);
  store.changeProject(project.value);
  //console.log("projectDetails", group.value, project.value, projectDetails.value);

  //console.log("txid.value", txid.value[0].tx_id, txjsoncont.value);
  const { contributions } = await useGetContributions(txid.value[0].tx_id);
  contr.value = contributions.value;
  for (let i in contr.value) {
    contr.value[i].dist = [];
    for (let l in contr.value[i].distributions) {
      contr.value[i].dist[l] = {};
      contr.value[i].dist[l] = {};
      contr.value[i].dist[l].tokens = [];
      contr.value[i].dist[l].amounts = [];
      contr.value[i].dist[l].wallet = "";
      for (let t in contr.value[i].distributions[l]) {
        contr.value[i].dist[l].wallet =
          contr.value[i].distributions[l].contributor_id;
        if (
          t != "dist_id" &&
          t != "contributor_id" &&
          t != "contribution_id" &&
          contr.value[i].distributions[l][t] > 0
        ) {
          let x = contr.value[i].distributions[l][t];
          contr.value[i].dist[l].tokens.push(t);
          contr.value[i].dist[l].amounts.push(
            parseFloat(x).toFixed(2)
          );
        }
      }
    }
    contr.value[i].displayname = "";
    contr.value[i].displayname = contr.value[i].task_description
      ? contr.value[i].task_description
      : contr.value[i].task_name;
    for (let k in contr.value[i].distributions) {
      if (
        !wallets.value.includes(contr.value[i].distributions[k].contributor_id)
      ) {
        wallets.value.push(contr.value[i].distributions[k].contributor_id);
      }
    }
  }
  //console.log("contr.value", contr.value, wallets.value);
  txstatus.value = true;
  loading.value = false;
}
async function selectedWallet(wal) {
  let finalPayment = {};
  let totalPayments = {
    tokens: [],
    amounts: [],
  };
  selWallet.value = wal;
  if (selWallet.value == "All Wallets") {
    valid.value = true;
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });

  for (let i in contr.value) {
    for (let j in contr.value[i].distributions) {
      if (contr.value[i].distributions[j].contributor_id == wal) {
        //finalPayment.push(contr.value[i].distributions[j]);
        for (let t in contr.value[i].distributions[j]) {
          if (
            t != "dist_id" &&
            t != "contributor_id" &&
            t != "contribution_id" &&
            contr.value[i].distributions[j][t] > 0
          ) {
            finalPayment[t] = 0;
            totalPayments.tokens.push(t);
            totalPayments.amounts.push(contr.value[i].distributions[j][t]);
          }
        }
      }
    }
  }
  for (let k in finalPayment) {
    for (let m in totalPayments.tokens) {
      if (totalPayments.tokens[m] == k) {
        finalPayment[k] = finalPayment[k] + totalPayments.amounts[m];
      }
    }
    finalPayment[k] = finalPayment[k].toFixed(2);
  }
  totalPayment.value = finalPayment;
  console.log("totalPayment", totalPayment.value);
  //console.log("selWallet.value", selWallet.value);
}
</script>
<template>
  <div class="main">
    <div>
      <p class="inputheading">Transaction ID - {{ transhash }}</p>
      <input
        class="txinput"
        type="text"
        id="tx"
        autoComplete="off"
        placeholder="Please enter transaction id"
        v-model="inputValue"
      />
      <button class="inputbutton" @click="getTx(inputValue)">GO</button>
    </div>
    <div v-if="mounted" class="box">
      <div v-if="txstatus" class="transaction" id="fadeIn">
       <div class="totalbox">
        <div>
          Distributions made to
          <span id="spanwallet">&nbsp;{{ selWallet }}&nbsp;</span> in this
          transaction
        </div>
        <div v-if="selWallet != 'All Wallets'">
          <div class="totalamount">Total - 
            <span v-for="pay in totalPayment" :key="pay">{{ pay }} {{ Object.keys(totalPayment).find(key => totalPayment[key] === pay) }},&nbsp;</span>
          </div>
        </div>
        </div>
        <div v-for="cont in contr" :key="cont">
          <div
            class="contr"
            v-if="cont.dist.some((obj) => obj.wallet === selWallet)"
          >
            {{ cont.displayname }}
            <div
              v-if="selWallet == 'All Wallets'"
              class="distr"
              v-for="ctr in cont.dist"
              :key="ctr"
            >
              <div>{{ ctr.wallet }}&nbsp;-&nbsp;</div>
              <div class="tokens" v-for="tok in ctr.tokens" :key="tok">
                {{
                  ctr.amounts[
                    Object.keys(ctr.tokens).find(
                      (key) => ctr.tokens[key] === tok
                    )
                  ]
                }}
                {{ tok }},&nbsp;
              </div>
            </div>
            <div
              v-if="selWallet != 'All Wallets'"
              class="distr"
              v-for="ctr in cont.dist"
              :key="ctr"
            >
              <div v-if="ctr.wallet == selWallet">
                {{ ctr.wallet }}&nbsp;-&nbsp;
              </div>
              <div
                v-if="ctr.wallet == selWallet"
                class="tokens"
                v-for="tok in ctr.tokens"
                :key="tok"
              >
                {{
                  ctr.amounts[
                    Object.keys(ctr.tokens).find(
                      (key) => ctr.tokens[key] === tok
                    )
                  ]
                }}
                {{ tok }},&nbsp;
              </div>
            </div>
          </div>
          <div class="contr" v-if="selWallet == 'All Wallets'">
            {{ cont.displayname }}
            <div
              v-if="selWallet == 'All Wallets'"
              class="distr"
              v-for="ctr in cont.dist"
              :key="ctr"
            >
              <div>{{ ctr.wallet }}&nbsp;-&nbsp;</div>
              <div class="tokens" v-for="tok in ctr.tokens" :key="tok">
                {{
                  ctr.amounts[
                    Object.keys(ctr.tokens).find(
                      (key) => ctr.tokens[key] === tok
                    )
                  ]
                }}
                {{ tok }},&nbsp;
              </div>
            </div>
            <div
              v-if="selWallet != 'All Wallets'"
              class="distr"
              v-for="ctr in cont.dist"
              :key="ctr"
            >
              <div v-if="ctr.wallet == selWallet">
                {{ ctr.wallet }}&nbsp;-&nbsp;
              </div>
              <div
                v-if="ctr.wallet == selWallet"
                class="tokens"
                v-for="tok in ctr.tokens"
                :key="tok"
              >
                {{
                  ctr.amounts[
                    Object.keys(ctr.tokens).find(
                      (key) => ctr.tokens[key] === tok
                    )
                  ]
                }}
                {{ tok }},&nbsp;
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="txstatus" class="wallets" id="fadeIn">
        Select wallet to view distributions
        <button class="wals" @click="selectedWallet('All Wallets')">
          All Wallets
        </button>
        <button
          v-if="selWallet"
          class="wals"
          v-for="wal in wallets"
          :key="wal"
          @click="selectedWallet(wal)"
        >
          {{ wal }}
        </button>
      </div>
      <div class="loading" v-if="loading">Loading...</div>
    </div>
    <div v-if="!mounted" class="loading">Loading...</div>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.totalbox {
  border-radius: 5px;
  background-color: black;
  border: solid 0.2px;
  padding: 0.2em;
}
.totalamount {
  background-color: rgb(24, 41, 50);
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
  width: 700px;
  text-align: center;
  margin: 1em;
  font-size: 2.5em;
  animation: fade-in-out 2s ease-in-out infinite; /* Use the defined animation */
}
.txinput {
  height: 2.5em;
  width: 38em;
  margin: 2em;
  padding-left: 1em;
}
.inputheading {
  margin-bottom: -2em;
  margin-left: 2em;
  font-size: 0.77em;
}
.transaction {
  max-width: 500px;
  min-width: 500px;
  margin: 2em;
}
.box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.wallets {
  margin: 2em;
  display: flex;
  flex-direction: column;
}
.wals {
  margin: 0.2em;
  font-size: 0.85em;
}
#spanwallet {
  color: aqua;
  font-size: 1.2em;
}
.contr {
  background-color: black;
  border-radius: 5px;
  margin: 0.5em;
  padding: 0.2em;
}
.distr {
  display: flex;
  flex-wrap: wrap;
  background-color: rgb(24, 41, 50);
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
</style>
