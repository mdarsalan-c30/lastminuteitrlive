"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface PublicReview {
  id: string;
  name: string;
  role?: string | null;
  city?: string | null;
  quote: string;
  rating: number;
  plan?: string | null;
  outcomeTag?: string | null;
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
    <section id="reviews" className="section-pad-lg px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow-label rounded-full bg-[#0e5f63]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0e5f63]">
              Customer reviews
            </span>
            <h2 className="font-manrope mt-3 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-slate-900">
              What our customers say
            </h2>
          </div>
          <Link href="/reviews" className="text-sm font-bold text-[#0e5f63] hover:underline">
            View all reviews →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <article
              key={review.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.45)]"
            >
              <div className="mb-4 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
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
              <blockquote className="flex-1 text-[14px] leading-7 text-slate-700">
                “{review.quote}”
              </blockquote>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-900">{review.name}</p>
                {(review.role || review.city) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {[review.role, review.city].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
