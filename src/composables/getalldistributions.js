// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetAllDistributions(project_id) {
  const loading = ref(true);

  const all_dist_id = ref([]);
  const all_contributor_id = ref([]);

  async function getDistributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("distributions")
        .select(`dist_id, contributor_id`)
        .eq("project_id", project_id);

      if (error && status !== 406) throw error;

      if (data) {
        for (let j in data) {
          all_dist_id.value.push(data[j].dist_id);
          all_contributor_id.value.push(data[j].contributor_id);
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getDistributions();

  return { all_dist_id, all_contributor_id };
}
