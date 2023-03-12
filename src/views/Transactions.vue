<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "../store/index";
import { useGetTransaction } from "../composables/gettransaction";
import { useGetContributions } from "../composables/getcontributions";
import { useGetDistributions } from "../composables/getdistributions";

const mounted = ref(false);
const loading = ref(false);
const valid = ref(false);
const route = useRoute();
const router = useRouter();
const tx = route.params.txid;
const txstatus = ref();
const txid = ref("");
const txjsoncont = ref([]);
const inputValue = ref("");
const contr = ref();
const distr = ref();
const wallets = ref([]);
const selWallet = ref("");

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

function getValue(name) {
  return document.getElementById(name).value;
}

async function getTx(inputvalue) {
  //console.log("Get it", inputvalue);
  router.push({ path: `/transactions/${inputvalue}` });
  getTransaction(inputvalue);
  selWallet.value = "All Wallets";
}

async function getTransaction(txId) {
  loading.value = true;
  let transhash = "";
  if (txId == undefined) {
    //console.log("get route path", tx);
    transhash = tx;
  } else {
    //console.log("Getting tx", txId);
    transhash = txId;
  }
  const { txhash } = await useGetTransaction(transhash);
  txid.value = txhash.value;
  if (txid.value[0].tx_json.mdVersion) {
    txjsoncont.value = txid.value[0].tx_json.contributions;
  } else {
    txjsoncont.value = txid.value[0].tx_json;
  }

  //console.log("txid.value", txid.value[0].tx_id, txjsoncont.value);
  const { contributions } = await useGetContributions(txid.value[0].tx_id);
  contr.value = contributions.value;
  for (let i in contr.value) {
    const { distributions } = await useGetDistributions(
      contr.value[i].contribution_id
    );
    //console.log("distributions.value", distributions.value);
    distr.value = distributions.value;
    contr.value[i].dist = [];
    //console.log(distr.value);
    //contr.value[i].dist = distr.value;
    for (let l in distr.value) {
      contr.value[i].dist[l] = {};
      contr.value[i].dist[l] = {};
      contr.value[i].dist[l].tokens = [];
      contr.value[i].dist[l].amounts = [];
      contr.value[i].dist[l].wallet = "";
      for (let t in distr.value[l]) {
        contr.value[i].dist[l].wallet = distr.value[l].contributor_id;
        if (t != "dist_id" && t != "contributor_id" && t != "contribution_id") {
          contr.value[i].dist[l].tokens.push(t);
          contr.value[i].dist[l].amounts.push(distr.value[l][t]);
        }
      }
    }
    contr.value[i].displayname = "";
    contr.value[i].displayname = contr.value[i].task_description
      ? contr.value[i].task_description
      : contr.value[i].task_name;
    for (let k in distr.value) {
      if (!wallets.value.includes(distr.value[k].contributor_id)) {
        wallets.value.push(distr.value[k].contributor_id);
      }
    }
  }
  //console.log("contr.value", contr.value, wallets.value);
  txstatus.value = true;
  loading.value = false;
}
async function selectedWallet(wal) {
  selWallet.value = wal;
  if (selWallet.value == "All Wallets") {
    valid.value = true;
  }

  //console.log("selWallet.value", selWallet.value);
}
</script>
<template>
  <div class="main">
    <div>
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
        Transaction ditributions for {{ selWallet }}
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
}
.contr {
  background-color: black;
  border: solid 0.2px;
  border-radius: 5px;
  margin: 0.5em;
  padding: 0.5em;
}
.distr {
  display: flex;
  flex-wrap: wrap;
  background-color: rgb(49, 48, 48);
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
