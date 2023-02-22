// mouse.js
import { ref } from 'vue' 
import { supabase } from '../supabase'

// by convention, composable function names start with "use"
export async function useGetTransactions(project_id) {
  
    const loading = ref(true)
  
    const tx_id = ref([])
    const transaction_id = ref([])
    const transaction_date = ref([])
    const exchange_rate = ref([])
    const tx_json_url = ref([])
    const total_tokens = ref([])
    const total_amounts = ref([])
    const fee = ref([])
    const wallet_balance_after = ref([])
    const total_agix = ref([])
    const recipients = ref([])

  async function getTransactions() {  // still busy building and testing
    
    try {
      loading.value = true

      let { data, error, status } = await supabase
        .from('transactions')
        .select(`tx_id, transaction_id, transaction_date, exchange_rate, tx_json_url, recipients, fee, wallet_balance_after, total_ada, total_gmbl, total_agix`)
        .eq('project_id', project_id)
        
      if (error && status !== 406) throw error

      if (data) {
        let i = 0
        for (let j in data) {
          total_tokens.value[i] = []
          total_amounts.value[i] = []
          tx_id.value.push(data[j].tx_id)
          transaction_id.value.push(data[j].transaction_id)
          transaction_date.value.push(data[j].transaction_date)
          exchange_rate.value.push(data[j].exchange_rate)
          recipients.value.push(data[j].recipients)
          fee.value.push(data[j].fee)
          wallet_balance_after.value.push(data[j].wallet_balance_after)
          tx_json_url.value.push(data[j].tx_json_url)
          if (data[j].total_ada >= 0) {
            total_tokens.value[i].push('ada')
            total_amounts.value[i].push(data[j].total_ada.toFixed(2))
          }
          if (data[j].total_gmbl > 0) {
            total_tokens.value[i].push('gmbl')
            total_amounts.value[i].push(data[j].total_gmbl.toFixed(2))
          }
          if (data[j].total_agix > 0) {
            total_tokens.value[i].push('agix')
            total_amounts.value[i].push(data[j].total_agix.toFixed(2))
          }
          /*total_ada.value.push(data[j].total_ada)
          total_gmbl.value.push(data[j].total_gmbl)
          total_agix.value.push(data[j].total_agix)*/
          i++
        }
        console.log("total_tokens.value",total_tokens.value)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      loading.value = false
    }
  }

  await getTransactions()

  return { tx_id, transaction_id, transaction_date, exchange_rate, tx_json_url, total_tokens, total_amounts, recipients, wallet_balance_after, fee }
}
