import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { user, error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      return;
    }

    const role = user?.role;
    if (role === "ADMIN")       navigate("/dashboard/incidents",  { replace: true });
    else if (role === "TECHNICIAN") navigate("/dashboard/technician", { replace: true });
    else                        navigate("/dashboard/my-tickets", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* ── Left branding panel (desktop only) ── */}
      <div style={{
        display: "none",
        flex: "0 0 48%",
        background: "var(--gradient-hero)",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        position: "relative",
        overflow: "hidden",
      }} className="login-left-panel">
        <div style={{
          position: "absolute", top: "15%", left: "18%",
          width: 220, height: 220, borderRadius: "50%",
          background: "hsla(219,91%,64%,0.1)", filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%",
          width: 280, height: 280, borderRadius: "50%",
          background: "hsla(258,95%,76%,0.1)", filter: "blur(60px)",
        }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
            boxShadow: "var(--shadow-glow)",
          }}>
            <GraduationCap size={40} color="#fff" />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Smart Campus
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: 320, lineHeight: 1.6 }}>
            Manage facilities, track incidents, and keep your campus running smoothly.
          </p>

          {/* Credential hints for dev use */}
          <div style={{
            marginTop: "2.5rem", textAlign: "left",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "1.25rem 1.5rem",
            fontSize: "0.8rem", lineHeight: 2,
            color: "var(--text-secondary)",
          }}>
            <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.4rem" }}>
              Login Credentials
            </p>
            <p><span style={{ color: "hsl(var(--warning))" }}>Admin</span> &nbsp;&nbsp; admin@smartcampus.com / admin123</p>
            <p><span style={{ color: "hsl(var(--primary))" }}>User</span> &nbsp;&nbsp;&nbsp;&nbsp; user@smartcampus.com / user123</p>
            <p><span style={{ color: "hsl(var(--success))" }}>Tech</span> &nbsp;&nbsp;&nbsp;&nbsp; tech@smartcampus.com / tech123</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "hsl(var(--background))",
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          boxShadow: "var(--shadow-elevated)",
        }}>
          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "var(--gradient-primary)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
              boxShadow: "var(--shadow-glow)",
            }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Smart Campus
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }} />
                <input
                  type="email"
                  required
                  placeholder="you@smartcampus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.6rem 0.75rem 0.6rem 2.4rem",
                    background: "hsl(var(--input))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8, color: "hsl(var(--foreground))",
                    fontSize: "0.9rem", outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }} />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "0.6rem 2.5rem 0.6rem 2.4rem",
                    background: "hsl(var(--input))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8, color: "hsl(var(--foreground))",
                    fontSize: "0.9rem", outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-secondary)", display: "flex",
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p style={{
                color: "hsl(var(--destructive))",
                background: "hsla(0,91%,71%,0.1)",
                border: "1px solid hsla(0,91%,71%,0.25)",
                borderRadius: 8, padding: "0.6rem 0.85rem",
                fontSize: "0.85rem", margin: 0,
              }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "0.7rem",
                background: loading ? "hsl(var(--muted))" : "var(--gradient-primary)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: "0.95rem", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
