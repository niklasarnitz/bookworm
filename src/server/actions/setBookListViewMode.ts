import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setBookListViewMode(value: string) {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set("bookworm-view-mode", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/");
}
