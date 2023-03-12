import { createWebHistory, createRouter } from "vue-router";
import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import Wallet from "../views/Wallet.vue";
import Transactions from "../views/Transactions.vue";
import ProjectView from "../views/ProjectView.vue";
import GroupView from "../views/GroupView.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/dashboard", component: Dashboard },
  { path: "/wallet", component: Wallet },
  { path: "/transactions/:txid", component: Transactions },
  { path: "/:group", component: GroupView },
  { path: "/:group/:project", component: ProjectView },
];

const history = createWebHistory();

const router = createRouter({
  history,
  routes,
});

export default router;
