import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage(): React.ReactElement {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
      </div>
      <AuthForm mode="signin" />
    </div>
  );
}
