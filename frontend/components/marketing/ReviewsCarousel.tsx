"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TESTIMONIALS, TESTIMONIAL_DISCLOSURE } from "@/lib/content/testimonials";
import { ASSESSMENT_YEAR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Star, CheckCircle2 } from "lucide-react";

// SVG Star Rating Matching Reference Screenshot
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4 transition-all",
            i < rating
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// Avatar image or initials circle fallback
function AvatarImage({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0e5f63]/10 font-bold text-[#0e5f63] text-sm border border-[#0e5f63]/20 shadow-sm">
      {initials}
    </div>
  );
}

function ReviewCard({
  testimonial,
  active,
}: {
  testimonial: (typeof TESTIMONIALS)[number] & {
    avatar?: string;
    companyLogo?: string;
  };
  active?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-300 relative shadow-sm hover:shadow-md",
        active
          ? "border-[#0e5f63]/40 shadow-[0_14px_40px_-10px_rgba(14,95,99,0.15)] ring-1 ring-[#0e5f63]/20"
          : "border-slate-200/80 hover:border-slate-300"
      )}
    >
      {/* Header: Avatar + Name + Role */}
      <div className="flex items-center gap-3 mb-4">
        <AvatarImage name={testimonial.name} avatar={testimonial.avatar} />
        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-bold text-slate-900 truncate leading-tight">
            {testimonial.name}
          </h4>
          <p className="text-[11.5px] text-slate-500 truncate mt-0.5 font-medium">
            {testimonial.role}{testimonial.city ? `, ${testimonial.city}` : ""}
          </p>
        </div>
      </div>

      {/* Golden SVG Stars */}
      <StarRow rating={testimonial.rating} />

      {/* Quote */}
      <p className="text-[13px] text-slate-600 leading-relaxed mb-5 flex-1 min-h-[72px]">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Footer Badges & Verified Icon */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex flex-wrap gap-1.5 items-center">
          {testimonial.plan && (
            <span className="rounded-md bg-[#0e5f63]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#0e5f63]">
              {testimonial.plan}
            </span>
          )}
          {testimonial.outcomeTag && (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 border border-emerald-200/60">
              {testimonial.outcomeTag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] text-slate-400 font-medium">Verified</span>
        </div>
      </div>
    </article>
  );
}

export function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<typeof TESTIMONIALS>(TESTIMONIALS);

  useEffect(() => {
    fetch("/api/public/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error("Failed to load reviews:", err));
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(id);
  }, [reviews]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;
    const delta = card.getBoundingClientRect().left - container.getBoundingClientRect().left;
    container.scrollBy({ left: delta, behavior: "smooth" });
  }, [index]);

  return (
    <section id="trust" className="section-pad-lg px-4 sm:px-6 lg:px-8 bg-[#f8fafc]/60 py-16">
      <div className="mx-auto max-w-[1180px]">
        {/* Header row */}
        <div className="flex items-flex-end justify-between mb-9 flex-wrap gap-3.5">
          <div>
            <span className="eyebrow-label text-[#0e5f63] font-bold text-xs uppercase tracking-wider bg-[#0e5f63]/10 px-3 py-1 rounded-full">
              Reviews
            </span>
            <h2 className="font-manrope mt-3 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.02em] text-slate-900">
              What filers are saying
            </h2>
          </div>
          <p className="text-[12.5px] text-slate-400 text-right self-end max-sm:text-left font-medium">
            {TESTIMONIAL_DISCLOSURE} · {ASSESSMENT_YEAR}
          </p>
        </div>

        {/* Desktop 4-col grid (lg+), mobile scroll */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-5">
          {reviews.slice(0, 4).map((t, i) => (
            <ReviewCard key={t.id} testimonial={t as any} active={i === index} />
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((t, i) => (
            <div key={t.id} className="w-[min(100%,18rem)] shrink-0 snap-start">
              <ReviewCard testimonial={t as any} active={i === index} />
            </div>
          ))}
        </div>

        {/* Dots + read all */}
        <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
          <div className="flex gap-1.5">
            {reviews.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Show review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 min-w-[8px] rounded-full transition-all",
                  i === index ? "w-5 bg-[#0e5f63]" : "w-2 bg-slate-300"
                )}
              />
            ))}
          </div>
          <Link href="/reviews" className="text-[13px] font-bold text-[#0e5f63] hover:underline">
            Read all reviews →
          </Link>
        </div>

        <div className="mt-6 hidden justify-end lg:flex">
          <Link href="/reviews" className="text-[13px] font-bold text-[#0e5f63] hover:underline">
            Read all reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}