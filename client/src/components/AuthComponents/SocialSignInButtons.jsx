// src/components/SocialSignInButtons.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import SlideButton from "../Buttons/SlideButton";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { userSocialSignOn } from "../../api/authApi";

const SocialSignInButtons = ({ setError }) => {
  const handleSocialSignIn = useCallback(
    async (provider) => {
      await userSocialSignOn(provider, setError);
    },
    [setError]
  );

  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <SlideButton
        text="Google"
        icon={<FaGoogle className="text-white" />}
        onClick={() => handleSocialSignIn("google")}
        style={{ width: "220px", maxWidth: "100%" }}
      />
      <SlideButton
        text="GitHub"
        icon={<FaGithub className="text-white" />}
        onClick={() => handleSocialSignIn("github")}
        style={{ width: "220px", maxWidth: "100%" }}
      />
    </div>
  );
};

SocialSignInButtons.propTypes = {
  onError: PropTypes.func,
};

SocialSignInButtons.defaultProps = {
  onError: () => { },
};

export default SocialSignInButtons;
