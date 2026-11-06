import { z } from "zod"

const SHORTLINK_BASE_URL = process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/"

export const shortLinkUrl = (slug = "") => new URL(slug, SHORTLINK_BASE_URL).toString()

export const SLUG_TAKEN = "SlugAlreadyExistedError"

export const slugSchema = z
	.string()
	.length(0)
	.or(
		z
			.string()
			.min(4, { message: "Slug must be at least 4 characters." })
			.regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores.")
	)
	.optional()

export const destinationSchema = z
	.string()
	.regex(/^https?:\/\/[^\s<>"]+$/, "Enter a full URL that starts with http:// or https://")
