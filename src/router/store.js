import StoreList from "@/views/admin/store/StoreList.vue";

export default [
  {
    path: "stores",
    name: "admin.stores",
    component: StoreList,
    meta: {
      requiresAuth: true,
      roles: ["super-admin", "admin", "hr"],
      permission: "store-list",
    },
  },
];
