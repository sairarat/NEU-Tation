import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";
import '../styles/base.css';
import '../auth.css';

const CompleteProfile = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();
  
  // State for form fields
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("visitor");
  const [loading, setLoading] = useState(false);

  // Security: Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    if (!college) {
      alert("Please select a department.");
      return;
    }

    setLoading(true);

    try {
      // Update the existing profile row created during Signup
      const { error } = await supabase
        .from("profiles")
        .update({ 
          college_office: college, 
          role: role,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;

      // Logic: Route based on the role they just selected
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      alert(error.message || "Failed to save profile. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-modern">
        <div className="brand-circle">
          {role === 'admin' ? <ShieldCheck color="white" size={32} /> : <GraduationCap color="white" size={32} />}
        </div>
        
        <h1 className="auth-title">Complete Your Profile</h1>
        <p className="auth-subtitle">Please provide your details to access the NEU Library system.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Department Selection */}
          <div className="form-group">
            <label htmlFor="college-select">College / Department</label>
            <select 
              id="college-select"
              className="input-modern" 
              value={college} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCollege(e.target.value)} 
              required
            >
              <option value="" disabled>-- Select your Department --</option>
              <option value="CAS">College of Arts and Sciences</option>
              <option value="ICS">Institute of Computer Studies</option>
              <option value="COE">College of Engineering</option>
              <option value="CBA">College of Business Administration</option>
              <option value="CED">College of Education</option>
              <option value="ADMIN">Administrative Office</option>
            </select>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role-select">Access Level</label>
            <select 
              id="role-select"
              className="input-modern" 
              value={role} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
            >
              <option value="visitor">Student / Visitor</option>
              <option value="admin">Library Administrator</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary-neu" 
            disabled={loading || !college}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving Profile...
              </>
            ) : (
              "Finish Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;