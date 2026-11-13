export default [
  {
    path: 'cti',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'brand-protection',
        name: 'admin.cti.brand-protection',
        component: () => import('@/views/admin/cti/BrandProtection.vue'),
        meta: {
          requiresAuth: true,
          roles: ['manager', 'admin', 'hr'],
          permission: 'cti-menu',
        },
      },
      {
        path: 'audit-user',
        name: 'admin.cti.audit-user',
        component: () => import('@/views/admin/cti/AuditUser.vue'),
      },
    ],
  },
];
