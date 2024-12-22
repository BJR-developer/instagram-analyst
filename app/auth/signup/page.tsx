import AuthForm from "@/components/auth/AuthForm";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}
