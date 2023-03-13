// mouse.js
import { ref } from "vue";
import { supabase } from "../supabase";

// by convention, composable function names start with "use"
export async function useGetProjectName(project_id) {
  const loading = ref(true);

  const project_details = ref("");

  async function getProjectDetails() {
    try {
      loading.value = true;

      let { data, error, status } = await supabase
        .from("projects")
        .select(`project_name, group_id, groups(group_name)`)
        .eq("project_id", project_id);

      if (error && status !== 406) throw error;

      if (data) {
        project_details.value = data[0];
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading.value = false;
    }
  }

  await getProjectDetails();

  return { project_details };
}
