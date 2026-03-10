import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { GraduationCap, Loader2, CheckCircle2, ArrowRight, Hash } from "lucide-react";

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
          role: role,
          student_number: role === "student" ? studentNo : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert("Failed to save profile. Please check your database columns.");
    } finally {
      setLoading(false);
    }
  };

  // select-custom shared style
  const selectStyle: React.CSSProperties = {
    height: '52px',
    padding: '0 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
  };

  return (
    // profile-setup-container
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: '100vh',
        background: 'transparent',
        padding: '24px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Success Modal Overlay ── */}
      {showSuccess && (
        // modal-overlay-blur
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(15,23,42,0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            padding: '20px',
          }}
        >
          {/* success-card-modern */}
          <div
            className="text-center w-full"
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: '32px',
              maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            {/* success-icon-container */}
            <div className="flex justify-center mb-5">
              <CheckCircle2 size={60} color="#10b981" />
            </div>
            {/* setup-title */}
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Setup Complete!
            </h2>
            {/* setup-subtitle */}
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.95rem' }}>
              Welcome to the NEU Library system.
            </p>
            {/* submit-btn-modern success-btn */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2.5 font-bold text-white cursor-pointer transition-all duration-300 w-full"
              style={{
                height: '56px',
                background: '#10b981',
                borderRadius: '16px',
                border: 'none',
                marginTop: '24px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.transform = '';
              }}
            >
              Continue to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Card ── */}
      {/* profile-card */}
      <main
        className="relative overflow-hidden w-full"
        style={{
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        {/* card-accent-line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            background: '#10b981',
          }}
        />

        {/* profile-header */}
        <header className="text-center mb-8">
          {/* avatar-wrapper */}
          <div
            className="flex items-center justify-center mx-auto"
            style={{
              width: '72px',
              height: '72px',
              background: '#10b981',
              borderRadius: '20px',
              marginBottom: '20px',
              boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)',
            }}
          >
            <GraduationCap color="white" size={36} />
          </div>
          {/* setup-title */}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Setup Profile
          </h1>
          {/* setup-subtitle */}
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.95rem' }}>
            Verify your identity and department.
          </p>
        </header>

        {/* setup-form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Department – input-group */}
          <div className="flex flex-col gap-2">
            {/* input-label */}
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'left' }}>
              College / Department
            </label>
            {/* select-custom */}
            <select style={selectStyle} value={college} onChange={e => setCollege(e.target.value)} required
              onFocus={e => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <option value="" disabled>-- Select your Department --</option>
              <option value="CAS">College of Arts and Sciences</option>
              <option value="ICS">Institute of Computer Studies</option>
              <option value="COE">College of Engineering</option>
              <option value="CBA">College of Business Administration</option>
              <option value="CED">College of Education</option>
            </select>
          </div>

          {/* Role – input-group */}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'left' }}>
              I am a:
            </label>
            <select
              style={selectStyle}
              value={role}
              onChange={e => {
                setRole(e.target.value);
                if (e.target.value !== 'student') setStudentNo("");
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <option value="visitor">Visitor</option>
              <option value="student">Student</option>
              <option value="staff">Staff / Faculty</option>
            </select>
          </div>

          {/* Student Number – conditional, animate-fade-in */}
          {role === "student" && (
            <div
              className="flex flex-col gap-2"
              style={{ animation: 'fadeIn 0.4s ease-out' }}
            >
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', textAlign: 'left' }}>
                Student Number
              </label>
              {/* input-with-icon */}
              <div className="relative flex items-center">
                {/* input-icon */}
                <Hash size={18} style={{ position: 'absolute', left: '14px', color: '#94a3b8' }} />
                {/* select-custom icon-padding */}
                <input
                  type="text"
                  placeholder="##-#####-###"
                  style={{ ...selectStyle, paddingLeft: '42px' }}
                  value={studentNo}
                  onChange={handleStudentNoChange}
                  required
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>
            </div>
          )}

          {/* submit-btn-modern */}
          <button
            type="submit"
            disabled={loading || !college}
            className="flex items-center justify-center gap-2.5 font-bold text-white cursor-pointer transition-all duration-300 w-full disabled:opacity-60"
            style={{
              height: '56px',
              background: '#1e293b',
              borderRadius: '16px',
              border: 'none',
            }}
            onMouseEnter={e => {
              if (!loading && college) {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.transform = '';
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Finish Setup"}
          </button>
        </form>
      </main>

      {/* fadeIn keyframe – injected once */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CompleteProfile;