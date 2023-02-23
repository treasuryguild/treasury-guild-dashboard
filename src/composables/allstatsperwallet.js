// mouse.js
import { ref } from "vue";
import { useStore } from "../store/index";
import { supabase } from "../supabase";
import { useGetTransactions } from "./gettransactions";

// by convention, composable function names start with "use"
export async function useGetAllStatsPerWallet(groupname, projectid) {
  const store = useStore();
  const loading = ref(true);

  const all_projects = ref([]);
  const all_txs = ref([]);
  const all_txTypes = ref({});
  const all_txTypeValues = ref([]);

  const no_txs = ref(0);
  const no_wallets = ref(0);
  const all_stats = ref([]);

  const allProjectIds = ref([]);

  async function getProjectDetails() {
    // still busy building and testing
    try {
      loading.value = true;
      let { data, error, status } = await supabase
        .from("groups")
        .select(`group_id, projects(project_id)`)
        .eq("group_name", groupname);

      if (error && status !== 406) throw error;
      if (data) {
        all_projects.value = data;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  async function getContributions() {
    for (let i in all_projects.value[0].projects) {
      allProjectIds.value.push(all_projects.value[0].projects[i].project_id);
    }
    console.log("Results", allProjectIds.value);
    try {
      loading.value = true;
      let { data, error, status } = await supabase
        .from("contributions")
        .select()
        .eq("project_id", projectid);

      if (error && status !== 406) throw error;
      if (data) {
        all_txs.value = data;
        console.log("Results2", all_txs.value);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  async function getStats() {
    for (let i in all_txs.value) {
      if (!all_txTypes.value[all_txs.value[i].task_type]) {
        all_txTypes.value[all_txs.value[i].task_type] = 1;
      } else {
        all_txTypes.value[all_txs.value[i].task_type] =
          all_txTypes.value[all_txs.value[i].task_type] + 1;
      }
    }
  }

  await getProjectDetails();
  await getContributions();
  await getStats();

  all_stats.value = all_txTypes.value;

  return { all_stats };
}
