export const runtime = "nodejs";
export const maxDuration = 30;
export const preferredRegion = "iad1";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const STORAGE_BUCKET = "bigtex-part-uploads";

type IntakeMode = "photo" | "ask" | string;
type Urgency = "today" | "this_week" | "checking" | string;
type NeedType = "identify_part" | "check_availability" | "delivery_pickup" | "commercial_route" | string;
type Confidence = "low" | "medium" | "high" | "unknown";

type Classification = {
  guidance: string;
  likely_category: string;
  urgency: "low" | "normal" | "high" | "unknown";
  confidence: Confidence;
  suggested_next_step: string;
  handoff_message: string;
  sales_signal: "homeowner" | "service_route" | "commercial_property" | "unknown";
};

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function getSupabase() {
  const url = getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "bigtex" },
  });
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildHumanHandoff(confidence: Confidence) {
  if (confidence === "high" || confidence === "medium") {
    return "We’re pretty sure this is the right path, but Big Tex should verify the right part, chemical path, or supply option before you buy. Call Big Tex to confirm and get it moving.";
  }

  return "Send a photo and your best reply method, then Big Tex can verify the part, water issue, or supply path fast.";
}

function fallbackGuidance(input: string): Classification {
  const text = input.toLowerCase();

  if (text.includes("green") || text.includes("cloudy") || text.includes("algae") || text.includes("yellow") || text.includes("brown") || text.includes("water color") || text.includes("chemical") || text.includes("chlorine")) {
    return {
      guidance:
        "This sounds like a water-care or chemical support request. A photo of the water color plus any current test reading or product label will help Big Tex narrow the right chemical path. Upload the photo or submit the request so the team can verify before you buy.",
      likely_category: "water_chemistry",
      urgency: "normal",
      confidence: "medium",
      suggested_next_step: "Upload a photo of the water color and any test strip, bottle label, or recent readings.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "homeowner",
    };
  }

  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return {
      guidance:
        "This usually points to a pump-side part such as a capacitor, motor, lid, basket, or seal. We’re pretty sure this is the right path, but Big Tex should verify the right part, chemical path, or supply option before you buy. Upload a photo or call Big Tex to confirm.",
      likely_category: "pump_or_motor",
      urgency: "high",
      confidence: "medium",
      suggested_next_step: "Upload a photo and call Big Tex to verify the right pump part before buying.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "unknown",
    };
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return {
      guidance:
        "Low pressure or weak circulation usually points to a filter, valve, basket, pump, or cleaner-side issue. Big Tex should verify the right part, chemical path, or supply option before you buy. Upload the equipment pad and the visible part, or call Big Tex.",
      likely_category: "flow_or_pressure",
      urgency: "normal",
      confidence: "medium",
      suggested_next_step: "Upload the equipment pad and call Big Tex to verify the exact part, chemical, or supply path.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "unknown",
    };
  }

  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) {
    return {
      guidance:
        "This sounds like a cleaner-side part request, often a small replacement piece that is hard to describe by name. Big Tex should verify the exact fit before you buy. Upload a close photo with any visible brand markings or call Big Tex.",
      likely_category: "cleaner_parts",
      urgency: "normal",
      confidence: "medium",
      suggested_next_step: "Upload the broken cleaner part and call Big Tex to verify the fit.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "unknown",
    };
  }

  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) {
    return {
      guidance:
        "This sounds like a valve, fitting, seal, or gasket request. We’re pretty sure this is the right category, but Big Tex should verify the size and connection before you buy. Upload a close photo or call Big Tex.",
      likely_category: "valve_fitting_or_seal",
      urgency: "normal",
      confidence: "medium",
      suggested_next_step: "Upload a close photo and call Big Tex to verify the size and connection points.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "unknown",
    };
  }

  if (text.includes("commercial") || text.includes("route") || text.includes("property") || text.includes("hoa")) {
    return {
      guidance:
        "This sounds like a route or property support request. Big Tex can verify the part, timing, and pickup or delivery path before anything is ordered. Submit the request or call Big Tex if this affects today’s route.",
      likely_category: "commercial_supply",
      urgency: "high",
      confidence: "medium",
      suggested_next_step: "Submit the request and call Big Tex if this affects today’s route or property operation.",
      handoff_message: buildHumanHandoff("medium"),
      sales_signal: "commercial_property",
    };
  }

  return {
    guidance:
      "Good intake start. A photo will help Big Tex verify the exact product, part, or supply path before you buy. Upload a photo and submit the request, or call Big Tex if it is urgent.",
    likely_category: "general_part_request",
    urgency: "unknown",
    confidence: "low",
    suggested_next_step: "Upload a photo and submit the request so Big Tex can verify the part.",
    handoff_message: buildHumanHandoff("low"),
    sales_signal: "unknown",
  };
}

