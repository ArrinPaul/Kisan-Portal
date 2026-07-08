"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe2, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { signInAction, signUpAction } from "@/lib/actions";

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("analyst"); // Default role

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!name) {
          toast({
            title: "Name required",
            description: "Please enter your full name to register.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const res = await signUpAction(name, email, role);
        if (res.error) {
          toast({
            title: "Registration Failed",
            description: res.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created",
            description: `Welcome, ${name}! Your account has been registered successfully.`,
          });
          // Redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        const res = await signInAction(email);
        if (res.error) {
          toast({
            title: "Sign In Failed",
            description: res.error,
            variant: "destructive",
          });
        } else if (res.data) {
          toast({
            title: "Welcome Back",
            description: `Successfully signed in as ${res.data.name || email}!`,
          });
          // Redirect to dashboard
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Auth handler error:", err);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred during auth.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Nature/Agricultural Backdrop Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-700/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-700/10 blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo/Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <Globe2 className="h-10 w-10 text-emerald-500 animate-pulse" />
            <span className="font-extrabold text-3xl tracking-tight text-white Outfit">
              Kisan Alert
            </span>
          </Link>
          <p className="text-sm text-slate-400 text-center font-medium">
            &quot;Tell me, in my language, whether I need to water, spray, or worry today.&quot;
          </p>
        </div>

        {/* Auth Panel Card */}
        <Card className="border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white Outfit text-center">
              {isSignUp ? "Create your account" : "Sign in to Kisan Alert"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-center">
              {isSignUp
                ? "Register your details to get localized environmental alerts"
                : "Enter your email address to log in to your farm console"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 font-semibold">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-slate-950/50 border-white/10 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-white/10 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-white/10 text-white placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-300 font-semibold">
                    Account Role
                  </Label>
                  <div className="relative">
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-slate-950/50 border-white/10 text-white focus:ring-emerald-500">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="viewer">Farmer / Basic Viewer</SelectItem>
                        <SelectItem value="analyst">Agri-Analyst / Consultant</SelectItem>
                        <SelectItem value="admin">Administrator / Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex gap-2 justify-center items-center shadow-lg shadow-emerald-950/50"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Register Account" : "Access Console"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
              }}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Create one"}
            </button>
            <Link
              href="/"
              className="text-xs text-slate-500 hover:underline hover:text-slate-400 transition-colors"
            >
              ← Back to main landing page
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
