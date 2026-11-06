"use client"

import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { stripProtocol } from "@/lib/utils"

export function copyWithToast(text: string) {
	navigator.clipboard.writeText(text)
	toast.success(`Copied ${stripProtocol(text)}`)
}

export function CopyButton({ value, className }: { value: string; className?: string }) {
	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={`Copy ${stripProtocol(value)}`}
			className={className}
			onClick={() => copyWithToast(value)}>
			<Copy className="h-4 w-4" />
		</Button>
	)
}
