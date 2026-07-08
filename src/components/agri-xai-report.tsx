"use client";

import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  BrainCircuit, 
  Activity, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAgriXaiReportAction } from "@/lib/actions";
import type { AgriXaiReport } from "@/lib/agri-xai-formatter";

interface AgriXaiReportCardProps {
  metrics: Record<string, number>;
  location: string;
  dateRange: string;
  recommendedCrop?: string;
}

export function AgriXaiReportCard({ metrics, location, dateRange, recommendedCrop = "Rice" }: AgriXaiReportCardProps) {
  const [report, setReport] = useState<AgriXaiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'importance' | 'whatif' | 'differential'>('importance');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAgriXaiReportAction(metrics, location, dateRange, recommendedCrop)
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setReport(res.data);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [metrics, location, dateRange, recommendedCrop]);

  if (loading) {
    return (
      <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400 text-sm font-semibold">Generating Explainable AI (XAI) Report...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <Card className="border border-red-500/20 bg-slate-900/60 backdrop-blur-xl">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-2 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <h3 className="font-bold text-white Outfit text-lg">Diagnostics Unavailable</h3>
          <p className="text-slate-400 text-sm">{error || "Could not parse environment metrics."}</p>
        </CardContent>
      </Card>
    );
  }

  // Helper for health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-950/40 border-emerald-500/30";
    if (score >= 50) return "text-amber-400 bg-amber-950/40 border-amber-500/30";
    return "text-red-400 bg-red-950/40 border-red-500/30";
  };

  const getMetricStatusBadge = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal':
        return <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/10">Optimal</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold hover:bg-amber-500/10">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 border-red-500/20 text-red-400 font-bold hover:bg-red-500/10">Critical</Badge>;
    }
  };

  return (
    <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      {/* Header banner */}
      <CardHeader className="border-b border-white/5 bg-slate-950/40 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-emerald-400" />
            <CardTitle className="text-xl font-bold text-white Outfit">
              Explainable AI (XAI) Crop & Water Decision Report
            </CardTitle>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Model parameters for location {location} | Date: {dateRange}
          </CardDescription>
        </div>
        
        {/* Health Score gauge */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getHealthColor(report.overallHealthScore)}`}>
          <Activity className="h-5 w-5" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-black opacity-80 tracking-wider">Health Score</div>
            <div className="text-lg font-extrabold Outfit leading-none">
              {report.overallHealthScore} / 100
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        
        {/* Overall Assessment */}
        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 flex gap-3 items-start">
          <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">AI Diagnostic Assessment</div>
            <p className="text-sm font-semibold text-slate-200">{report.overallAssessment}</p>
          </div>
        </div>

        {/* Environmental Thresholds Check */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Indices & Environmental Thresholds Validation
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(report.metricsAnalysis).map(([key, metric]) => (
              <div 
                key={key} 
                className={`p-3.5 rounded-xl border bg-slate-950/30 flex flex-col justify-between gap-1.5 transition-all hover:bg-slate-950/50 ${
                  metric.status !== 'optimal' ? 'border-amber-500/20 bg-amber-950/5' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{key}</span>
                  {getMetricStatusBadge(metric.status)}
                </div>
                <div className="text-lg font-extrabold text-white Outfit">
                  {metric.value.toFixed(3)}
                </div>
                <span className="text-[10.5px] text-slate-400 leading-tight">
                  {metric.name}
                </span>
                {metric.warningMessage && (
                  <div className="mt-1 flex items-start gap-1 text-[10px] text-amber-300 font-semibold leading-tight">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{metric.warningMessage}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs for XAI details */}
        <div className="border-b border-white/5 flex gap-2">
          <button
            onClick={() => setActiveTab('importance')}
            className={`pb-2.5 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'importance' 
                ? 'text-emerald-400 border-emerald-500' 
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Decision Weights
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`pb-2.5 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'whatif' 
                ? 'text-emerald-400 border-emerald-500' 
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            What-If Scenarios
          </button>
          <button
            onClick={() => setActiveTab('differential')}
            className={`pb-2.5 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'differential' 
                ? 'text-emerald-400 border-emerald-500' 
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Sprout className="h-4 w-4" />
            Crop Comparison
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[160px]">
          
          {/* Tab 1: Feature Importance / Decision Weights */}
          {activeTab === 'importance' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-medium">
                The chart below shows how heavily the GEE metrics weighed in recommending <strong className="text-white">{recommendedCrop}</strong>:
              </div>
              <div className="space-y-3.5">
                {report.featureImportance.map((feature, i) => (
                  <div key={i} className="space-y-1.5 p-3 rounded-xl border border-white/5 bg-slate-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white Outfit">{feature.metric}</span>
                        <Badge className={`text-[9px] px-1 py-0.5 font-bold ${
                          feature.impact === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {feature.impact} Impact
                        </Badge>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{(feature.weight * 100).toFixed(0)}% weight</span>
                    </div>
                    <Progress value={feature.weight * 100} className="h-2 bg-slate-950" />
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <Info className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <span>{feature.explanation}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: What-If Counterfactuals */}
          {activeTab === 'whatif' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-medium">
                Simulated counterfactual scenarios showing how recommendations respond to shifting environment parameters:
              </div>
              <div className="space-y-3">
                {report.counterfactuals.map((scenario, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 Outfit">Parameter: {scenario.parameter}</span>
                      <Badge className="bg-white/5 border border-white/10 text-slate-300 font-mono text-[9px]">{scenario.change}</Badge>
                    </div>
                    <div className="text-xs font-medium text-slate-200">
                      <strong>AI Simulation Response:</strong> {scenario.impactOnRecommendation}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-800/20 px-2 py-1 rounded w-fit">
                      Impact: {scenario.confidenceShift}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Differential Crop Analysis */}
          {activeTab === 'differential' && report.differential && (
            <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-slate-950/20">
              
              {/* Crop Choice comparison */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="text-left">
                  <div className="text-[9.5px] uppercase font-bold text-slate-400">Primary Selection</div>
                  <div className="text-base font-extrabold text-emerald-400 Outfit flex items-center gap-1.5">
                    <Sprout className="h-4 w-4" />
                    {report.differential.primaryCrop} ({report.differential.primaryConfidence}%)
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <div className="text-right">
                  <div className="text-[9.5px] uppercase font-bold text-slate-400">Close Alternative</div>
                  <div className="text-base font-extrabold text-slate-300 Outfit">
                    {report.differential.alternativeCrop} ({report.differential.alternativeConfidence}%)
                  </div>
                </div>
              </div>

              {/* Distinguishing parameters */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Distinguishing Factors:</div>
                <ul className="space-y-1.5">
                  {report.differential.distinguishingFactors.map((factor, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-slate-300 font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation Note */}
              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-400 italic leading-relaxed">
                {report.differential.recommendationNote}
              </div>

            </div>
          )}

        </div>

      </CardContent>
    </Card>
  );
}
