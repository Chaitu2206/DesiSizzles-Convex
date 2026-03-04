"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const resetAdminPassword = useAction(api.admin.resetAdminPassword);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("email", email);
          formData.set("password", password);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            const rawMessage =
              error instanceof Error ? error.message : "Unknown authentication error";
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(`${toastTitle} (${rawMessage})`);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="mt-4 rounded-lg border border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-secondary mb-2">
          Admin password recovery (requires reset token)
        </p>
        <input
          className="auth-input-field"
          type="password"
          placeholder="Reset token"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
        />
        <button
          className="auth-button mt-2"
          type="button"
          disabled={submitting || !email || !password || !resetToken}
          onClick={() => {
            setSubmitting(true);
            void resetAdminPassword({
              email,
              newPassword: password,
              resetToken,
            })
              .then((result) => {
                const verb = result.status === "created" ? "created" : "updated";
                toast.success(`Admin credentials ${verb}. Sign in now.`);
              })
              .catch((error) => {
                const rawMessage =
                  error instanceof Error ? error.message : "Password reset failed";
                toast.error(rawMessage);
              })
              .finally(() => setSubmitting(false));
          }}
        >
          Reset Admin Password
        </button>
      </div>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <button className="auth-button" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </button>
    </div>
  );
}
