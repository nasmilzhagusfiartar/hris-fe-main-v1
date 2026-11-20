import RoleList from "@/views/admin/rbac/RoleList.vue";
import PermissionList from "@/views/admin/rbac/PermissionList.vue";

export default [
  {
    path: "roles",
    name: "admin.roles",
    component: RoleList,
    meta: {
      requiresAuth: true,
      role: "super-admin",
    },
  },
  {
    path: "permissions",
    name: "admin.permissions",
    component: PermissionList,
    meta: {
      requiresAuth: true,
      role: "super-admin",
    },
  },
];
