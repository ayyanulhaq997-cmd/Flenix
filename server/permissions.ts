// Permission middleware and utilities
export type UserPlan = "free" | "standard" | "premium";
export type AdminRole = "admin" | "super_admin" | "content_editor";

export interface UserPermissions {
  canAccessPremiumContent: boolean;
  canAccessStandardContent: boolean;
  canAccessFreeContent: boolean;
}

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageContent: boolean;
  canAccessSettings: boolean;
  canManageChannels: boolean;
}

export function getUserPermissions(plan: UserPlan): UserPermissions {
  return {
    canAccessFreeContent: true,
    canAccessStandardContent: plan === "standard" || plan === "premium",
    canAccessPremiumContent: plan === "premium",
  };
}

export function getAdminPermissions(role: AdminRole): AdminPermissions {
  const basePermissions: AdminPermissions = {
    canManageUsers: false,
    canManageContent: false,
    canAccessSettings: false,
    canManageChannels: false,
  };

  if (role === "content_editor") {
    return {
      ...basePermissions,
      canManageContent: true,
      canManageChannels: true,
    };
  }

  if (role === "admin") {
    return {
      ...basePermissions,
      canManageUsers: true,
      canManageContent: true,
      canManageChannels: true,
      canAccessSettings: true,
    };
  }

  // super_admin has all permissions
  return {
    canManageUsers: true,
    canManageContent: true,
    canAccessSettings: true,
    canManageChannels: true,
  };
}

export function canUserAccessContent(userPlan: UserPlan, contentRequiredPlan: string): boolean {
  const permissions = getUserPermissions(userPlan);
  
  if (contentRequiredPlan === "premium") {
    return permissions.canAccessPremiumContent;
  }
  if (contentRequiredPlan === "standard") {
    return permissions.canAccessStandardContent;
  }
  return permissions.canAccessFreeContent;
}
