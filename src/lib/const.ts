export enum ROLES {
	UNAUTHORIZED = "unauth",
	USER = "user",
	ADMIN = "admin",
}

export const ROLE_LABELS: Record<ROLES, string> = {
	[ROLES.ADMIN]: "Admin",
	[ROLES.USER]: "User",
	[ROLES.UNAUTHORIZED]: "No Access",
}

// lives here, not in ui/sidebar.tsx: the server layout reads it, and a "use client" module's exports are only references there
export const SIDEBAR_COOKIE_NAME = "dekcpesidebarstate"
