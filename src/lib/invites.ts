import { z } from "zod"

export const UNLIMITED_USES = -1

export const redeemCodeSchema = z
	.string({ message: "Enter your invite code." })
	.min(3, { message: "Invite codes are at least 3 characters." })

export const createInviteSchema = z.object({
	code: z
		.string()
		.length(0)
		.or(z.string().min(4, { message: "Custom invite code must be at least 4 characters long" }))
		.optional(),
	maxUses: z
		.preprocess(
			(val) => {
				if (typeof val !== "string") return val
				const parsed = parseInt(val, 10)
				return Number.isNaN(parsed) ? undefined : parsed
			},
			z.number().refine((val) => val === UNLIMITED_USES || (val >= 1 && val <= 9999), {
				message: "Max uses must be between 1 and 9999.",
			})
		)
		.optional(),
	expirationDate: z.date().optional(),
})
