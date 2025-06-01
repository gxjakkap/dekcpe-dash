import { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { AuroraText } from "@/components/magicui/aurora-text"
import Github from "@/components/logos/github";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroData {
  title?: string;
  title_aurora?: string
  description?: string;
  badge: ReactNode | false;
  buttons: HeroButtonProps[] | false;
}

interface HeroProps {
  className?: string;
}

const siteConfig = {
  getStartedUrl: (new URL('/d', "https://dash.dekcpe.link/")).toString(),
  links: {
    github: "https://github.com/gxjakkap/dekcpe.link",
  },
}

const HERO_DATA: HeroData = {
  title: "Short link have never been",
  title_aurora: "easier",
  description: "From link shortening to QR code generation, we got you covered.",
  badge: (
    <Badge variant="outline" className="animate-appear">
      <AnimatedGradientText>
        Exclusive to CPE Students and Staff!
      </AnimatedGradientText>
      <span>🎉</span>
      <a href={siteConfig.getStartedUrl} className="flex items-center gap-1">
        Try it now
        <ArrowRightIcon className="size-3" />
      </a>
    </Badge>
  ),
  buttons: [
    {
      href: siteConfig.getStartedUrl,
      text: "Get Started",
      variant: "default",
    },
    {
      href: siteConfig.links.github,
      text: "Github",
      variant: "outline",
      icon: <Github className="mr-2 size-4" />,
    },
  ]
}

export default function Hero({ className }: HeroProps) {
  const { title, title_aurora, description, badge, buttons } = HERO_DATA
  return (
    <Section
      className={cn(
        "overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}{" "}<AuroraText>{title_aurora}</AuroraText>
          </h1>
          <p className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          {buttons !== false && buttons.length > 0 && (
            <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "default"}
                  size="lg"
                  asChild
                >
                  <a href={button.href}>
                    {button.icon}
                    {button.text}
                    {button.iconRight}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
