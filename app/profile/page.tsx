"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import {
  FieldGroup,
  FormSection,
  OnboardingProgress,
  WhyWeNeedThis,
} from "@/components/filing/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRICING_PLANS } from "@/lib/constants";
import { useProfileStore } from "@/lib/store/profile";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useProfileStore();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [panLast4, setPanLast4] = useState(profile.panLast4);
  const [filingPlan, setFilingPlan] = useState(profile.filingPlan);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    profile.setProfile({
      name: name.trim(),
      email: email.trim(),
      panLast4: panLast4.replace(/\D/g, "").slice(-4),
      filingPlan,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleClear() {
    profile.clearProfile();
    setName("");
    setEmail("");
    setPanLast4("");
    setFilingPlan("");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg min-w-0 px-4 py-10 sm:px-6 sm:py-12">
        <OnboardingProgress current={1} total={1} label="Your profile" />

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your profile</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Saved locally on this device. Optional — you can file without filling this in.
        </p>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <FormSection
            step={1}
            totalSteps={1}
            title="Your details"
            description="Helps us greet you and pre-select a filing plan."
            requirement="optional"
          >
            <WhyWeNeedThis>
              <p>
                Name and email are only stored in your browser — we do not upload
                personal data to our servers in this MVP.
              </p>
              <p>
                PAN last 4 digits help us label your draft if you share this device
                with someone else.
              </p>
            </WhyWeNeedThis>

            <FieldGroup label="Name" requirement="optional">
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </FieldGroup>

            <FieldGroup label="Email" requirement="optional">
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </FieldGroup>

            <FieldGroup
              label="PAN last 4 digits"
              requirement="optional"
              helper="Optional — for your reference only on this device."
            >
              <Input
                id="profile-pan"
                value={panLast4}
                onChange={(e) =>
                  setPanLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
              />
            </FieldGroup>

            <FieldGroup label="Filing plan" requirement="optional">
              <select
                id="profile-plan"
                value={filingPlan}
                onChange={(e) =>
                  setFilingPlan(e.target.value as typeof filingPlan)
                }
                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Not selected</option>
                {PRICING_PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.priceLabel}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </FormSection>

          <div className="space-y-3 border-t border-slate-200/80 pt-6">
            <Button type="submit" className="min-h-11 w-full sm:w-auto sm:min-w-[220px]">
              Save profile
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full text-muted-foreground sm:w-auto"
                onClick={() => router.push("/file/import/documents?source=form16")}
              >
                Skip for now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="min-h-11 w-full sm:w-auto"
              >
                Clear
              </Button>
            </div>
            {saved && (
              <p className="text-sm text-green-600">Profile saved on this device.</p>
            )}
          </div>
        </form>

        <div className="mt-6">
          <Link
            href="/file/onboarding/eligibility?step=about-you"
            className="text-sm font-medium text-primary hover:underline"
          >
            Start or continue filing →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
