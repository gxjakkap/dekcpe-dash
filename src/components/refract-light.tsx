"use client"

import { Pause, Play } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"

// Tileable water caustics: a bright net over the pool shade, pool blue only
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScale;
uniform vec3 uShade, uLight;
float caustic(vec2 uv, float t) {
	vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
	vec2 i = p;
	float c = 1.0;
	for (int n = 0; n < 5; n++) {
		float tt = t * (1.0 - 3.5 / float(n + 1));
		i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
		c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
	}
	c = 1.17 - pow(c / 5.0, 1.4);
	return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}
void main() {
	vec2 uv = gl_FragCoord.xy / uScale;
	float t = uTime * 0.32 + 23.0;
	// a second layer, rotated and at another period, so the tile never reads as a repeat
	vec2 uv2 = mat2(0.799, -0.602, 0.602, 0.799) * uv * 0.73 + 0.37;
	float g2 = caustic(uv2, t * 0.83 + 7.0);
	float g = clamp(caustic(uv, t) + g2 * 0.7, 0.0, 1.0);
	gl_FragColor = vec4(mix(uShade, uLight, g), 1.0);
}`

/**
 * Resolve a colour token (any CSS colour syntax) to 0..1 RGB. CSS does the conversion and we parse the
 * computed string: reading pixels back from a canvas is noised by anti-fingerprinting (Firefox resistFingerprinting)
 */
export function tokenRgb(name: string): [number, number, number] {
	const probe = document.createElement("i")
	probe.style.color = `color-mix(in srgb, var(${name}), var(${name}))`
	document.body.append(probe)
	const value = getComputedStyle(probe).color
	probe.remove()
	const [r = 1, g = 1, b = 1] = value.match(/[\d.]+/g)?.map(Number) ?? []
	// "color(srgb 0.1 0.2 0.3)" is already 0..1; legacy "rgb(26, 51, 77)" is 0..255
	return value.startsWith("rgb") ? [r / 255, g / 255, b / 255] : [r, g, b]
}

export function RefractLight({ className, children }: { className?: string; children?: ReactNode }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const heldRef = useRef(false)
	const syncRef = useRef<() => void>(null)
	const [held, setHeld] = useState(false)
	const [moving, setMoving] = useState(false)

	useEffect(() => {
		const canvas = canvasRef.current
		const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false })
		if (!canvas || !gl) return

		const shader = (type: number, src: string) => {
			const s = gl.createShader(type)
			if (!s) return null
			gl.shaderSource(s, src)
			gl.compileShader(s)
			return s
		}
		const vs = shader(gl.VERTEX_SHADER, VERT)
		const fs = shader(gl.FRAGMENT_SHADER, FRAG)
		const prog = gl.createProgram()
		if (!vs || !fs || !prog) return
		gl.attachShader(prog, vs)
		gl.attachShader(prog, fs)
		gl.linkProgram(prog)
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
		gl.useProgram(prog)

		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
		const loc = gl.getAttribLocation(prog, "p")
		gl.enableVertexAttribArray(loc)
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

		const u = (n: string) => gl.getUniformLocation(prog, n)
		const paint = () => {
			gl.uniform3fv(u("uShade"), tokenRgb("--color-shade"))
			gl.uniform3fv(u("uLight"), tokenRgb("--color-glint"))
		}
		paint()
		const uRes = u("uRes")
		const uTime = u("uTime")
		const uScale = u("uScale")

		// ponytail: 0.75x resolution keeps the net crisp enough at a third less fill; raise if it ever looks blurry
		const density = Math.min(window.devicePixelRatio || 1, 2) * 0.75
		const resize = () => {
			canvas.width = Math.max(1, Math.round(canvas.clientWidth * density))
			canvas.height = Math.max(1, Math.round(canvas.clientHeight * density))
			gl.viewport(0, 0, canvas.width, canvas.height)
			gl.uniform2f(uRes, canvas.width, canvas.height)
			gl.uniform1f(uScale, 460 * density)
		}

		let t = 0
		let last = 0
		let frame = 0
		let visible = false
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
		const draw = () => {
			gl.uniform1f(uTime, t)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
		}
		const tick = (now: number) => {
			t += Math.min(now - last, 50) / 1000
			last = now
			draw()
			frame = requestAnimationFrame(tick)
		}
		const sync = () => {
			cancelAnimationFrame(frame)
			const run = visible && !heldRef.current && !reduced.matches
			setMoving(!reduced.matches)
			if (run) {
				last = performance.now()
				frame = requestAnimationFrame(tick)
			} else {
				draw()
			}
		}

		resize()
		draw()
		const ro = new ResizeObserver(() => {
			resize()
			draw()
		})
		ro.observe(canvas)
		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting
			sync()
		})
		io.observe(canvas)
		reduced.addEventListener("change", sync)
		// next-themes flips the class on <html>; re-read the water's colours
		const mo = new MutationObserver(() => {
			paint()
			draw()
		})
		mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
		syncRef.current = sync

		return () => {
			cancelAnimationFrame(frame)
			ro.disconnect()
			io.disconnect()
			mo.disconnect()
			reduced.removeEventListener("change", sync)
		}
	}, [])

	const toggle = () => {
		heldRef.current = !heldRef.current
		setHeld(heldRef.current)
		syncRef.current?.()
	}

	return (
		<div className={cn("relative isolate overflow-hidden bg-shade", className)}>
			<canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 size-full" />
			{children}
			{moving && (
				<button
					type="button"
					onClick={toggle}
					aria-label={held ? "Play the water" : "Pause the water"}
					className="absolute bottom-4 left-4 inline-flex size-11 items-center justify-center rounded-full bg-light/80 text-ink shadow-[var(--edge-light),var(--shadow-card)] transition-[background-color] duration-200 ease-out hover:bg-light motion-reduce:transition-none">
					{held ? <Play className="size-4" /> : <Pause className="size-4" />}
				</button>
			)}
		</div>
	)
}
