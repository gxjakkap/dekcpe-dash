import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

import Navigation from "../ui/navigation";
import { Button } from "../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../ui/navbar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  customActionComponent? :ReactNode;
  className?: string;
}

const HOME_URL = `https://dash.dekcpe.link/`;
const DASH_URL = (new URL('/d', "https://dash.dekcpe.link/")).toString()

const MOBILE_LINKS = [
  { text: "Dashboard", href: DASH_URL },
]

const ACTIONS: NavbarActionProps[] = [
  { text: "Sign in", href: DASH_URL, isButton: true, variant: "default" },
]

export default function Navbar({
  customActionComponent = null,
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={HOME_URL}
              className="flex items-center gap-2 text-xl font-bold"
            >
              <h3 className="text-xl font-bold">dekcpe.link 🔗</h3>
            </a>
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          <NavbarRight>
            {!customActionComponent && ACTIONS.map((action, index) =>
              action.isButton ? (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  asChild
                >
                  <a href={action.href}>
                    {action.icon}
                    {action.text}
                    {action.iconRight}
                  </a>
                </Button>
              ) : (
                <a
                  key={index}
                  href={action.href}
                  className="hidden text-sm md:block"
                >
                  {action.text}
                </a>
              ),
            )}
            {!!customActionComponent && (
              <div className="flex items-center ml-2">
                {customActionComponent}
              </div>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href={HOME_URL}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>dekcpe.link</span>
                  </a>
                  {MOBILE_LINKS.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
