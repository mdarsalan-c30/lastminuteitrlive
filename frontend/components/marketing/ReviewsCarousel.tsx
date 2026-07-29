"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Linkedin, Quote, ShieldCheck, Star } from "lucide-react";

interface PublicReview {
  id: string;
  name: string;
  role?: string | null;
  city?: string | null;
  quote: string;
  rating: number;
  plan?: string | null;
  outcomeTag?: string | null;
  avatarUrl?: string | null;
  profileUrl?: string | null;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isLinkedIn(url?: string | null) {
  if (!url) return false;
  try {
    return new URL(url).hostname.toLowerCase().includes("linkedin.com");
  } catch {
    return false;
  }
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/public/reviews", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load reviews");
        return response.json() as Promise<{ reviews?: PublicReview[] }>;
      })
      .then((data) => {
        if (active && Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section
      id="reviews"
      className="section-pad-lg relative overflow-hidden bg-[#f4faf8] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-[#bfe9e0]/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-44 -left-32 size-96 rounded-full bg-white blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow-label inline-flex items-center gap-2 rounded-full border border-[#0e5f63]/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0e5f63] shadow-sm">
              <ShieldCheck className="size-3.5" aria-hidden />
              Customer reviews
            </span>
            <h2 className="font-manrope mt-3 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-slate-900">
              What our customers say about us
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Real experiences shared by people using LastminuteITR.
            </p>
          </div>
          <Link
            href="/reviews"
            className="rounded-full border border-[#0e5f63]/20 bg-white px-4 py-2 text-sm font-bold text-[#0e5f63] shadow-sm transition hover:-translate-y-0.5 hover:border-[#0e5f63]/40 hover:shadow-md"
          >
            View all reviews →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <article
              key={review.id}
              className="group relative flex h-full min-h-72 flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_55px_-32px_rgba(14,95,99,0.42)] transition duration-300 hover:-translate-y-1 hover:border-[#0e5f63]/20 hover:shadow-[0_28px_65px_-30px_rgba(14,95,99,0.5)]"
            >
              <div className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-[#0e5f63]/[0.06] text-[#0e5f63]/25">
                <Quote className="size-5 fill-current" aria-hidden />
              </div>

              <div className="flex items-center gap-3 pr-12">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#0e5f63] text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(14,95,99,0.24)]">
                  {review.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.avatarUrl}
                      alt={`${review.name}'s profile`}
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(review.name)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-extrabold text-slate-900">{review.name}</p>
                    {review.profileUrl && (
                      <a
                        href={review.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${review.name}'s professional profile`}
                        className="shrink-0 text-[#0e5f63] transition hover:scale-110"
                      >
                        {isLinkedIn(review.profileUrl) ? (
                          <Linkedin className="size-4 fill-current" aria-hidden />
                        ) : (
                          <ExternalLink className="size-4" aria-hidden />
                        )}
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

              <div
                className="mt-5 flex gap-1"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-200"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-[14px] leading-7 text-slate-700">
                “{review.quote}”
              </blockquote>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {review.plan && (
                  <span className="rounded-full bg-[#0e5f63]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0e5f63]">
                    {review.plan}
                  </span>
                )}
                {review.outcomeTag && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    {review.outcomeTag}
                  </span>
                )}
                {!review.plan && !review.outcomeTag && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <ShieldCheck className="size-3.5 text-[#0e5f63]" aria-hidden />
                    Published customer review
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
