"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <section className="panel login">
      <h1>Log in</h1>
      <p className="muted">Sign in to access the CEH practice test.</p>

      <form action={action}>
        <div className="field">
          <label className="label" htmlFor="username">
            Username
          </label>
          <input id="username" name="username" autoComplete="username" autoCapitalize="none" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {state?.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}

        <div className="actions">
          <button className="primary full" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Log in"}
          </button>
        </div>
      </form>
    </section>
  );
}
