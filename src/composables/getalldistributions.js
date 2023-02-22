// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetAllDistributions(project_id) {
  const loading = ref(true);

  const all_dist_id = ref([]);
  const all_contributor_id = ref([]);
  const all_tokens = ref([]);
  const all_amounts = ref([]);

  async function getDistributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("distributions")
        .select(`dist_id, contributor_id, ada, gmbl, agix`)
        .eq("project_id", project_id);

      if (error && status !== 406) throw error;

      if (data) {
        let i = 0;
        for (let j in data) {
          all_tokens.value[i] = [];
          all_amounts.value[i] = [];
          all_dist_id.value.push(data[j].dist_id);
          all_contributor_id.value.push(data[j].contributor_id);
          if (data[j].ada > 0) {
            all_tokens.value[i].push("ada");
            all_amounts.value[i].push(data[j].ada);
          }
          if (data[j].gmbl > 0) {
            all_tokens.value[i].push("gmbl");
            all_amounts.value[i].push(data[j].gmbl);
          }
          if (data[j].agix > 0) {
            all_tokens.value[i].push("agix");
            all_amounts.value[i].push(data[j].agix);
          }
          /*ada.value.push(data[j].ada)
          gmbl.value.push(data[j].gmbl)
          agix.value.push(data[j].agix)*/
          i++;
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getDistributions();

  return { all_dist_id, all_contributor_id, all_tokens, all_amounts };
}
