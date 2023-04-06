// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetDistributions(contribution_id) {
  const loading = ref(true);

  const distributions = ref([]);
  const dist_id = ref([]);
  const contributor_id = ref([]);

  async function getDistributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("distributions")
        .select(`dist_id, contributor_id, contribution_id`)
        .eq("contribution_id", contribution_id);

      if (error && status !== 406) throw error;

      if (data) {
        distributions.value = data;
        for (let j in data) {
          dist_id.value.push(data[j].dist_id);
          contributor_id.value.push(data[j].contributor_id);
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getDistributions();

  return { 
    //dist_id, contributor_id, tokens, amounts
    distributions
  };
}
