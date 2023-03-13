// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetDistributions(contribution_id) {
  const loading = ref(true);

  const distributions = ref([]);
  const dist_id = ref([]);
  const contributor_id = ref([]);
  const tokens = ref([]);
  const amounts = ref([]);
  const ada = ref([]);
  const gmbl = ref([]);
  const agix = ref([]);

  async function getDistributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("distributions")
        .select(`dist_id, contributor_id, contribution_id, ada, gmbl, agix, copi, ntx`)
        .eq("contribution_id", contribution_id);

      if (error && status !== 406) throw error;

      if (data) {
        distributions.value = data;
        let i = 0;
        for (let j in data) {
          tokens.value[i] = [];
          amounts.value[i] = [];
          dist_id.value.push(data[j].dist_id);
          contributor_id.value.push(data[j].contributor_id);
          if (data[j].ada > 0) {
            tokens.value[i].push("ada");
            amounts.value[i].push(data[j].ada);
          }
          if (data[j].gmbl > 0) {
            tokens.value[i].push("gmbl");
            amounts.value[i].push(data[j].gmbl);
          }
          if (data[j].agix > 0) {
            tokens.value[i].push("agix");
            amounts.value[i].push(data[j].agix);
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

  return { 
    //dist_id, contributor_id, tokens, amounts
    distributions
  };
}
