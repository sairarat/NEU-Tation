import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { GraduationCap, Loader2, CheckCircle2, ArrowRight, Hash, ChevronDown } from "lucide-react";
import { departmentOptions } from "./constants/departmentOptions";

const CompleteProfile = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();

  const [college, setCollege]         = useState("");
  const [role, setRole]               = useState("visitor");
  const [studentNo, setStudentNo]     = useState("");
  const [loading, setLoading]         = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  const handleStudentNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 12) setStudentNo(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !college) return;

    if (role === "student") {
      const pattern = /^\d{2}-\d{5}-\d{3}$/;
      if (!pattern.test(studentNo)) {
        alert("Invalid format. Please use: ##-#####-###");
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          college_office: college,
          role:           role,
          student_number: role === "student" ? studentNo : null,
          updated_at:     new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save profile. Please check your database columns.");
    } finally {
      setLoading(false);
    }
  };

  /* Navigate to the right place based on role */
  const handleContinue = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user?.id)
      .single();
    navigate(data?.role === "admin" ? "/admin-dashboard" : "/dashboard");
  };

  /* Shared input style */
  const fieldBase: React.CSSProperties = {
    width: "100%",
    height: "50px",
    padding: "0 16px",
    borderRadius: "13px",
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    fontFamily: "inherit",
    appearance: "none",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor     = "#10b981";
    e.currentTarget.style.backgroundColor = "#ffffff";
    e.currentTarget.style.boxShadow       = "0 0 0 3px rgba(16,185,129,0.12)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor     = "#e2e8f0";
    e.currentTarget.style.backgroundColor = "#f8fafc";
    e.currentTarget.style.boxShadow       = "";
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    marginBottom: "7px",
  };

  const roleOptions = [
    { value: "visitor", label: "Visitor",        emoji: "👤" },
    { value: "student", label: "Student",         emoji: "🎓" },
    { value: "staff",   label: "Staff / Faculty", emoji: "👨‍🏫" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "transparent",
        }}
      >

        {/* ══════════════════════════════════════
            SUCCESS MODAL
        ══════════════════════════════════════ */}
        {showSuccess && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,8,23,0.75)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "44px 40px",
                borderRadius: "32px",
                maxWidth: "400px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 40px 80px -12px rgba(0,0,0,0.45)",
                animation: "scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
              }}
            >
              {/* Animated check ring */}
              <div
                style={{
                  width: "80px", height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: "0 0 0 8px rgba(16,185,129,0.08)",
                }}
              >
                <CheckCircle2 size={44} color="#10b981" strokeWidth={2} />
              </div>

              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                You're all set!
              </h2>
              <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: 1.6, margin: "0 0 28px" }}>
                Welcome to the NEU Library system.
                <br />Your profile has been saved.
              </p>

              <button
                onClick={handleContinue}
                style={{
                  width: "100%",
                  height: "54px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.2px",
                  boxShadow: "0 6px 18px rgba(16,185,129,0.32)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform  = "translateY(-2px)";
                  e.currentTarget.style.boxShadow  = "0 10px 28px rgba(16,185,129,0.38)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform  = "";
                  e.currentTarget.style.boxShadow  = "0 6px 18px rgba(16,185,129,0.32)";
                }}
              >
                Continue to Dashboard <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            PROFILE CARD
        ══════════════════════════════════════ */}
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#ffffff",
            borderRadius: "32px",
            overflow: "hidden",
            boxShadow: "0 24px 64px -12px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
            animation: "slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Top accent — full-width gradient bar */}
          <div style={{ height: "5px", background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)" }} />

          <div style={{ padding: "40px 40px 44px" }}>

            {/* ── Header ── */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div
                style={{
                  width: "68px", height: "68px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderRadius: "20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 12px 28px rgba(16,185,129,0.30)",
                }}
              >
                <GraduationCap color="white" size={34} strokeWidth={2} />
              </div>

              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                Setup Your Profile
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                Tell us a little about yourself to complete your access.
              </p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Department */}
              <div>
                <label style={labelStyle}>College / Department</label>
                <div style={{ position: "relative" }}>
                  <select
                    style={fieldBase}
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    required
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="" disabled>Select your department</option>
                    {departmentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                  />
                </div>
              </div>

              {/* Role — styled radio-like buttons */}
              <div>
                <label style={labelStyle}>I am a…</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {roleOptions.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => { setRole(opt.value); if (opt.value !== "student") setStudentNo(""); }}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "12px",
                        border: `1.5px solid ${role === opt.value ? "#10b981" : "#e2e8f0"}`,
                        background: role === opt.value ? "rgba(16,185,129,0.08)" : "#f8fafc",
                        color: role === opt.value ? "#059669" : "#64748b",
                        fontWeight: role === opt.value ? 700 : 500,
                        fontSize: "12.5px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: role === opt.value ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
                      }}
                      onMouseEnter={e => {
                        if (role !== opt.value) {
                          e.currentTarget.style.borderColor = "#10b981";
                          e.currentTarget.style.color       = "#10b981";
                        }
                      }}
                      onMouseLeave={e => {
                        if (role !== opt.value) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.color       = "#64748b";
                        }
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student number (conditional) */}
              {role === "student" && (
                <div style={{ animation: "fadeIn 0.35s ease-out" }}>
                  <label style={labelStyle}>Student Number</label>
                  <div style={{ position: "relative" }}>
                    <Hash
                      size={16}
                      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                    />
                    <input
                      type="text"
                      placeholder="##-#####-###"
                      style={{ ...fieldBase, paddingLeft: "40px" }}
                      value={studentNo}
                      onChange={handleStudentNoChange}
                      required
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "5px", marginBottom: 0 }}>
                    Format: 00-00000-000
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !college}
                style={{
                  width: "100%",
                  height: "54px",
                  background: loading || !college
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #1e293b, #0f172a)",
                  color: loading || !college ? "#94a3b8" : "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading || !college ? "not-allowed" : "pointer",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.2px",
                  transition: "all 0.2s ease",
                  boxShadow: loading || !college ? "none" : "0 6px 18px rgba(15,23,42,0.20)",
                }}
                onMouseEnter={e => {
                  if (!loading && college) {
                    e.currentTarget.style.transform  = "translateY(-2px)";
                    e.currentTarget.style.boxShadow  = "0 10px 28px rgba(15,23,42,0.28)";
                  }
                }}
                onMouseLeave={e => {
                  if (!loading && college) {
                    e.currentTarget.style.transform  = "";
                    e.currentTarget.style.boxShadow  = "0 6px 18px rgba(15,23,42,0.20)";
                  }
                }}
              >
                {loading
                  ? <><Loader2 size={20} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…</>
                  : "Complete Setup"}
              </button>
            </form>

          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
};

export default CompleteProfile;