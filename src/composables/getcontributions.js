// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetContributions(transaction_id) {
  const loading = ref(true);

  let contributions = ref([]);

  async function getContributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("contributions")
        .select(
          `contribution_id, task_creator, task_name, task_label, task_description, task_type, distributions(dist_id, contributor_id, contribution_id, tokens, amounts)`
        )
        .eq("tx_id", transaction_id);

      if (error && status !== 406) throw error;

      if (data) {
        for (let j in data) {
          contributions.value = data;
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getContributions();

  return {
    contributions
  };
}
