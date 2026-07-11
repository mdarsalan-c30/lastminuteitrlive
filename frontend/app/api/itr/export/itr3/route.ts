import { NextRequest, NextResponse } from "next/server";
import { buildItr3Export } from "@/lib/itr/itdJsonExport";
import { hasServerCompanionAccess } from "@/lib/payments/access";
import { getPaymentSessionFromRequest } from "@/lib/payments/sessionRequest";
import type { ITRResult, UserInput } from "@/lib/engine/types";

interface ExportRequestBody {
  userInput?: UserInput;
  result?: ITRResult;
}

export async function POST(request: NextRequest) {
  const session = getPaymentSessionFromRequest(request);
  if (!hasServerCompanionAccess(session)) {
    return NextResponse.json(
      { error: "Payment required to export ITR JSON" },
      { status: 402 }
    );
  }

  const body = (await request.json()) as ExportRequestBody;
  if (!body.userInput || !body.result) {
    return NextResponse.json(
      { error: "userInput and result are required" },
      { status: 400 }
    );
  }

  const payload = buildItr3Export({
    userInput: body.userInput,
    result: body.result,
  });

  if (payload.validation.blocking.length > 0) {
    return NextResponse.json(
      {
        error: "Resolve blocking validations before export",
        validation: payload.validation,
      },
      { status: 422 }
    );
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="lastminute-itr-itr3-ay2026-27.json"',
      "X-ITR-Schema-Version": payload.schemaVersion,
    },
  });
}
