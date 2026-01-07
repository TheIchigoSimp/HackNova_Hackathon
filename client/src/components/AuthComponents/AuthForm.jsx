import React, { useState } from "react";
import GradientInput from "../Input/GradientInput";
import SlideButton from "../Buttons/SlideButton";
import { userLogin, userRegister } from "../../api/authApi.js";
import { FaUserPlus } from "react-icons/fa";
import { GrLogin } from "react-icons/gr";

const AuthForm = ({ isLogin = false }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    passwordMatch: "",
    general: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "password" || name === "confirmPassword"
        ? { passwordMatch: "" }
        : {}),
      general: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!isLogin && !formData.username)
      newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.passwordMatch = "Passwords do not match";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const authAction = isLogin ? userLogin : userRegister;
      await authAction(formData, setErrors);
      console.log(`${isLogin ? "Login" : "Registration"} successful`);
    } catch (error) {
      console.error(`${isLogin ? "Login" : "Registration"} error:`, error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "An unexpected error occurred.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-[rgba(25,25,40,0.6)] to-[rgba(15,15,25,0.8)] backdrop-blur-xl border border-[rgba(102,126,234,0.1)]">
      {isLogin ? (
        <>
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
            error={errors.email}
            fullWidth={true}
          />
          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            error={errors.password}
            fullWidth={true}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
            <InputField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              error={errors.email}
              fullWidth={false}
            />
            <InputField
              label="Username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              error={errors.username}
              fullWidth={false}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
            <InputField
              label="Password"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              error={errors.password}
              fullWidth={false}
            />
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              error={errors.passwordMatch}
              fullWidth={false}
            />
          </div>
        </>
      )}

      {errors.general && (
        <div className="text-red-400 text-sm text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          {errors.general}
        </div>
      )}

      <div className="pt-4 flex justify-center">
        <SlideButton
          type="button"
          text={isLogin ? "Login" : "Register"}
          icon={isLogin ? <GrLogin /> : <FaUserPlus />}
          fullWidth={true}
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{ maxWidth: "200px" }}
        />
      </div>
    </div>
  );
};

const InputField = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  fullWidth = false,
}) => (
  <div
    className={`transition-all duration-300 ${
      fullWidth ? "w-full" : "w-full sm:w-1/2"
    }`}
  >
    <label
      htmlFor={id}
      className="block text-sm font-medium text-[#e2e8f0] mb-2"
    >
      {label}
      {required && <span className="text-[#f472b6] ml-1">*</span>}
    </label>
    <GradientInput
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholders={[`${placeholder}`]}
      className="w-full"
      required={required}
      duration={10000}
    />
    {error && (
      <div className="text-red-400 text-xs mt-2 flex items-center">
        <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
        {error}
      </div>
    )}
  </div>
);

export default AuthForm;
