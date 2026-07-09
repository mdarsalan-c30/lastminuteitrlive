"use server";

import { PrismaClient } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/rbac";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function deleteBlog(id: string) {
  try {
    console.log("DeleteBlog Server Action called with id:", id);
    const session = await getAdminSession();
    console.log("Session:", session);
    
    if (!session) {
      console.log("No session found");
      throw new Error("Unauthorized");
    }
    
    const allowedRoles = ["ceo", "admin", "content_writer", "intern", "content"];
    if (!allowedRoles.includes(session.role)) {
      console.log("Role not allowed:", session.role);
      throw new Error("Access Denied");
    }

    console.log("Attempting prisma delete...");
    await prisma.blog.delete({
      where: { id },
    });
    console.log("Delete successful in DB");

    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteBlog action:", err);
    throw err;
  }
}
