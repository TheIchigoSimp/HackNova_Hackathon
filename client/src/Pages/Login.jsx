// src/pages/Login.jsx
import React, { useState } from "react";
import TrueFocus from "../components/Animation/TrueFocus";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import AuthForm from "../components/AuthComponents/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";
import { FaUserPlus } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      <div className="max-w-md mx-auto">
        {/* Page Heading */}
        <h2 className="text-3xl font-bold text-white mb-10 text-center">
          <TrueFocus
            sentence="Login Here"
            blurAmount={6}
            borderColor="#667eea"
            glowColor="rgba(102, 126, 234, 0.6)"
            animationDuration={0.5}
          />
        </h2>

        {/* Social Sign-In Buttons */}
        <SocialSignInButtons setError={setSocialError} />
        {socialError && (
          <div className="text-red-400 text-sm text-center mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            {socialError}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
          <span className="px-4 text-[#94a3b8] text-sm">or continue with email</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
        </div>

        {/* Email/Password Login Form */}
        <div className="flex justify-center mb-8">
          <div className="w-full">
            <AuthForm isLogin />
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-sm text-[#94a3b8]">
          Don't have an account?
          <div className="mt-4 flex justify-center">
            <div className="w-48">
              <SlideButton
                text="Register"
                icon={<FaUserPlus />}
                onClick={() => navigate("/register")}
                fullWidth={true}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
