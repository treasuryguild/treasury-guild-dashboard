// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetAllContributions(project_id) {
  const loading = ref(true);

  const all_contribution_id = ref([]);
  const all_transaction_id = ref([]);
  const all_task_creator = ref([]);
  const all_task_name = ref([]);
  const all_task_label = ref([]);
  const all_task_description = ref([]);
  const all_task_type = ref([]);

  async function getContributions() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("contributions")
        .select(
          `contribution_id, tx_id, task_creator, task_name, task_label, task_description, task_type`
        )
        .eq("project_id", project_id);

      if (error && status !== 406) throw error;

      if (data) {
        for (let j in data) {
          all_contribution_id.value.push(data[j].contribution_id);
          all_transaction_id.value.push(data[j].tx_id);
          all_task_creator.value.push(data[j].task_creator);
          all_task_name.value.push(data[j].task_name);
          all_task_label.value.push(data[j].task_label);
          all_task_description.value.push(data[j].task_description);
          all_task_type.value.push(data[j].task_type);
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
    all_contribution_id,
    all_transaction_id,
    all_task_creator,
    all_task_name,
    all_task_label,
    all_task_description,
    all_task_type,
  };
}
