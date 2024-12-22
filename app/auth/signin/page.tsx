import AuthForm from "@/components/auth/AuthForm";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm mode="signin" />
    </div>
  );
}
