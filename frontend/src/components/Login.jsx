import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 left-[20%] w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-orb-drift" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-orb-drift" style={{ animationDelay: "4s" }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow animate-glow-pulse">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Smart Campus</h1>
          <p className="text-muted-foreground max-w-sm">Report and track maintenance issues across your campus.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md shadow-elevated border border-border">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 lg:hidden shadow-glow">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-heading">User Sign In</CardTitle>
            <CardDescription>Sign in to your SmartCampus account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@university.edu" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-heading font-bold" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
            </p>
            <div className="mt-4 pt-4 border-t border-border text-center space-y-2">
              <p className="text-xs text-muted-foreground">Other portals:</p>
              <div className="flex gap-2 justify-center">
                <Link to="/admin/login" className="text-xs text-warning hover:underline">Admin Login</Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/technician/login" className="text-xs text-info hover:underline">Technician Login</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
