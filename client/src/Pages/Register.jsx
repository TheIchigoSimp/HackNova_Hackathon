import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TrueFocus from "../components/Animation/TrueFocus";
import PageLayout from "./PageLayout";
import SocialSignInButtons from "../components/AuthComponents/SocialSignInButtons";
import AuthForm from "../components/AuthComponents/AuthForm";
import SlideButton from "../components/Buttons/SlideButton";
import { GrLogin } from "react-icons/gr";

const Register = () => {
  const navigate = useNavigate();
  const [socialError, setSocialError] = useState("");

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto">
        {/* Page Heading */}
        <h2 className="text-3xl font-bold text-white mb-10 text-center">
          <TrueFocus
            sentence="Register Here"
            blurAmount={6}
            borderColor="#667eea"
            glowColor="rgba(102, 126, 234, 0.6)"
            animationDuration={0.5}
          />
        </h2>

        {/* Social Sign-In Buttons */}
        <SocialSignInButtons onError={setSocialError} />
        {socialError && (
          <div className="text-red-400 text-sm text-center mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            {socialError}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
          <span className="px-4 text-[#94a3b8] text-sm">or register with email</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
        </div>

        {/* Email/Password Registration Form */}
        <div className="flex justify-center mb-8">
          <div className="w-full">
            <AuthForm />
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center text-sm text-[#94a3b8]">
          Already have an account?
          <div className="mt-4 flex justify-center">
            <div className="w-48">
              <SlideButton
                text="Login"
                icon={<GrLogin />}
                onClick={() => navigate("/login")}
                fullWidth={true}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
