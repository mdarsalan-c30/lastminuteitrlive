import {
  countProgress,
  mergePortalFootprint,
  mergePortalSteps,
} from "@/lib/engine/mergeValues";
import {
  getPortalFootprintForForm,
  getPortalStepsForForm,
} from "@/lib/engine/portalStepsData.server";
import { trackEngineEvent } from "@/lib/monitoring/events";
import {
  applyPersonalizationToGuide,
  buildPersonalizationOverlay,
} from "@/lib/engine/portalGuideEngine";
import type { PortalDraftSlice } from "@/lib/filing/portalSop";
import type {
  ITRResult,
  PortalForm,
  PortalFootprintScreen,
  PortalStep,
  UserInput,
} from "@/lib/engine/types";
import { hasServerCompanionAccess } from "@/lib/payments/access";
import { getPaymentSessionFromRequest } from "@/lib/payments/sessionRequest";
import { NextRequest, NextResponse } from "next/server";

const VALID_FORMS: PortalForm[] = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"];

function normalizeForm(raw: string): PortalForm | null {
  const upper = raw.toUpperCase().replace("_", "-");
  if (upper === "ITR1") return "ITR-1";
  if (upper === "ITR2") return "ITR-2";
  if (upper === "ITR3") return "ITR-3";
  if (upper === "ITR4") return "ITR-4";
  return VALID_FORMS.includes(upper as PortalForm) ? (upper as PortalForm) : null;
}

function buildResponse(
  form: PortalForm,
  steps: PortalStep[],
  body?: {
    computeResult?: ITRResult;
    userInput?: UserInput;
    completedSteps?: number[];
    mismatches?: string[];
    draft?: PortalDraftSlice;
    paymentUnlocked?: boolean;
  }
) {
  const merged = mergePortalSteps(
    steps,
    body?.computeResult,
    body?.userInput,
    body?.completedSteps ?? [],
    body?.mismatches ?? []
  );
  const screens = getPortalFootprintForForm(form);
  const mergedScreens = mergePortalFootprint(
    screens,
    body?.computeResult,
    body?.userInput
  );
  const { done, mismatches, total } = countProgress(merged);
  const base = {
    form,
    steps: merged,
    footprintScreens: mergedScreens,
    totalSteps: total,
    completedSteps: done,
    hasMismatches: mismatches > 0,
  };

  if (body?.draft) {
    const overlay = buildPersonalizationOverlay(body.draft, {
      paymentUnlocked: body.paymentUnlocked,
      computeResult: body.computeResult,
    });
    return applyPersonalizationToGuide(base, overlay);
  }

  return base;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ form: string }> }
) {
  const { form: raw } = await context.params;
  const form = normalizeForm(raw);
  if (!form) {
    return NextResponse.json({ error: "Invalid form. Use ITR-1, ITR-2, ITR-3, or ITR-4." }, { status: 400 });
  }

  const steps = getPortalStepsForForm(form);
  if (!steps) {
    trackEngineEvent("portal_guide_failure", {
      source: "server",
      form,
      error: "Form not found",
    });
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(buildResponse(form, steps));
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ form: string }> }
) {
  const session = getPaymentSessionFromRequest(request);
  if (!hasServerCompanionAccess(session ?? null)) {
    trackEngineEvent("portal_guide_failure", {
      source: "server",
      error: "Payment required",
    });
    return NextResponse.json(
      { error: "Payment required to access personalized portal guide" },
      { status: 402 }
    );
  }

  const { form: raw } = await context.params;
  const form = normalizeForm(raw);
  if (!form) {
    trackEngineEvent("portal_guide_failure", {
      source: "server",
      error: "Invalid form",
    });
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const steps = getPortalStepsForForm(form);
  if (!steps) {
    trackEngineEvent("portal_guide_failure", {
      source: "server",
      form,
      error: "Form not found",
    });
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => {
    trackEngineEvent("portal_guide_failure", {
      source: "server",
      form,
      error: "Invalid JSON body",
    });
    return {};
  });
  const computeResult = body.computeResult ?? body.result;
  return NextResponse.json(
    buildResponse(form, steps, {
      computeResult,
      userInput: body.userInput,
      completedSteps: body.completedSteps,
      mismatches: body.mismatches,
      draft: body.draft,
      paymentUnlocked: body.paymentUnlocked,
    })
  );
}
