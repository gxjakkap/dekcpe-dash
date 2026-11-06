import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// ponytail: fixed Bangkok timezone so server and browser render the same date; use the viewer's zone if users go beyond Thailand
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "Asia/Bangkok",
})

export const formatDate = (date: Date) => dateFormatter.format(date)

export const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "")

export function generateRandomString(length: number) {
	const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)))
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, length)
}
