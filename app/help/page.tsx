import { HelpHubPage } from "./HelpHubPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Help — ITR filing companion",
  description:
    "Searchable help for Form 16 import, AIS reconciliation, regime choice, and filing on incometax.gov.in.",
  path: "/help",
});

export default function HelpPage() {
  return <HelpHubPage />;
}
