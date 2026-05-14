import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: (session.user as { id: string }).id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as { role: string }).role,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
