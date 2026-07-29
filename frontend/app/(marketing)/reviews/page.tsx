import { ExternalLink, Quote, ShieldCheck, Star } from "lucide-react";
import { PublicReviewForm } from "@/components/marketing/PublicReviewForm";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function isLinkedIn(url?: string | null) {
  if (!url) return false;
  try {
    return new URL(url).hostname.toLowerCase().includes("linkedin.com");
  } catch {
    return false;
  }
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M5.4 3.5A2.4 2.4 0 1 1 5.4 8.3a2.4 2.4 0 0 1 0-4.8ZM3.3 9.7h4.2V21H3.3V9.7Zm6.8 0h4v1.6h.1c.6-1.1 1.9-2.2 4-2.2 4.3 0 5.1 2.8 5.1 6.5V21h-4.2v-4.8c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V21h-4.2V9.7Z" />
    </svg>
  );
}

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden bg-[#f7faf9]">
        <section className="relative border-b border-[#0e5f63]/10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,233,224,.55),transparent_42%)]" />
          <div className="relative mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0e5f63]/10 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0e5f63] shadow-sm">
              <ShieldCheck className="size-3.5" aria-hidden />
              Customer reviews
            </span>
            <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <h1 className="font-manrope max-w-3xl text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-950">
                  Real experiences from people filing with us
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                  Every review shown here comes from our review system. New submissions are
                  checked before they are published.
                </p>
              </div>
              {reviews.length > 0 && (
                <div className="flex min-w-56 items-center gap-4 rounded-2xl border border-white bg-white/90 px-5 py-4 shadow-[0_18px_44px_-28px_rgba(14,95,99,.5)]">
                  <div className="text-4xl font-extrabold tabular-nums text-[#0e5f63]">
                    {averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`size-4 ${index < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {reviews.length} published {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px]">
            {reviews.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="relative flex min-h-72 flex-col rounded-[22px] border border-slate-200/70 bg-white p-6 shadow-[0_22px_55px_-34px_rgba(14,95,99,.48)] transition duration-300 hover:-translate-y-1 hover:border-[#0e5f63]/20"
                  >
                    <Quote className="absolute right-5 top-5 size-8 fill-[#0e5f63]/5 text-[#0e5f63]/15" aria-hidden />
                    <div className="flex items-center gap-3 pr-10">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#0e5f63] text-sm font-extrabold text-white shadow-md">
                        {review.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={review.avatarUrl} alt={`${review.name}'s profile`} className="size-full object-cover" />
                        ) : (
                          initials(review.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-sm font-extrabold text-slate-900">{review.name}</h2>
                          {review.profileUrl && (
                            <a
                              href={review.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View ${review.name}'s professional profile`}
                              className="shrink-0 text-[#0e5f63]"
                            >
                              {isLinkedIn(review.profileUrl) ? <LinkedInIcon /> : <ExternalLink className="size-4" aria-hidden />}
                            </a>
                          )}
                        </div>
                        {(review.role || review.city) && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {[review.role, review.city].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`size-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-700">“{review.quote}”</blockquote>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {review.plan && <span className="rounded-full bg-[#0e5f63]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#0e5f63]">{review.plan}</span>}
                      {review.outcomeTag && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">{review.outcomeTag}</span>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#0e5f63]/25 bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-bold text-slate-900">Be the first to share your experience</h2>
                <p className="mt-2 text-sm text-slate-500">Submitted reviews appear here after moderation.</p>
              </div>
            )}
          </div>
        </section>

        <section id="share-review" className="border-t border-[#0e5f63]/10 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0e5f63]">Share your experience</span>
              <h2 className="font-manrope mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                Help another filer decide confidently
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Add your honest experience and optional professional profile. We review every submission before publishing it.
              </p>
            </div>
            <PublicReviewForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
