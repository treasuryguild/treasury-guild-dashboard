// mouse.js
import { ref } from "vue";
import { useStore } from "../store/index";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetTransaction(txid) {
  const store = useStore();
  const loading = ref(true);

  const txhash = ref([]);

  async function getProjectDetails() {
    // still busy building and testing
    try {
      loading.value = true;
      let { data, error, status } = await supabase
        .from("transactions")
        .select(`tx_id, tx_json`)
        .eq("transaction_id", txid);

      if (error && status !== 406) throw error;
      if (data) {
        txhash.value = data;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getProjectDetails();

  return { txhash };
}
