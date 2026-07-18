"use client";

import { FilingLayout } from "@/components/filing/FilingLayout";
import {
  Button,
  Card,
  FilingActions,
  ScreenTitle,
} from "@/components/filing/ui";

export default function SupportPage() {
  return (
    <FilingLayout
      mirrorText="This log shows what you did in LastMinute ITR — uploads, payments, and checklist steps. Government portal submission status is not tracked here."
    >
      <ScreenTitle
        title="Support & audit trail"
        subtitle="Every important action in LastMinute ITR is recorded here. Government submission status is not tracked in MVP."
      />

      <Card>
        <p className="text-sm text-slate-600 leading-relaxed">
          10 Jun 9:40 · Form 16 uploaded
          <br />
          10 Jun 9:42 · 3 low-confidence fields confirmed
          <br />
          10 Jun 9:50 · Mismatch salary resolved
          <br />
          10 Jun 10:05 · Plan selected · AI Smart
          <br />
          10 Jun 10:06 · Payment completed · Filing guide unlocked
        </p>
      </Card>

      <FilingActions>
        <Button href="/chat">Chat with support</Button>
        <Button href="/file/companion" variant="secondary">
          Open companion guide (govt portal)
        </Button>
        <Button href="mailto:contact@lastminuteitr.in" variant="ghost">
          Email support
        </Button>
      </FilingActions>
    </FilingLayout>
  );
}
