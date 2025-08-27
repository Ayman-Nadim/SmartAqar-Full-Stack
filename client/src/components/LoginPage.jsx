import React, { useState, useEffect } from "react";
import axios from "axios";
import Logo from "../assets/smartaqar-logo.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext(); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("smartaquar_token");
    if (token) {
      navigate("/property-catalog", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (errors.general) setErrors({ ...errors, general: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setErrors({});

        if (response.data.data.token) {
          localStorage.setItem("smartaquar_token", response.data.data.token);
          localStorage.setItem(
            "smartaquar_user",
            JSON.stringify({
              id: response.data.data.id,
              name: response.data.data.name,
              email: response.data.data.email,
              credit: response.data.data.credit,
              confirmed_user_id: response.data.data.confirmed_user_id,
              confirmed_token: response.data.data.confirmed_token,
            })
          );
        }

        // Navigate to property catalog
        setTimeout(() => {
          navigate("/property-catalog", { replace: true });
        }, 500);
      } else {
        setErrors({ general: ["Login failed."] });
      }
    } catch (err) {
      console.error("Login error:", err);
      const responseData = err.response?.data || {};
      const apiErrors = responseData.errors || {};
      const apiMessage = responseData.message;

      if (Array.isArray(apiErrors)) {
        const errorObj = {};
        apiErrors.forEach((error) => {
          const fieldName = error.path || error.param;
          const errorMessage = error.msg || error.message;
          if (fieldName) errorObj[fieldName] = [errorMessage];
        });
        setErrors(errorObj);
      } else if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else if (apiMessage) {
        setErrors({ general: [apiMessage] });
      } else {
        setErrors({ general: ["Something went wrong. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) =>
    errors[fieldName] ? errors[fieldName][0] : null;
  const hasFieldError = (fieldName) =>
    errors[fieldName] && errors[fieldName].length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-16 w-48 h-48 bg-green-200 rounded-full opacity-30"></div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={Logo}
            alt="SMARTAQAR"
            className="w-24 h-24 object-contain animate-bounce-slow"
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#007bff] via-[#00c2ff] to-[#28a745] bg-clip-text text-transparent">
          Welcome Back!
          <br />
          <span className="text-base block mt-2 text-blue-400 font-semibold">
            Sign In to Your Account
          </span>
        </h2>

        {/* Success message */}
        {message && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 shadow border border-green-200">
            {message}
          </div>
        )}

        {/* General error message */}
        {errors.general && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 shadow border border-red-200">
            {errors.general[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
              className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                hasFieldError("email")
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
              Email Address
            </label>
            {hasFieldError("email") && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
              className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                hasFieldError("password")
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
              Password
            </label>
            {hasFieldError("password") && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {getFieldError("password")}
              </p>
            )}
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#007bff] to-[#28a745] hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social login */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            {/* Google SVG */}
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
