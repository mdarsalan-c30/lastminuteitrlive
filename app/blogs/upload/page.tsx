"use client";

import { useState } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BlogUploadPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setAuthenticated(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !body.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-blog-admin-token": token.trim(),
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim(),
          body: body.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setStatus("success");
      setTitle("");
      setSlug("");
      setExcerpt("");
      setBody("");
      setTags("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">Blog upload</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin-only. Set <code className="text-xs">BLOG_ADMIN_TOKEN</code> in your environment.
        </p>

        {!authenticated ? (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Enter admin token</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <Input
                  type="password"
                  placeholder="BLOG_ADMIN_TOKEN"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="off"
                />
                <Button type="submit">Continue</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>New blog post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <Input
                  placeholder="Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Slug (optional — auto-generated from title)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <Input
                  placeholder="Excerpt *"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  required
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="Body (markdown) *"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Publishing…" : "Publish blog"}
                </Button>
                {status === "success" && (
                  <p className="text-sm text-green-600">Blog published successfully.</p>
                )}
                {status === "error" && (
                  <p className="text-sm text-destructive">{errorMsg}</p>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
