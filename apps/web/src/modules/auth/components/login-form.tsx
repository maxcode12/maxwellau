"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAction, type LoginState } from "@/modules/auth/actions";

const initialState: LoginState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <LogIn aria-hidden="true" />
      )}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {state.message}
        </p>
      ) : null}

      <Field label="Email" htmlFor="admin-email" required>
        {(aria) => (
          <Input
            {...aria}
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        )}
      </Field>

      <Field label="Password" htmlFor="admin-password" required>
        {(aria) => (
          <Input {...aria} name="password" type="password" autoComplete="current-password" required />
        )}
      </Field>

      <SubmitButton />
    </form>
  );
}
