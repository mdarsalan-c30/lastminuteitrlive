import { redirect } from "next/navigation";

/** Public blog upload is disabled — use the admin CMS. */
export default function BlogUploadPage() {
  redirect("/admin/blogs");
}
