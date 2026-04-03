import { LoginForm } from "@/components/auth/login-form";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  return <LoginForm nextPath={q.next} urlError={q.error} />;
}
