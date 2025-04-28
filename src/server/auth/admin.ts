import { auth } from "./index";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
}
