import { pgTable, text, timestamp, boolean, integer, date, jsonb } from "drizzle-orm/pg-core"

import { ROLES } from "@/lib/const"

export const links = pgTable("links", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    owner: text("owner").notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const clicks = pgTable("clicks", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    linkId: integer("link_id").notNull().references(() => links.id, { onDelete: 'cascade' }),
    userAgent: text("user_agent").notNull(),
    utmSource: text("utm_source"),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
    geolocation: jsonb("geolocation").$type<{
        country: string;
        region: string;
        city: string;
        timezone: string;
    }>(),
})

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    role: text('role').default(ROLES.UNAUTHORIZED).notNull(),
    banned: boolean('banned').default(false).notNull(),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires')
})

export const invite = pgTable("invite", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
	code: text("code").notNull().unique(),
    maxUses: integer("max_uses").notNull().default(1),
    expirationDate: timestamp("expiration_date", { withTimezone: true }),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
	creationDate: timestamp("creation_date", { withTimezone: true }).defaultNow().notNull(),
})

export const inviteUsage = pgTable("invite_usage", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
	inviteId: integer("invite_id").notNull().references(() => invite.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	claimDate: timestamp("claim_date", { withTimezone: true }).defaultNow().notNull(),
})

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by')
})

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
})

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
})
