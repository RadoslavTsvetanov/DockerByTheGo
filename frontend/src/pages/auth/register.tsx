import { BetterForm } from "~/components/customComponentsNotFromShadcn/betterForm";
import { type pageProps } from "../_app";
import { PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent";
import { useState } from "react";
import { cx } from "class-variance-authority";
import { redirectTo } from "~/utils/redirector";

const Signup: React.FC<pageProps> = ({ ctx }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    // Check if password and confirmPassword match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await ctx.api.signup(form.username, form.password);
      if (res.status < 300) {
        // Optionally set token if backend provides it, then redirect
        redirectTo("/auth/login");
      }
    } catch (err) {
      setError("Error signing up. Please try again.")
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Signup
        </h1>
        <PopUpFormWrapper isHidden={false} onSubmit={() => {console.log("ho")}}>
          <div className="space-y-4">
            {error && <p className="text-center text-red-500">{error}</p>}
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSignup}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Signup
          </button>
        </PopUpFormWrapper>
      </div>
    </div>
  );
};

export default Signup;
