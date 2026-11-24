import { z } from "zod"

export const groupNameSchema = z
	.string()
	.trim()
	.min(1, { message: "Enter a group name." })
	.max(64, { message: "Group names are at most 64 characters." })
