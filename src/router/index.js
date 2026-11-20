import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import i18n, { updateDocumentTitle } from '@/plugins/i18n'
import AuthLayout from '@/layouts/Auth.vue'
import AdminLayout from '@/layouts/Admin.vue'
import Login from '@/views/auth/Login.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import teamRoutes from './team';
import employeeRoutes from './employee';
import EmployeeCreate from '@/views/admin/employee/EmployeeCreate.vue';
import EmployeeEdit from '@/views/admin/employee/EmployeeEdit.vue';
import EmployeeDetail from '@/views/admin/employee/EmployeeDetail.vue';
import EmployeeProfile from '@/views/employee/EmployeeProfile.vue';
import EmployeeTeam from '@/views/employee/EmployeeTeam.vue';
import EmployeeCreateLayout from '@/layouts/EmployeeCreateLayout.vue';
import projectRoutes from './project';
import attendanceRoutes from './attendance';
import payrollRoutes from './payroll';
import reportRoutes from './report';
import settingsRoutes from './settings';
import ctiRoutes from './cti';
import rbacRoutes from './rbac';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Scroll the main content area to top
    return new Promise((resolve) => {
      setTimeout(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        resolve({ top: 0, left: 0 });
      }, 100);
    });
  },
  routes: [
    {
      path: '/',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'admin.dashboard',
          component: AdminDashboard,

        },
        ...teamRoutes,
        ...employeeRoutes,
        ...projectRoutes,
        ...attendanceRoutes,
        ...payrollRoutes,
        ...reportRoutes,
        ...settingsRoutes,
        ...ctiRoutes,
        ...rbacRoutes,
        {
          path: 'my-profile',
          name: 'employee.profile',
          component: EmployeeProfile,
        },
        {
          path: 'my-profile/edit',
          name: 'employee.profile.edit',
          component: () => import('@/views/employee/EmployeeProfileEdit.vue'),
        },
        {
          path: 'my-team',
          name: 'employee.team',
          component: EmployeeTeam,
        }
      ],
    },
    {
      path: '/admin/employees/create',
      component: EmployeeCreateLayout,
      meta: {
        requiresAuth: true,
        roles: ['manager', 'admin', 'hr'],
        permission: 'employee-create',
      },
      children: [
        {
          path: '',
          name: 'admin.employees.create',
          component: EmployeeCreate
        }
      ]
    },
    {
      path: '/admin/employees/:id/edit',
      component: EmployeeCreateLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'admin.employees.edit',
          component: EmployeeEdit
        }
      ]
    },
    {
      path: '/admin/employees/:id',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'admin.employees.detail',
          component: EmployeeDetail
        }
      ]
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: {
            requiresUnauth: true,
          },
        },
      ],
    },
  ],
})


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (authStore.token) {
      try {
        if (!authStore.user || !Array.isArray(authStore.user.permissions)) {
          await authStore.checkAuth()
        }

        // Enforce mandatory MFA setup for enforced roles before accessing any other page
        if (authStore.user?.mfa_setup_required && to.name !== 'employee.profile.edit') {
          const toast = useToastStore()
          toast.warning(i18n.global.t('auth.mfaSetupRequiredToast'))
          return next({
            name: 'employee.profile.edit',
            query: { tab: 'security', enforce_mfa: '1' },
          })
        }

        const userRoles = (authStore.user?.roles || []).map(r =>
          typeof r === 'string' ? r.toLowerCase() : (r?.name || '').toLowerCase()
        )
        const userPermissions = (authStore.user?.permissions || []).map(p =>
          typeof p === 'string' ? p : (p?.name || '')
        )

        if (userRoles.includes('super-admin')) {
          return next()
        }

        if (to.meta.role && !userRoles.includes(to.meta.role.toLowerCase())) {
          const toast = useToastStore()
          toast.error(i18n.global.t('common.noAccess'))
          return next({ name: 'admin.dashboard' })
        }

        if (Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
          const hasRole = to.meta.roles.some(role => userRoles.includes(role.toLowerCase()))
          const hasPerm = to.meta.permission ? userPermissions.includes(to.meta.permission) : false
          if (!hasRole && !hasPerm) {
            const toast = useToastStore()
            toast.error(i18n.global.t('common.noAccess'))
            return next({ name: 'admin.dashboard' })
          }
        } else if (to.meta.permission && !userPermissions.includes(to.meta.permission)) {
          const toast = useToastStore()
          toast.error(i18n.global.t('common.noAccess'))
          return next({ name: 'admin.dashboard' })
        }

        next()
      } catch (error) {
        next({ name: 'login' })
      }
    } else {
      next({ name: 'login' })
    }
  } else if (to.meta.requiresUnauth && authStore.token) {
    next({ name: 'admin.dashboard' })
  } else {
    next()
  }
})


router.afterEach((to) => {
  if (typeof window !== 'undefined') {
    window.__HIP_CURRENT_ROUTE_NAME__ = to.name?.toString() || ''
  }
  updateDocumentTitle(to.name)
})

export default router
