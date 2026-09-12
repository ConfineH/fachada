import { NextResponse } from "next/server";

import { agencyService, authService, claimService } from "@/lib/container";
import { isAccountVerified } from "@/lib/domain/identity";
import { agencyTipInputSchema } from "@/lib/domain/validation";
import { storeTipEvidence } from "@/lib/ops/tip-evidence";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : undefined;
}

async function parseTipBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return {
      parsed: agencyTipInputSchema.parse(await request.json()),
      evidence: null as File | null,
    };
  }

  const form = await request.formData();
  const evidence = form.get("evidence");
  return {
    parsed: agencyTipInputSchema.parse({
      kind: field(form, "kind"),
      address: field(form, "address"),
      city: field(form, "city"),
      postalCode: field(form, "postalCode"),
      label: field(form, "label"),
      alias: field(form, "alias"),
      year: field(form, "year"),
      note: field(form, "note"),
      sourceUrl: field(form, "sourceUrl"),
    }),
    evidence: evidence instanceof File && evidence.size > 0 ? evidence : null,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    if (!isAccountVerified(user)) {
      return NextResponse.json(
        { error: "Identifícate para aportar un dato" },
        { status: 401 },
      );
    }

    const agency = await agencyService.getBySlug(slug, { publicOnly: false });
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const { parsed, evidence } = await parseTipBody(request);
    if (evidence) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          {
            error:
              "En local sin Supabase, pega un enlace a la captura en vez del archivo",
          },
          { status: 400 },
        );
      }
      parsed.evidencePath = await storeTipEvidence(
        createServiceClient(),
        agency.id,
        evidence,
        evidence.type,
      );
    }

    const canManage = await claimService.canManageAgency(user, agency.id);
    const tip = await agencyService.submitTip(user, slug, parsed, {
      publishNow: canManage,
    });
    return NextResponse.json({
      tip,
      pending: tip.status === "pendiente",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
