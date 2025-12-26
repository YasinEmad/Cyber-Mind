import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { setUser } from "../redux/slices/userSlice";
import axios from "@/api/axios";
import Lottie from "lottie-react";
import { Chrome, Github, ShieldCheck, Zap } from "lucide-react";
import profileAnimation from "/home/yasin/Cyber-Mind/CYFrontend/public/assets/prof.json";

type Provider = "google" | "github";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const providers = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
  };

  const signIn = async (provider: Provider) => {
    setLoading(provider);
    setError("");
    try {
      const result = await signInWithPopup(auth, providers[provider]);
      const token = await result.user.getIdToken();
      const { data } = await axios.post(`/users/auth/${provider}`, { token });
      dispatch(setUser(data.data));
      navigate("/profile");
    } catch (err: any) {
      setError(err?.code === "auth/popup-closed-by-user" ? "Access Denied: Canceled" : "Authentication Error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 flex items-center justify-center p-4 selection:bg-red-500/30">
      {/* 1. Background Layer: Grid & Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-0 border border-white/5 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">
        
        {/* Left Section: Visual Branding */}
        <div className="hidden lg:flex lg:col-span-7 flex-col items-center justify-center p-12 bg-gradient-to-br from-white/[0.02] to-transparent border-r border-white/5 relative">
          <div className="absolute top-8 left-8 flex items-center gap-2 text-xs font-mono tracking-tighter text-red-500/60">
            <Zap size={14} />
            <span>For free </span>
          </div>
          
          <div className="w-full max-w-sm transform hover:scale-105 transition-transform duration-700">
            <Lottie animationData={profileAnimation} loop={true} />
          </div>
          
          <div className="text-center mt-8">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
              Cyber-Mind 
            </h2>
            <p className="text-gray-500 mt-2 font-light max-w-xs mx-auto">
Sync your profile to access all Cyber Mind features            </p>
          </div>
        </div>

        {/* Right Section: Login Actions */}
        <div className="col-span-12 lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-black/20">
          <div className="mb-10 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Identity Check</h1>
            <p className="text-sm text-gray-400">Choose your authentication gate</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <AuthButton 
              icon={<Chrome size={18} />} 
              label="Google Core" 
              loading={loading === "google"} 
              onClick={() => signIn("google")}
              variant="outline"
            />
            
            <AuthButton 
              icon={<Github size={18} />} 
              label="GitHub Node" 
              loading={loading === "github"} 
              onClick={() => signIn("github")}
              variant="primary"
            />
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-600">
                Encrypted Session
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component for cleaner structure
const AuthButton = ({ icon, label, loading, onClick, variant }: any) => {
  const baseStyles = "w-full flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all duration-300 active:scale-[0.97] group";
  const variants = {
    outline: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 text-gray-300",
    primary: "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20 hover:shadow-red-600/20"
  };

  return (
    <button onClick={onClick} disabled={loading} className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${loading ? "opacity-50 cursor-wait" : ""}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{loading ? "Authorizing..." : label}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
        →
      </div>
    </button>
  );
};

export default LoginPage;