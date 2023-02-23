// mouse.js
import { ref } from "vue";
import { useStore } from "../store/index";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetAllProjects() {
  const store = useStore();
  const loading = ref(true);

  const all_projects = ref([]);

  async function getProjectDetails() {
    // still busy building and testing
    try {
      loading.value = true;
      let { data, error, status } = await supabase
        .from("groups")
        .select(
          `group_name, logo_url, projects(project_name, project_id, wallet, website, project_type, budget_items, group_id)`
        );

      if (error && status !== 406) throw error;
      if (data) {
        all_projects.value = data;
        store.changeAllProjects(all_projects.value);
        if (localStorage.getItem("allprojects") == null) {
          localStorage.setItem("allprojects", JSON.stringify(store.allprojects));
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getProjectDetails();

  return { all_projects };
}
