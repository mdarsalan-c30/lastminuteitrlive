import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";

export default async function PaymentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = readB2CSession(cookieStore.get(B2C_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/auth/register?next=%2Ffile%2Fcheckout%2Fpayment");
  }

  return children;
}
