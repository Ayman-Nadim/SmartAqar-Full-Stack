import React, { useState } from "react";
import axios from "axios";
import Logo from "../assets/smartaqar-logo.png";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    c_password: "",
    country_code: "MA",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific field error when user starts typing
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if (errors.general) setErrors({ ...errors, general: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});

    // Client-side password match validation
    if (formData.password !== formData.c_password) {
      setErrors({ c_password: ["Passwords do not match."] });
      setLoading(false);
      return;
    }

    // Client-side phone validation (must start with +)
    if (!formData.phone.startsWith('+')) {
      setErrors({ phone: ["Phone number must include country code (e.g., +212600123456)"] });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/register",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setErrors({});
        
        // Store token in localStorage for future use
        if (response.data.data.token) {
          localStorage.setItem('smartaquar_token', response.data.data.token);
          localStorage.setItem('smartaquar_user', JSON.stringify({
            id: response.data.data.id,
            name: response.data.data.name,
            email: response.data.data.email,
            credit: response.data.data.credit
          }));
        }

        // Optional: Redirect after successful registration
        // setTimeout(() => {
        //   window.location.href = '/dashboard';
        // }, 2000);
      } else {
        setErrors({ general: ["Registration failed."] });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      const responseData = err.response?.data || {};
      const apiErrors = responseData.errors || {};
      const apiMessage = responseData.message;
      const apiDetails = responseData.details || {};

      // Handle 1Confirmed API errors specifically
      if (responseData.error === "1Confirmed API error" && apiDetails) {
        // Handle 1Confirmed validation errors format: { "phone": ["The phone has already been taken."] }
        if (Object.keys(apiDetails).length > 0) {
          setErrors(apiDetails);
        } else {
          setErrors({ general: [apiMessage || "Registration failed with external service"] });
        }
        return;
      }

      // Handle validation errors from express-validator
      if (Array.isArray(apiErrors)) {
        const errorObj = {};
        apiErrors.forEach(error => {
          // Express-validator format: { path: 'fieldName', msg: 'error message' }
          const fieldName = error.path || error.param;
          const errorMessage = error.msg || error.message;
          if (fieldName) {
            errorObj[fieldName] = [errorMessage];
          }
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

  const getFieldError = (fieldName) => (errors[fieldName] ? errors[fieldName][0] : null);
  const hasFieldError = (fieldName) => errors[fieldName] && errors[fieldName].length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-16 w-48 h-48 bg-green-200 rounded-full opacity-30"></div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="SMARTAQAR" className="w-24 h-24 object-contain animate-bounce-slow" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#007bff] via-[#00c2ff] to-[#28a745] bg-clip-text text-transparent">
          Level Up Your Real Estate Game
          <br />
          <span className="text-base block mt-2 text-blue-400 font-semibold">
            Create Your Account
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
          {/** Name Field **/}
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder=" "
              className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                hasFieldError("name") ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
              Full Name
            </label>
            {hasFieldError("name") && <p className="text-red-500 text-sm mt-1 ml-1">{getFieldError("name")}</p>}
          </div>

          {/** Email Field **/}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
              className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                hasFieldError("email") ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
              Email Address
            </label>
            {hasFieldError("email") && <p className="text-red-500 text-sm mt-1 ml-1">{getFieldError("email")}</p>}
          </div>

          {/** Phone Field **/}
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder=" "
              className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                hasFieldError("phone") ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
              Phone Number (e.g., +212600123456)
            </label>
            {hasFieldError("phone") && <p className="text-red-500 text-sm mt-1 ml-1">{getFieldError("phone")}</p>}
          </div>

          {/** Password Fields **/}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder=" "
                className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                  hasFieldError("password") ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
                Password
              </label>
              {hasFieldError("password") && <p className="text-red-500 text-sm mt-1 ml-1">{getFieldError("password")}</p>}
            </div>

            <div className="relative flex-1">
              <input
                type="password"
                name="c_password"
                value={formData.c_password}
                onChange={handleChange}
                required
                placeholder=" "
                className={`peer w-full px-4 pt-5 pb-2 border-2 rounded-xl focus:outline-none focus:ring-0 shadow-sm transition ${
                  hasFieldError("c_password") ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <label className="absolute left-4 top-2 text-gray-400 text-sm peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all">
                Confirm Password
              </label>
              {hasFieldError("c_password") && <p className="text-red-500 text-sm mt-1 ml-1">{getFieldError("c_password")}</p>}
            </div>
          </div>

          {/** Submit button **/}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#007bff] to-[#28a745] hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}