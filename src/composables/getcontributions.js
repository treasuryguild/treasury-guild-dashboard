// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetContributions(transaction_id) {
  const loading = ref(true);

  let contributions = ref([]);
  const contribution_id = ref([]);
  const task_creator = ref([]);
  const task_name = ref([]);
  const task_label = ref([]);
  const task_description = ref([]);
  const task_type = ref([]);

  async function getContributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("contributions")
        .select(
          `contribution_id, task_creator, task_name, task_label, task_description, task_type`
        )
        .eq("tx_id", transaction_id);

      if (error && status !== 406) throw error;

      if (data) {
        for (let j in data) {
          contributions.value = data;
          contribution_id.value.push(data[j].contribution_id);
          task_creator.value.push(data[j].task_creator);
          task_name.value.push(data[j].task_name);
          task_label.value.push(data[j].task_label);
          task_description.value.push(data[j].task_description);
          task_type.value.push(data[j].task_type);
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
