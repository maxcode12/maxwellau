import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/modules/auth/components/login-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-950 px-5 py-20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src={siteConfig.brand.mark}
            alt=""
            width={72}
            height={72}
            priority
            aria-hidden="true"
          />
          <h1 className="mt-6 font-display text-2xl text-parchment">
            Maxwell AU <span className="text-gold-300">Admin</span>
          </h1>
          <p className="mt-2 text-sm text-muted-warm">Sign in to manage the ministry platform.</p>
        </div>

        <div className="mt-10 rounded-xl border border-ink-700/70 bg-ink-900/60 p-6 sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-warm/70">
          Access is restricted to authorised ministry administrators.
        </p>
      </div>
    </div>
  );
}
