import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "../../_components/ui";
import {
  PaymentImageEditor,
  type PaymentImageForm,
} from "./PaymentImageEditor";

export const dynamic = "force-dynamic";

const fallback: PaymentImageForm = {
  enabled: true,
  imageUrl: "/images/payment/filing-assistant.png",
  altText: "Filing assistant holding a laptop",
};

export default async function PaymentImagePage() {
  const stored = await prisma.heroRibbonConfig
    .findUnique({ where: { id: "payment-assistant" } })
    .catch(() => null);
  const initial = stored
    ? {
        enabled: stored.enabled,
        imageUrl: stored.imageUrl,
        altText: stored.altText,
      }
    : fallback;

  return (
    <div>
      <PageHeader
        title="Payment page image"
        subtitle="Upload and publish the assistant image shown beside the payment amount"
      />
      <Card>
        <PaymentImageEditor initial={initial} />
      </Card>
    </div>
  );
}
