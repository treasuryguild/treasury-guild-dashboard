// mouse.js
import { ref } from "vue";
import { useStore } from "../store/index";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetProject() {
  const store = useStore();
  const loading = ref(true);

  const project_id = ref("");
  const wallet = ref("");
  const group_id = ref("");
  const website = ref("");
  const project_type = ref("");
  const budget_items = ref("");

  async function getProjectDetails() {
    // still busy building and testing

    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("projects")
        .select(
          `project_id, wallet, group_id, website, project_type, budget_items`
        )
        .eq("project_name", store.project);

      if (error && status !== 406) throw error;

      if (data) {
        project_id.value = data[0].project_id;
        wallet.value = data[0].wallet;
        group_id.value = data[0].group_id;
        website.value = data[0].website;
        project_type.value = data[0].project_type;
        budget_items.value = data[0].budget_items;
        console.log("loading", project_type.value);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getProjectDetails();

  return { project_id, wallet, group_id, website, project_type, budget_items };
}
