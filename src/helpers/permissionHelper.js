import { useAuthStore } from '@/stores/auth';

export const hasRole = roleName => {
  const authStore = useAuthStore();
  const roles = (authStore.user?.roles || []).map(r =>
    typeof r === 'string' ? r.toLowerCase() : (r?.name || '').toLowerCase()
  );
  return roles.includes(String(roleName).toLowerCase());
};

export const isSuperAdmin = () => hasRole('super-admin');

export const can = permission => {
  if (isSuperAdmin()) {
    return true;
  }

  const authStore = useAuthStore();
  const userPermissions = authStore.user?.permissions || [];

  return userPermissions.includes(permission);
};

export const canOneOf = permissions => {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  if (isSuperAdmin()) {
    return true;
  }

  const authStore = useAuthStore();
  const userPermissions = authStore.user?.permissions || [];

  return permissions.some(permission => userPermissions.includes(permission));
};
