import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin/rbac";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { DeleteBlogButton } from "./_components/DeleteBlogButton";

const prisma = new PrismaClient();

export default async function AdminBlogsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Allow only Admin, Content Writer, Intern
  const allowedRoles = ["ceo", "admin", "content_writer", "intern", "content"];
  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You don&apos;t have permission to view or manage content.</p>
      </div>
    );
  }

  const blogs = await prisma.blog.findMany({
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Article Backlog Catalog</h1>
          <p className="text-muted-foreground">Manage existing posts, draft status, and SEO scores.</p>
        </div>
        <Link href="/admin/blogs/editor/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="p-4 grid grid-cols-12 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Slug Handle</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">SEO Score</div>
          <div className="col-span-2">Modified Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        {blogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts found. Draft a new blog!</div>
        ) : (
          <div className="divide-y">
            {blogs.map(blog => (
              <div key={blog.id} className="p-4 grid grid-cols-12 items-center text-sm transition-colors hover:bg-muted/30">
                <div className="col-span-5 font-medium truncate pr-4">{blog.title}</div>
                <div className="col-span-2 text-muted-foreground truncate pr-4">{blog.slug}</div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {blog.status}
                  </span>
                </div>
                <div className="col-span-1 font-bold">
                  <span className={`${blog.seoScore > 80 ? 'text-green-600' : blog.seoScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {blog.seoScore}
                  </span>
                </div>
                <div className="col-span-2 text-muted-foreground">{new Date(blog.updatedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div className="col-span-1 text-right flex justify-end gap-2">
                   <Link href={`/admin/blogs/editor/${blog.id}`} className="text-blue-600 hover:underline text-xs font-medium">Edit</Link>
                   <DeleteBlogButton id={blog.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
