"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  BarChart, 
  Download, 
  SlidersHorizontal, 
  CheckCircle, 
  ArrowRight, 
  BrainCircuit, 
  Languages, 
  Volume2, 
  Sprout, 
  LineChart, 
  CloudSun, 
  Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { ContactSheet } from "@/components/contact-sheet";
import { useLanguage } from "@/hooks/use-language";
import { Chatbot } from "@/components/chatbot";
import { getCurrentUserAction } from "@/lib/actions";

export default function LandingPage() {
    const { t } = useLanguage();
    const [isContactOpen, setContactOpen] = useState(false);
    const [user, setUser] = useState<{ userId: string; role: string } | null>(null);

    useEffect(() => {
        getCurrentUserAction().then(res => {
            if (res.data) {
                setUser(res.data);
            }
        });
    }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Header />
      
      <main className="flex-1 relative">
        {/* Decorative Nature Gradient background beams */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 flex items-center justify-center border-b border-white/5">
          <div className="container px-4 md:px-6 z-10">
            <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider w-fit">
                <Sparkles className="h-3 w-3" />
                Farmer-First Agricultural Platform
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl text-white Outfit leading-tight">
                Kisan Alert <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 bg-clip-text text-transparent">
                  {t('landing.hero.title')}
                </span>
              </h1>
              
              <p className="max-w-[700px] text-lg text-slate-400 md:text-xl font-medium">
                {t('landing.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center">
                {user ? (
                  <>
                    <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-950/40">
                      <Link href="/kisan">
                        <Sprout className="mr-2 h-5 w-5" />
                        Farmer Console
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all hover:scale-105">
                      <Link href="/dashboard">
                        <LineChart className="mr-2 h-5 w-5 text-emerald-400" />
                        Analyst Dashboard
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-950/40">
                      <Link href="/auth">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-all hover:scale-105">
                      <Link href="/kisan">
                        Try Farmer Mode
                        <Sprout className="ml-2 h-5 w-5 text-emerald-400" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Dual Mode Feature Comparison */}
        <section className="w-full py-16 md:py-24 bg-slate-900/30 border-b border-white/5">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold sm:text-4xl text-white Outfit">
                Dual-Tailored Agricultural Cockpits
              </h2>
              <p className="text-slate-400 font-medium">
                Switch modes effortlessly. Access simple, voice-enabled tools for active field farming, or deep dive into satellite indices and environmental risk analysis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Card 1: Farmer Mode */}
              <div className="flex flex-col justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-900/10 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Sprout className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white Outfit">Farmer Mode (Kisan cockpit)</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Designed specifically for active growers. Features simplified insights that answer critical questions with minimal screen interaction.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-emerald-400" />
                      13 regional languages (Hindi, Marathi, Telugu, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                      One-tap Text-to-Speech audio updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CloudSun className="h-4 w-4 text-emerald-400" />
                      Soil moisture & immediate irrigation scheduling
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button asChild className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold rounded-xl">
                    <Link href="/kisan">Open Farmer Mode</Link>
                  </Button>
                </div>
              </div>

              {/* Card 2: Analyst Mode */}
              <div className="flex flex-col justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-900/10 hover:border-amber-500/30 transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white Outfit">Analyst Mode (Satellite cockpit)</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Built for agricultural advisors, research analysts, and regional monitors. Contains advanced geospatial instruments.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-amber-400" />
                      Google Earth Engine API imagery processing
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-amber-400" />
                      Multi-spectral indices (NDVI, NDWI, LSWI, EVI)
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-amber-400" />
                      Scenario predictions and raw data export
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button asChild className="w-full bg-amber-600/80 hover:bg-amber-600 text-white font-bold rounded-xl">
                    <Link href="/dashboard">Open Analyst Mode</Link>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-block rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-bold uppercase">
                {t('landing.features.keyFeatures')}
              </div>
              <h2 className="text-3xl font-extrabold sm:text-4xl text-white Outfit">
                {t('landing.features.title')}
              </h2>
              <p className="text-slate-400 font-medium">
                {t('landing.features.subtitle')}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4">
              
              <div className="grid gap-2 text-center p-6 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 transition-colors">
                <SlidersHorizontal className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white Outfit mt-2">{t('landing.features.coordinateInput')}</h3>
                <p className="text-xs text-slate-400">
                  {t('landing.features.coordinateInputDesc')}
                </p>
              </div>
              
              <div className="grid gap-2 text-center p-6 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 transition-colors">
                <Cpu className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white Outfit mt-2">{t('landing.features.metricComputation')}</h3>
                <p className="text-xs text-slate-400">
                  {t('landing.features.metricComputationDesc')}
                </p>
              </div>
              
              <div className="grid gap-2 text-center p-6 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 transition-colors">
                <BarChart className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white Outfit mt-2">{t('landing.features.interactiveVisuals')}</h3>
                <p className="text-xs text-slate-400">
                  {t('landing.features.interactiveVisualsDesc')}
                </p>
              </div>
              
              <div className="grid gap-2 text-center p-6 rounded-2xl border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 transition-colors">
                <Download className="h-10 w-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white Outfit mt-2">{t('landing.features.exportEasily')}</h3>
                <p className="text-xs text-slate-400">
                  {t('landing.features.exportEasilyDesc')}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="about" className="w-full py-16 md:py-24 bg-slate-900/40 border-y border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-block rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-bold uppercase">
                  {t('landing.whyUs.tag')}
                </div>
                <h2 className="text-3xl font-extrabold sm:text-4xl text-white Outfit">{t('landing.whyUs.title')}</h2>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {t('landing.whyUs.subtitle')}
                </p>
              </div>

              <div className="lg:col-span-7">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <li className="flex items-start p-4 rounded-xl border border-white/5 bg-slate-950/40">
                    <CheckCircle className="h-6 w-6 mr-3 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-slate-300 text-sm"><strong>{t('landing.whyUs.point1')}</strong></span>
                  </li>
                  <li className="flex items-start p-4 rounded-xl border border-white/5 bg-slate-950/40">
                    <CheckCircle className="h-6 w-6 mr-3 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-slate-300 text-sm"><strong>{t('landing.whyUs.point2')}</strong></span>
                  </li>
                  <li className="flex items-start p-4 rounded-xl border border-white/5 bg-slate-950/40">
                    <CheckCircle className="h-6 w-6 mr-3 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-slate-300 text-sm"><strong>{t('landing.whyUs.point3')}</strong></span>
                  </li>
                  <li className="flex items-start p-4 rounded-xl border border-white/5 bg-slate-950/40">
                    <CheckCircle className="h-6 w-6 mr-3 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-slate-300 text-sm"><strong>{t('landing.whyUs.point4')}</strong></span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Call To Action Banner */}
        {!user && (
          <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
            <div className="container px-4 md:px-6 text-center max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-extrabold sm:text-4xl text-white Outfit">
                Get Localized Irrigation and Soil Moister Alerts
              </h2>
              <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                Create a Kisan Alert account today to specify your coordinate location and receive automatic alerts on drought and crop health.
              </p>
              <div>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-105">
                  <Link href="/auth">Register Account Now</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer id="contact" className="py-8 w-full shrink-0 border-t border-white/5 bg-slate-950">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#about" className="text-xs hover:underline underline-offset-4 text-slate-400 hover:text-white" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})}}>{t('footer.about')}</Link>
            <button className="text-xs hover:underline underline-offset-4 text-slate-400 hover:text-white" onClick={() => setContactOpen(true)}>{t('footer.contact')}</button>
          </nav>
          <p className="text-xs text-slate-500 text-center">
            {t('footer.copyright')}
          </p>
          <div className="w-24 hidden sm:block"></div>
        </div>
      </footer>

      <ContactSheet open={isContactOpen} onOpenChange={setContactOpen} />
      <Chatbot />
    </div>
  );
}
