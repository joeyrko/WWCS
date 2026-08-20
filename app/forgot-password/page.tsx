import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your WWC account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot Password" subtitle="Enter your email and we'll help you reset it.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
