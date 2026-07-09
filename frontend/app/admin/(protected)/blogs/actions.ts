"use server";

import { PrismaClient } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/rbac";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function deleteBlog(id: string) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  
  const allowedRoles = ["ceo", "admin", "content_writer", "intern", "content"];
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Access Denied");
  }

  await prisma.blog.delete({
    where: { id },
  });

  revalidatePath("/admin/blogs");
  return { success: true };
}
