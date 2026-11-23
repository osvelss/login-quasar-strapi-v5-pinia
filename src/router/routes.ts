import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    meta: { requiresAuth: true },
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("@/pages/IndexPage.vue"),
        name: "dashboard",
        meta: { title: "Dashboard" },
      },
      { path: "second", component: () => import("@/pages/SecondPage.vue") },
    ],
  },

  {
    path: "/auth",
    meta: { isGuest: true },
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        component: () => import("@/pages/auth/LoginPage.vue"),
        name: "login",
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue"),
  },
];

export default routes;
