/**
 * Standardized English UI labels, glossary terms, and enum display mappings.
 */

export const LABELS = {
  // Entities & Modules (Mandatory Glossary)
  EMPLOYEE: 'Employee',
  ATTENDANCE: 'Attendance',
  CLOCK_IN: 'Clock In',
  CLOCK_OUT: 'Clock Out',
  CLOCK_IN_OUT: 'Clock In/Clock Out',
  LEAVE_REQUEST: 'Leave Request',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  PENDING: 'Pending',
  TEAM: 'Team',
  PROJECT: 'Project',
  TASK: 'Task',
  REPORTS: 'Reports',
  SETTINGS: 'Settings',
  PAYSLIP: 'Payslip',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',

  // Common Actions & Buttons (Mandatory Glossary)
  SEARCH: 'Search',
  SAVE: 'Save',
  SAVE_CHANGES: 'Save Changes',
  SAVING: 'Saving...',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add',
  DETAIL: 'Detail',
  EXPORT: 'Export',
  FILTER: 'Filter',
  BACK: 'Back',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  RESET: 'Reset',
  REFRESH: 'Refresh',

  // States & Feedback (Mandatory Glossary)
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  NO_DATA: 'No data available',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  NO_ACCESS: "You don't have permission to access this page",
};

// Enum display label mappings (keeping database enum values unchanged)
export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  done: 'Done',
  in_progress: 'In Progress',
  todo: 'To Do',
  review: 'Review',
  on_hold: 'On Hold',
  'on-hold': 'On Hold',
  overdue: 'Overdue',
  draft: 'Draft',
  planning: 'Planning',
  forming: 'Forming',
  dormant: 'Dormant',
  paid: 'Paid',
  finalized: 'Finalized',
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  sick: 'Sick',
  leave: 'On Leave',
  permission: 'Permission',
  remote: 'Remote',
  valid: 'VALID',
  invalid: 'INVALID',
  running: 'Running',
  timeout: 'Timeout',
  failed: 'Failed',
};

export const LEAVE_TYPE_LABELS = {
  annual: 'Annual Leave',
  annual_leave: 'Annual Leave',
  sick: 'Sick Leave',
  sick_leave: 'Sick Leave',
  personal: 'Personal Leave',
  personal_leave: 'Personal Leave',
  emergency: 'Emergency Leave',
  maternity: 'Maternity Leave',
  maternity_leave: 'Maternity Leave',
  paternity: 'Paternity Leave',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const DEPARTMENT_LABELS = {
  development: 'Development',
  design: 'Design',
  marketing: 'Marketing',
  finance: 'Finance',
  quality_assurance: 'Quality Assurance',
  human_resources: 'Human Resources',
  it: 'IT',
  operations: 'Operations',
  sales: 'Sales',
};

export const EMPLOYMENT_TYPE_LABELS = {
  full_time: 'Full Time',
  'full-time': 'Full Time',
  part_time: 'Part Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  intern: 'Internship',
  internship: 'Internship',
  freelance: 'Freelance',
};

export const WORK_LOCATION_LABELS = {
  office: 'Office',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export const SKILL_LEVEL_LABELS = {
  junior: 'Junior',
  mid: 'Mid-Level',
  intermediate: 'Intermediate',
  senior: 'Senior',
  lead: 'Lead',
  principal: 'Principal',
  expert: 'Expert',
};

export const PROJECT_TYPE_LABELS = {
  web_development: 'Web Development',
  mobile_app: 'Mobile App',
  design: 'Design',
  marketing: 'Marketing',
  research: 'Research',
  infrastructure: 'Infrastructure',
};

export const ACCOUNT_TYPE_LABELS = {
  savings: 'Savings',
  checking: 'Checking',
  payroll: 'Payroll',
};

export const GENDER_LABELS = {
  male: 'Male',
  female: 'Female',
};

export const ALL_ENUM_LABELS = {
  ...STATUS_LABELS,
  ...LEAVE_TYPE_LABELS,
  ...PRIORITY_LABELS,
  ...DEPARTMENT_LABELS,
  ...EMPLOYMENT_TYPE_LABELS,
  ...WORK_LOCATION_LABELS,
  ...SKILL_LEVEL_LABELS,
  ...PROJECT_TYPE_LABELS,
  ...ACCOUNT_TYPE_LABELS,
  ...GENDER_LABELS,
};

export const formatStatusLabel = (status) => {
  if (!status) return '-';
  const key = String(status).toLowerCase().trim();
  return STATUS_LABELS[key] || status;
};

export const formatLeaveTypeLabel = (type) => {
  if (!type) return '-';
  const key = String(type).toLowerCase().trim();
  return LEAVE_TYPE_LABELS[key] || type;
};

export const formatPriorityLabel = (priority) => {
  if (!priority) return '-';
  const key = String(priority).toLowerCase().trim();
  return PRIORITY_LABELS[key] || priority;
};

export const formatDepartmentLabel = (dept) => {
  if (!dept) return '-';
  const key = String(dept).toLowerCase().trim();
  return DEPARTMENT_LABELS[key] || dept;
};

export const formatEmploymentTypeLabel = (type) => {
  if (!type) return '-';
  const key = String(type).toLowerCase().trim();
  return EMPLOYMENT_TYPE_LABELS[key] || type;
};

export const formatWorkLocationLabel = (loc) => {
  if (!loc) return '-';
  const key = String(loc).toLowerCase().trim();
  return WORK_LOCATION_LABELS[key] || loc;
};

export const formatSkillLevelLabel = (level) => {
  if (!level) return '-';
  const key = String(level).toLowerCase().trim();
  return SKILL_LEVEL_LABELS[key] || level;
};

export const formatGenderLabel = (gender) => {
  if (!gender) return '-';
  const key = String(gender).toLowerCase().trim();
  return GENDER_LABELS[key] || gender;
};

export const formatEnumLabel = (val) => {
  if (!val || typeof val !== 'string') return '';
  const key = val.toLowerCase().trim();
  if (ALL_ENUM_LABELS[key]) {
    return ALL_ENUM_LABELS[key];
  }
  return val
    .split(/[_-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
