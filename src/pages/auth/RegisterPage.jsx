import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, User, Mail, Lock, Loader2 } from "lucide-react";
import authService from "../../services/authService";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Default role to USER if not specified, or handle role selection if needed
      const payload = {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        company_name: data.companyName,
      };
      await authService.register(payload);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      // Handle field-specific errors
      if (error.password) {
        setError("password", {
          type: "server",
          message: error.password[0],
        });
      }
      if (error.email) {
        setError("email", {
          type: "server",
          message: error.email[0],
        });
      }
      if (error.company_name) {
        setError("companyName", {
          type: "server",
          message: error.company_name[0],
        });
      }
      if (error.full_name) {
        setError("fullName", {
          type: "server",
          message: error.full_name[0],
        });
      }

      // Show generic error if no specific field error or as a fallback
      const errorMessage =
        error.detail ||
        (error.password
          ? "Please check the form for errors."
          : "Registration failed. Please try again.");
      toast.error(errorMessage);

      if (
        !error.password &&
        !error.email &&
        !error.company_name &&
        !error.full_name
      ) {
        setError("root", {
          type: "manual",
          message: errorMessage,
        });
      }
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Wrench className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Register Company
          </h2>
          <p className="text-slate-400 text-center mb-8">
            Create your company account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  {...register("companyName", {
                    required: "Company Name is required",
                  })}
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  {...register("fullName", {
                    required: "Full Name is required",
                  })}
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="user@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type="password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm text-center">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-400 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
