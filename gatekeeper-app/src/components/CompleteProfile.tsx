import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { GraduationCap, Loader2, CheckCircle2, ArrowRight, Hash } from "lucide-react";
import '../styles/base.css';
import '../styles/profile-setup.css';

const CompleteProfile = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();
  
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("visitor"); 
  const [studentNo, setStudentNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  // Handle student number format: ##-#####-###
  const handleStudentNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limit to 12 characters (10 digits + 2 dashes)
    if (value.length <= 12) {
      setStudentNo(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !college) return;
    
    // Validation for Students
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
          updated_at: new Date().toISOString() 
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

  return (
    <div className="profile-setup-container">
      {showSuccess && (
        <div className="modal-overlay-blur">
          <div className="success-card-modern">
            <div className="success-icon-container">
              <CheckCircle2 size={60} color="#10b981" />
            </div>
            <h2 className="setup-title">Setup Complete!</h2>
            <p className="setup-subtitle">Welcome to the NEU Library system.</p>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="submit-btn-modern success-btn"
            >
              Continue to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="profile-card">
        <div className="card-accent-line" />
        
        <header className="profile-header">
          <div className="avatar-wrapper">
            <GraduationCap color="white" size={36} />
          </div>
          <h1 className="setup-title">Setup Profile</h1>
          <p className="setup-subtitle">Verify your identity and department.</p>
        </header>

        <form onSubmit={handleSubmit} className="setup-form">
          {/* Department Selection */}
          <div className="input-group">
            <label className="input-label">College / Department</label>
            <select 
              className="select-custom" 
              value={college} 
              onChange={(e) => setCollege(e.target.value)} 
              required
            >
              <option value="" disabled>-- Select your Department --</option>
              <option value="CAS">College of Arts and Sciences</option>
              <option value="ICS">Institute of Computer Studies</option>
              <option value="COE">College of Engineering</option>
              <option value="CBA">College of Business Administration</option>
              <option value="CED">College of Education</option>
            </select>
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label className="input-label">I am a:</label>
            <select 
              className="select-custom" 
              value={role} 
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== 'student') setStudentNo("");
              }}
            >
              <option value="visitor">Visitor</option>
              <option value="student">Student</option>
              <option value="staff">Staff / Faculty</option>
            </select>
          </div>

          {/* Conditional Student Number Input */}
          {role === "student" && (
            <div className="input-group animate-fade-in">
              <label className="input-label">Student Number</label>
              <div className="input-with-icon">
                <Hash size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="##-#####-###"
                  className="select-custom icon-padding"
                  value={studentNo}
                  onChange={handleStudentNoChange}
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn-modern" 
            disabled={loading || !college}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Finish Setup"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CompleteProfile;