import { eq, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { clicks, links } from "@/db/schema"

export function deviceFromUserAgent(ua: string): string {
	if (ua.includes("iPhone")) {
		return "iPhone"
	}

	if (ua.includes("iPad")) {
		return "iPad"
	}

	if (ua.includes("Android")) {
		if (ua.includes("SM-")) {
			return "Samsung Galaxy"
		}

		if (ua.includes("Pixel")) {
			return "Google Pixel"
		}

		if (ua.includes("OPPO")) {
			return "Oppo"
		}
		if (ua.includes("Vivo")) {
			return "Vivo"
		}

		if (ua.includes("HUAWEI")) {
			return "Huawei"
		}

		return "Android Device"
	}

	if (ua.includes("Windows NT")) {
		if (ua.includes("NT 10.0")) {
			return "Windows 10/11"
		}
		if (ua.includes("NT 6.3")) {
			return "Windows 8.1"
		}
		if (ua.includes("NT 6.2")) {
			return "Windows 8"
		}
		if (ua.includes("NT 6.1")) {
			return "Windows 7"
		}
		if (ua.includes("NT 6.0")) {
			return "Windows Vista"
		}
		if (ua.includes("NT 5.1")) {
			return "Windows XP"
		}
		return "Other Windows PC"
	}

	if (ua.includes("Linux")) {
		return "Linux PC"
	}

	if (ua.includes("Macintosh") || ua.includes("Mac OS X")) {
		return "Mac"
	}

	if (ua.includes("CrOS")) {
		return "Chrome OS"
	}

	if (ua.includes("bot") || ua.includes("crawl") || ua.includes("spider") || ua.includes("slurp")) {
		return "Bot"
	}

	return "Other"
}

export async function topDevices(where: SQL | undefined, limit = 10) {
	const rows = await db
		.select({ userAgent: clicks.userAgent })
		.from(clicks)
		.innerJoin(links, eq(clicks.linkId, links.id))
		.where(where)

	const counts = new Map<string, number>()
	for (const { userAgent } of rows) {
		const device = deviceFromUserAgent(userAgent)
		counts.set(device, (counts.get(device) ?? 0) + 1)
	}
	return [...counts]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([name, count]) => ({ name, count }))
}
