import i18n from "@/plugins/i18n";

/**
 * Exact & pattern-based translation map for common backend API messages.
 * Unrecognized messages are returned as-is without modification.
 */
const EXACT_MAP = {
  "Login Successful": "apiMessages.loginSuccess",
  "Unauthorized": "apiMessages.unauthorized",
  "Invalid credentials": "apiMessages.unauthorized",
  "Your account has been deactivated. Please contact HR.": "apiMessages.accountDeactivated",
  "Invalid verification code.": "apiMessages.invalidMfaCode",
  "Invalid recovery code.": "apiMessages.invalidRecoveryCode",
  "MFA enabled successfully": "apiMessages.mfaEnabled",
  "MFA disabled successfully": "apiMessages.mfaDisabled",
  "Recovery codes regenerated successfully": "apiMessages.mfaCodesRegenerated",
  "MFA is currently disabled by system configuration.": "apiMessages.mfaGloballyDisabled",
  "Only Super Admin can reset MFA for Admin or Super Admin accounts.": "apiMessages.mfaResetSuperAdminOnly",
  "Role 'super-admin' cannot be renamed or modified.": "apiMessages.superAdminRoleProtected",
  "Role 'super-admin' cannot be deleted.": "apiMessages.superAdminRoleProtected",
  "Permissions for role 'super-admin' cannot be modified.": "apiMessages.superAdminRoleProtected",
  "Super Admin user cannot be deleted.": "apiMessages.superAdminUserProtected",
  "Super Admin user role cannot be downgraded or removed.": "apiMessages.superAdminUserProtected",
  "Only Super Admin can assign the super-admin role.": "apiMessages.superAdminAssignOnly",
  "Cannot delete the last Super Admin in the system.": "apiMessages.superAdminLastProtected",
  "Employee Created Successfully": "apiMessages.employeeCreated",
  "Employee Updated Successfully": "apiMessages.employeeUpdated",
  "Employee Deleted Successfully": "apiMessages.employeeDeleted",
  "Team Created Successfully": "apiMessages.teamCreated",
  "Team Updated Successfully": "apiMessages.teamUpdated",
  "Team Deleted Successfully": "apiMessages.teamDeleted",
  "Project Created Successfully": "apiMessages.projectCreated",
  "Project Updated Successfully": "apiMessages.projectUpdated",
  "Project Deleted Successfully": "apiMessages.projectDeleted",
  "Store Created Successfully": "apiMessages.storeCreated",
  "Store Updated Successfully": "apiMessages.storeUpdated",
  "Store Deleted Successfully": "apiMessages.storeDeleted",
  "Cannot delete store that still has active employees assigned.": "apiMessages.storeHasActiveEmployees",
  "Vendor employees are not eligible for Leave Requests.": "apiMessages.vendorNoLeave",
  "Vendor employees are excluded from Payroll and Payslips.": "apiMessages.vendorNoPayroll",
  "Company settings updated successfully": "apiMessages.companySettingsUpdated",
  "Notification preferences updated": "apiMessages.notificationPrefsUpdated",
  "Password updated successfully": "apiMessages.passwordUpdated",
  "You don't have permission to access global HRIS statistics.": "common.noAccess",
  "Network error occurred": "apiMessages.networkError",
  "An unexpected error occurred": "apiMessages.unexpectedError",
  "An unexpected error occurred. Please try again.": "apiMessages.unexpectedErrorRetry",
  "Domain could not be resolved. It may be unregistered or inactive, so it cannot be scanned.": "apiMessages.urlscanUnresolvable",
  "Domain was rejected by the scan service.": "apiMessages.urlscanRejected",
  "Scan limit reached. Please try again later.": "apiMessages.urlscanRateLimited",
  "Scan service is not configured correctly.": "apiMessages.urlscanMisconfigured",
  "Scan service is temporarily unavailable. Please try again later.": "apiMessages.urlscanUnavailable",
};

const PATTERN_MAP = [
  {
    regex: /^Too many failed MFA attempts\. Please try again in (\d+) minutes?\.?$/i,
    key: "apiMessages.mfaLockedMinutes",
    params: (m) => ({ minutes: m[1] }),
  },
  {
    regex: /^Account temporarily locked/i,
    key: "apiMessages.accountLocked",
    params: () => ({}),
  },
  {
    regex: /^MFA has been reset for (.+)\.$/i,
    key: "employee.mfaResetSuccess",
    params: (m) => ({ name: m[1] }),
  },
  {
    regex: /^User does not have the right (roles|permissions)\.?$/i,
    key: "common.noAccess",
    params: () => ({}),
  },
  {
    regex: /^Scan limit reached\. Please try again in (\d+) seconds?\.?$/i,
    key: "apiMessages.urlscanRateLimitedSeconds",
    params: (m) => ({ seconds: m[1] }),
  },
];

export function translateApiMessage(message) {
  if (!message || typeof message !== "string") {
    return message;
  }

  const trimmed = message.trim();

  if (EXACT_MAP[trimmed] && i18n.global.te(EXACT_MAP[trimmed])) {
    return i18n.global.t(EXACT_MAP[trimmed]);
  }

  for (const rule of PATTERN_MAP) {
    const match = trimmed.match(rule.regex);
    if (match && i18n.global.te(rule.key)) {
      return i18n.global.t(rule.key, rule.params(match));
    }
  }

  return message;
}

export default translateApiMessage;
