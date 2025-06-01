import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomString(length: number) {
  return Crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export function getDeviceFromUA(ua: string): { dev: string, isBot: boolean } {
  if (ua.includes("iPhone")){
    return { dev: "iPhone", isBot: false }
  }

  if (ua.includes("iPad")){
    return { dev: "iPad", isBot: false }
  }

  if(ua.includes("Android")){
    if (ua.includes("SM-")){
      return { dev: "Samsung Galaxy", isBot: false }
    }
    
    if (ua.includes("Pixel")){
      return { dev: "Google Pixel", isBot: false }
    }

    if (ua.includes("OPPO")){
      return { dev: "Oppo", isBot: false }
    }
    if (ua.includes("Vivo")){
      return { dev: "Vivo", isBot: false }
    }

    if (ua.includes("HUAWEI")){
      return { dev: "Huawei", isBot: false }
    }

    return { dev: "Android Device", isBot: false }
  }

  if (ua.includes("Windows NT")){
    if (ua.includes("NT 10.0")){
      return { dev: "Windows 10/11", isBot: false }
    }
    if (ua.includes("NT 6.3")){
      return { dev: "Windows 8.1", isBot: false }
    }
    if (ua.includes("NT 6.2")){
      return { dev: "Windows 8", isBot: false }
    }
    if (ua.includes("NT 6.1")){
      return { dev: "Windows 7", isBot: false }
    }
    if (ua.includes("NT 6.0")){
      return { dev: "Windows Vista", isBot: false }
    }
    if (ua.includes("NT 5.1")){
      return { dev: "Windows XP", isBot: false }
    }
    return { dev: "Other Windows PC", isBot: false }
  }

  if (ua.includes("Linux")){
    return { dev: "Linux PC", isBot: false }
  }

  if (ua.includes("Macintosh") || ua.includes("Mac OS X")) {
    return { dev: "Mac", isBot: false }
  }

  if (ua.includes("CrOS")) {
    return { dev: "Chrome OS", isBot: false }
  }

  if (ua.includes("bot") || ua.includes("crawl") || ua.includes("spider") || ua.includes("slurp")) {
    if (ua.includes("Googlebot")) {
      return { dev: "Googlebot", isBot: true }
    }
    if (ua.includes("bingbot")) {
      return { dev: "Bingbot", isBot: true }
    }
    if (ua.includes("Slurp")) {
      return { dev: "Yahoo Slurp", isBot: true }
    }
    if (ua.includes("DuckDuckBot")) {
      return { dev: "DuckDuckBot", isBot: true }
    }
    if (ua.includes("Baiduspider")) {
      return { dev: "Baiduspider", isBot: true }
    }
    if (ua.includes("ChatGPT")) {
      return { dev: "ChatGPT Bot", isBot: true }
    }
    if (ua.includes("OAI-SearchBot")){
      return { dev: "OpenAI Search Bot", isBot: true }
    }
    if (ua.includes("FacebookBot")){
      return { dev: "Facebook Bot", isBot: true }
    }
    if (ua.includes("Twitterbot")){
      return { dev: "Twitter Bot", isBot: true }
    }
  }

  return { dev: "Other", isBot: false }
}

export function getBrowserFromUA(ua: string): string {
  if (ua.includes("Firefox")) {
    return "Firefox"
  }
  if (ua.includes("Edg/")) {
    return "Microsoft Edge"
  }
  if (ua.includes("Chrome") && ua.includes("Safari")) {
    return "Google Chrome"
  }
  if (ua.includes("Safari") && !ua.includes("Chrome")) {
    return "Safari"
  }
  if (ua.includes("OPR/")) {
    return "Opera"
  }
  if (ua.includes("Trident/")) {
    return "Internet Explorer"
  }
  return "Other Browser"
}