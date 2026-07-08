"use client";

import Link from "next/link";
import { 
  Globe2, 
  LayoutDashboard, 
  Settings, 
  Mail, 
  Menu, 
  DollarSign, 
  Bell, 
  Sprout, 
  Cpu 
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ContactSheet } from "./contact-sheet";
import { LanguageSwitcher } from "./language-switcher";
import { useLanguage } from "@/hooks/use-language";
import { useFarmerMode } from "@/hooks/use-farmer-mode";
import { useAlerts } from "@/hooks/use-alerts";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Header() {
  const { t } = useLanguage();
  const { isFarmerMode, setFarmerMode } = useFarmerMode();
  const { unreadCount } = useAlerts();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [isContactOpen, setContactOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = cn(
    "sticky top-0 z-50 w-full transition-all duration-300",
    isLandingPage && !isScrolled
      ? "bg-transparent text-white"
      : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground"
  );

  const buttonLinkClass = cn(
    isLandingPage && !isScrolled ? "text-white hover:bg-white/20" : ""
  );

  return (
    <header className={navClass}>
      <div className="container flex h-16 items-center">
        {/* Branding Logo & Title */}
        <div className="mr-auto flex items-center">
          <Link href={isFarmerMode ? "/kisan" : "/"} className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-xl tracking-tight">
              {t("header.title")}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 mr-2">
          {isFarmerMode ? (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/kisan" && "bg-muted font-bold"
                )}
              >
                <Link href="/kisan">
                  <Sprout className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/crop-advisor" && "bg-muted font-bold"
                )}
              >
                <Link href="/crop-advisor">
                  <Sprout className="mr-2 h-4 w-4" />
                  {t("dashboard.input.cropAdvisor")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/alerts" && "bg-muted font-bold"
                )}
              >
                <Link href="/alerts" className="relative">
                  <Bell className="mr-2 h-4 w-4" />
                  Alerts
                  {unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/dashboard" && "bg-muted font-bold"
                )}
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("header.dashboard")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/predict" && "bg-muted font-bold"
                )}
              >
                <Link href="/predict">
                  <Cpu className="mr-2 h-4 w-4" />
                  {t("landing.hero.predictiveTools")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/pricing" && "bg-muted font-bold"
                )}
              >
                <Link href="/pricing">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t("header.pricing")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  buttonLinkClass,
                  pathname === "/settings" && "bg-muted font-bold"
                )}
              >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("header.settings")}
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Desktop Controls (Toggle, Lang, Theme, Contact) */}
        <div className="flex items-center justify-end space-x-2 md:ml-4">
          <div className="hidden sm:flex items-center space-x-2">
            {/* Desktop Farmer Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/60 dark:bg-muted/40 px-3.5 py-1.5 rounded-full border border-muted shadow-sm mr-1">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">
                {t("kisan.mode.farmer")}
              </span>
              <Switch
                checked={isFarmerMode}
                onCheckedChange={setFarmerMode}
                aria-label="Toggle Farmer Mode"
                className="scale-90"
              />
            </div>

            {/* Desktop Notification Bell Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn("relative h-10 w-10 rounded-full", buttonLinkClass)}
            >
              <Link href="/alerts" aria-label="View Alerts Feed">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-1 ring-background animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </Button>

            <LanguageSwitcher className={buttonLinkClass} />
            <ThemeToggle />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setContactOpen(true)}
              className="font-semibold shadow-sm"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("header.contact")}
            </Button>
          </div>

          {/* Mobile Menu & controls */}
          <div className="flex items-center space-x-2 sm:hidden">
            {/* Mobile Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn("relative h-10 w-10 rounded-full", buttonLinkClass)}
            >
              <Link href="/alerts" aria-label="View Alerts Feed">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-1 ring-background animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={buttonLinkClass}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-5 mt-8">
                  {/* Mobile Farmer Mode Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-muted shadow-sm">
                    <span className="text-base font-bold text-foreground">
                      {t("kisan.mode.farmer")}
                    </span>
                    <Switch
                      checked={isFarmerMode}
                      onCheckedChange={(val) => {
                        setFarmerMode(val);
                        setMobileMenuOpen(false);
                      }}
                      aria-label="Toggle Farmer Mode"
                    />
                  </div>

                  {isFarmerMode ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/kisan"
                          className={cn(
                            "flex items-center gap-2 text-lg font-bold p-2 rounded-lg",
                            pathname === "/kisan" && "text-primary bg-muted/30"
                          )}
                        >
                          <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/crop-advisor"
                          className={cn(
                            "flex items-center gap-2 text-lg font-bold p-2 rounded-lg",
                            pathname === "/crop-advisor" && "text-primary bg-muted/30"
                          )}
                        >
                          <Sprout className="h-5 w-5" />
                          {t("dashboard.input.cropAdvisor")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/alerts"
                          className={cn(
                            "flex items-center gap-2 text-lg font-bold p-2 rounded-lg",
                            pathname === "/alerts" && "text-primary bg-muted/30"
                          )}
                        >
                          <Bell className="h-5 w-5" />
                          Alerts ({unreadCount})
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className={cn(
                            "flex items-center gap-2 text-lg font-medium p-2 rounded-lg",
                            pathname === "/dashboard" && "text-primary bg-muted/30"
                          )}
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          {t("header.dashboard")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/predict"
                          className={cn(
                            "flex items-center gap-2 text-lg font-medium p-2 rounded-lg",
                            pathname === "/predict" && "text-primary bg-muted/30"
                          )}
                        >
                          <Cpu className="h-5 w-5" />
                          {t("landing.hero.predictiveTools")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/pricing"
                          className={cn(
                            "flex items-center gap-2 text-lg font-medium p-2 rounded-lg",
                            pathname === "/pricing" && "text-primary bg-muted/30"
                          )}
                        >
                          <DollarSign className="h-5 w-5" />
                          {t("header.pricing")}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/settings"
                          className={cn(
                            "flex items-center gap-2 text-lg font-medium p-2 rounded-lg",
                            pathname === "/settings" && "text-primary bg-muted/30"
                          )}
                        >
                          <Settings className="h-5 w-5" />
                          {t("header.settings")}
                        </Link>
                      </SheetClose>
                    </>
                  )}

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-lg font-medium p-2 rounded-lg"
                      onClick={() => setContactOpen(true)}
                    >
                      <Mail className="h-5 w-5" />
                      {t("header.contact")}
                    </Button>
                  </SheetClose>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <ContactSheet open={isContactOpen} onOpenChange={setContactOpen} />
    </header>
  );
}
