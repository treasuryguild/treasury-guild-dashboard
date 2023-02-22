<script setup>
import { ref } from 'vue'
import { useGetWallet } from '../composables/getwallet'

const inputValue = ref('')
const balance = ref('')
const picture = ref('')
const fTokens = ref('')
const fTokenAmounts = ref('')
const loadWallet = ref(false)

function updateValue(event) {
  inputValue.value = event.target.value
}

async function submitValue() {
  loadWallet.value = true
  const { lovelace, tokens, tokenAmounts, nfts, nftPicture } = await useGetWallet(inputValue.value)
  balance.value = lovelace.value
  console.log(tokens.value,tokenAmounts.value,nfts.value,nftPicture.value)
  picture.value = nftPicture.value
  fTokens.value = tokens.value
  fTokenAmounts.value = tokenAmounts.value
}

</script>

<template>
    <div>
      <!--
      <input type="text" v-model="inputValue" @input="updateValue">
      <button @click="submitValue">Submit</button>
      <p>{{ balance }} ADA</p>
      -->
      Available Q3
    </div>
</template>

<style></style>