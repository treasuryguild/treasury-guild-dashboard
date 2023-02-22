import { defineStore } from "pinia";

export const useStore = defineStore("test", {
  state: () => ({
    name: "Pinia",
    number: 1,
    allprojects: [],
    group: "",
    project: "",
  }),
  actions: {
    changeName(value) {
      this.name = value;
    },
    changeNumber(value) {
      this.number = value;
    },
    changeAllProjects(value) {
      this.allprojects = value;
    },
    changeGroup(value) {
      this.group = value;
    },
    changeProject(value) {
      this.project = value;
    },
  },
});
