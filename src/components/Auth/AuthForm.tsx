import { useForm, SubmitHandler } from "react-hook-form";

interface FormData {
  name?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  isLogin: boolean;
  loading: boolean;
  onSubmit: SubmitHandler<FormData>;
}

export default function AuthForm({
  isLogin,
  loading,
  onSubmit,
}: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isLogin && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register("name", { required: "Name is required" })}
            className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className="w-full px-4 py-2.5 bg-gray-50 text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-200 placeholder-gray-400"
        />
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-sm font-semibold text-white py-3 rounded-xl transition duration-200 shadow-md shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
