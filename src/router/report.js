import ReportsDashboard from '@/views/admin/report/ReportsDashboard.vue';

export default [
    {
        path: 'reports',
        name: 'admin.reports',
        component: ReportsDashboard,
        meta: {
            roles: ['manager', 'admin', 'hr', 'finance'],
            permission: 'report-view',
        },
    },
];