function mapUrgency(option: Urgency): Classification["urgency"] {
  if (option === "today") return "high";
  if (option === "this_week") return "normal";
  if (option === "checking") return "low";
  return "unknown";
}

function getNeedContext(needType: NeedType) {
  switch (needType) {
    case "identify_part":
      return "Need type: identify a part.";
    case "water_chemistry":
      return "Need type: water or chemical guidance.";
    case "check_availability":
      return "Need type: check availability.";
    case "delivery_pickup":
      return "Need type: delivery or pickup.";
    case "commercial_route":
      return "Need type: commercial route support.";
    default:
      return "Need type: not selected.";
  }
}

async function classifyWithGateway(input: {
  message: string;
  mode?: IntakeMode;
  urgency?: Urgency;
  needType?: NeedType;
}) {
  const apiKey = getEnv("AI_GATEWAY_API_KEY");
  const model = getEnv("BIGTEX_LLM_MODEL") || DEFAULT_MODEL;
  const context = `${input.message || ""}\n${getNeedContext(input.needType || "")}\nUrgency option: ${input.urgency || "not_selected"}`;
  const base = fallbackGuidance(context);
  const optionUrgency = mapUrgency(input.urgency || "");

  if (!apiKey) return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: `You are Big Tex Pool Supplies guided intake for Houston pool homeowners, service techs, and commercial operators.

Your job is to narrow the issue and move the customer to a verified Big Tex handoff. This can include parts, equipment, supplies, or water/chemical needs based on photos or short descriptions.

Rules:
- Do not finalize exact parts or guarantee fit.
- Do not claim inventory availability.
- Do not diagnose safety issues.
- Do not overpromise same-day availability.
- If the issue involves water color, chemicals, cloudy water, algae, or test readings, request a photo of the water and any available label/test strip.
- If confidence is medium or high, say what it likely is, then tell the customer Big Tex should verify before they buy.
- If confidence is low, require a photo and Big Tex verification.
- Guidance must be no more than 3 short sentences.
- Always end with a practical next step involving photo upload, submission, or calling Big Tex.

Return only compact JSON with keys: guidance, likely_category, urgency, confidence, suggested_next_step, handoff_message, sales_signal.`,
          },
          {
            role: "user",
            content: `Mode: ${input.mode || "ask"}\nMessage: ${input.message || ""}\n${getNeedContext(input.needType || "")}\nUrgency option: ${input.urgency || "not_selected"}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "bigtex_intake_classification",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                guidance: { type: "string" },
                likely_category: { type: "string" },
                urgency: { type: "string", enum: ["low", "normal", "high", "unknown"] },
                confidence: { type: "string", enum: ["low", "medium", "high", "unknown"] },
                suggested_next_step: { type: "string" },
                handoff_message: { type: "string" },
                sales_signal: { type: "string", enum: ["homeowner", "service_route", "commercial_property", "unknown"] },
              },
              required: ["guidance", "likely_category", "urgency", "confidence", "suggested_next_step", "handoff_message", "sales_signal"],
            },
          },
        },
      }),
    });

    if (!response.ok) return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };

    const payload = await response.json();
    const text = payload.output_text || payload.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(text) as Classification;
    const confidence = parsed.confidence || base.confidence || "unknown";

    return {
      ...base,
      ...parsed,
      confidence,
      urgency: optionUrgency === "unknown" ? parsed.urgency || base.urgency : optionUrgency,
      handoff_message: parsed.handoff_message || buildHumanHandoff(confidence),
    };
  } catch {
    return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };
  }
}

async function uploadPhoto(file: File, leadId: string) {
  const supabase = getSupabase();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExt = (ext || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const path = `${leadId}/${Date.now()}.${safeExt}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw error;
  return { path, mimeType: file.type || null, size: file.size, name: file.name };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body?.action !== "guide") return json({ error: "Unsupported action." }, 400);

    const message = String(body.message || body.question || "").trim();
    const urgency = String(body.urgency || "").trim();
    const needType = String(body.needType || "").trim();
    const classification = await classifyWithGateway({ message, mode: "ask", urgency, needType });

    return json({
      guidance: classification.guidance,
      handoffMessage: classification.handoff_message,
      confidence: classification.confidence,
      classification,
    });
  }

  const formData = await request.formData();
  const name = clean(formData.get("name"));
  const replyTo = clean(formData.get("replyTo"));
  const message = clean(formData.get("message"));
  const mode = clean(formData.get("mode")) || "photo";
  const urgencyOption = clean(formData.get("urgency"));
  const needType = clean(formData.get("needType"));
  const source = clean(formData.get("source")) || "website";
  const photo = formData.get("photo");

  if (!replyTo) return json({ error: "Please add a phone number or email so Big Tex can reply." }, 400);
  if (!message && !(photo instanceof File && photo.size > 0)) {
    return json({ error: "Please add a photo or tell Big Tex what you need help with." }, 400);
  }

  const supabase = getSupabase();
  const classification = await classifyWithGateway({ message, mode, urgency: urgencyOption, needType });

  const { data: lead, error: insertError } = await supabase
    .from("part_intake_leads")
    .insert({
      name: name || null,
      reply_to: replyTo,
      question: mode === "ask" ? message || null : null,
      description: message || null,
      mode,
      source,
      status: "new",
      likely_category: classification.likely_category,
      urgency: classification.urgency,
      sales_signal: classification.sales_signal,
      guidance: classification.guidance,
      suggested_next_step: classification.suggested_next_step,
      user_agent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    })
    .select("id")
    .single();

  if (insertError || !lead?.id) {
    return json({ error: insertError?.message || "Could not save this request." }, 500);
  }

  await supabase.from("part_intake_events").insert({
    lead_id: lead.id,
    event_type: "intake_details",
    event_payload: {
      urgency_option: urgencyOption || null,
      need_type: needType || null,
      mode,
      source,
      confidence: classification.confidence,
      handoff_message: classification.handoff_message,
    },
  });

  if (photo instanceof File && photo.size > 0) {
    try {
      const uploaded = await uploadPhoto(photo, lead.id);
      const { error: updateError } = await supabase
        .from("part_intake_leads")
        .update({
          photo_path: uploaded.path,
          photo_name: uploaded.name,
          photo_mime_type: uploaded.mimeType,
          photo_size_bytes: uploaded.size,
        })
        .eq("id", lead.id);

      if (updateError) throw updateError;
    } catch (error) {
      await supabase.from("part_intake_events").insert({
        lead_id: lead.id,
        event_type: "photo_upload_error",
        event_payload: { message: error instanceof Error ? error.message : "Unknown upload error" },
      });
    }
  }

  await supabase.from("part_intake_events").insert({
    lead_id: lead.id,
    event_type: "lead_created",
    event_payload: { mode, source, urgency_option: urgencyOption || null, need_type: needType || null, classification },
  });

  return json({
    ok: true,
    leadId: lead.id,
    message: "You’re in. Big Tex will review this and Big Tex can verify the right part, chemical path, or supply option before you buy.",
    guidance: classification.guidance,
    handoffMessage: classification.handoff_message,
    confidence: classification.confidence,
  });
}
