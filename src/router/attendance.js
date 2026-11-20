import ClockInOut from '@/views/employee/ClockInOut.vue';
import MyAttendance from '@/views/employee/MyAttendance.vue';
import AttendanceList from '@/views/admin/attendance/AttendanceList.vue';

export default [
    {
        path: 'attendances',
        name: 'admin.attendances',
        component: AttendanceList,
        meta: {
            requiresAuth: true,
            roles: ['manager', 'admin', 'hr', 'finance'],
            permission: 'attendance-list',
        },
    },
    {
        path: 'attendance/my-attendances',
        name: 'employee.attendance.my-attendances',
        component: MyAttendance,
        meta: {
            requiresAuth: true,
            permission: 'attendance-my-attendances',
        },
    },
    {
        path: 'attendance/clock',
        name: 'employee.attendance.clock',
        component: ClockInOut,
        meta: {
            requiresAuth: true,
            permission: 'attendance-check-in',
        },
    },
];
