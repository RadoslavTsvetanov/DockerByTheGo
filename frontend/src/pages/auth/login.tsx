import { BetterForm } from "~/components/customComponentsNotFromShadcn/betterForm";
import { type pageProps } from "../_app";
import { PopUpFormWrapper } from "~/components/customComponentsNotFromShadcn/hideableCompoent";
import { useState } from "react";
import { cx } from "class-variance-authority";
import { redirectTo } from "~/utils/redirector";

const Login: React.FC<pageProps> = ({ ctx }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Login
        </h1>
        <PopUpFormWrapper isHidden={false} onSubmit={() => {}}>
          <div className="space-y-4">
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
          </div>
          <button
            type="submit"
            onClick={async () => {
              const res = await ctx.api.login(form.username, form.password);
              if (res.status < 300) {
                ctx.cookies.auth.set(res.data.token);
                  ctx.cookies.username.set(form.username)
                  redirectTo("/");
              }
            }}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </PopUpFormWrapper>
      </div>
    </div>
  );
};

export default Login;
