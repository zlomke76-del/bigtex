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
type NeedType = "part_equipment" | "water_chemicals" | "delivery_pickup" | "commercial_route" | string;
type Confidence = "high" | "medium" | "low" | "unknown";

type Classification = {
  guidance: string;
  likely_category: string;
  urgency: "low" | "normal" | "high" | "unknown";
  suggested_next_step: string;
  sales_signal: "homeowner" | "service_route" | "commercial_property" | "unknown";
  confidence: Confidence;
  handoff_message: string;
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

function callHandoff(confidence: Confidence) {
  if (confidence === "high" || confidence === "medium") {
    return "We’re pretty sure this is the right direction. Call Big Tex to confirm the exact part before you buy.";
  }
  return "A quick photo or a little more detail will help Big Tex confirm the right next step.";
}

function fallbackGuidance(input: string): Classification {
  const text = input.toLowerCase();

  if (text.includes("green") || text.includes("cloudy") || text.includes("yellow") || text.includes("brown") || text.includes("algae") || text.includes("water")) {
    return {
      guidance:
        "This looks like a water or chemical guidance request. A clear photo of the water color plus any current chemical readings will help Big Tex point you toward the right treatment path.",
      likely_category: "water_chemicals",
      urgency: "normal",
      suggested_next_step: "Upload a photo of the water and include any test strip or chemical reading if available.",
      sales_signal: "homeowner",
      confidence: "medium",
      handoff_message: "We’re pretty sure this starts with water condition and chemical guidance. Call Big Tex to confirm the best product path before you buy.",
    };
  }

  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return {
      guidance:
        "This usually points to a pump-side part such as a capacitor, motor, lid, basket, or seal. A photo of the pump label or failed part helps confirm the exact match fast.",
      likely_category: "pump_or_motor",
      urgency: "high",
      suggested_next_step: "Upload a photo of the pump label, capacitor area, basket lid, or failed part.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: "We’re pretty sure this is pump-side. Call Big Tex to confirm the exact part before you buy.",
    };
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return {
      guidance:
        "Low pressure or weak circulation often points toward the filter, valve, basket, pump, or cleaner-side components. A photo of the equipment pad and visible part is the fastest way to narrow it down.",
      likely_category: "flow_or_pressure",
      urgency: "normal",
      suggested_next_step: "Upload the equipment pad and the part in question.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: "We’re pretty sure this is flow or pressure related. Call Big Tex to confirm the exact part or supply path before you buy.",
    };
  }

  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) {
    return {
      guidance:
        "Cleaner issues often come down to small replacement parts that are hard to describe by name. A close photo and visible brand marking can usually narrow the part quickly.",
      likely_category: "cleaner_parts",
      urgency: "normal",
      suggested_next_step: "Upload a photo of the cleaner part and any visible brand markings.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: "We’re pretty sure this is a cleaner-part request. Call Big Tex to confirm the exact replacement before you buy.",
    };
  }

  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) {
    return {
      guidance:
        "This sounds like a valve, fitting, seal, or gasket request. Photos of the part, connection points, and any visible numbers help Big Tex confirm the right fit.",
      likely_category: "valve_fitting_or_seal",
      urgency: "normal",
      suggested_next_step: "Upload a close photo of the part and connection points.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: "We’re pretty sure this is a fitting or seal path. Call Big Tex to confirm the exact match before you buy.",
    };
  }

  if (text.includes("commercial") || text.includes("route") || text.includes("property") || text.includes("hoa")) {
    return {
      guidance:
        "This looks like a route or property support request. Include the item needed, timing pressure, and whether pickup or delivery is preferred so Big Tex can route it fast.",
      likely_category: "commercial_supply",
      urgency: "high",
      suggested_next_step: "Submit the request with contact details for fast follow-up.",
      sales_signal: "commercial_property",
      confidence: "medium",
      handoff_message: "Big Tex can help verify the fastest route, pickup, or sourcing path. Call to confirm timing and availability.",
    };
  }

  return {
    guidance:
      "Good intake start. A photo of the part, equipment pad, label, or water color will help Big Tex identify the right product or supply path faster.",
    likely_category: "general_part_request",
    urgency: "unknown",
    suggested_next_step: "Upload a photo and submit the request.",
    sales_signal: "unknown",
    confidence: "low",
    handoff_message: "A quick photo or more detail will help Big Tex confirm the right part or product path.",
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
    case "part_equipment":
      return "Need type: part or equipment.";
    case "water_chemicals":
      return "Need type: water color or chemicals.";
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

  if (!apiKey) {
    return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };
  }

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
            content:
              "You are Big Tex Pool Supplies guided intake for Houston pool homeowners, service techs, and commercial operators. Your job is to narrow the issue and move the customer to a verified outcome. You do not finalize parts, guarantee exact matches, or claim inventory availability. Include water color and chemical guidance when relevant. If confidence is medium or high, say what it likely is and direct the customer to call Big Tex to confirm before buying. If confidence is low, ask for a photo or more detail. Return only compact JSON with keys: guidance, likely_category, urgency, suggested_next_step, sales_signal, confidence, handoff_message. Guidance must be no more than 2 short sentences. Handoff message must not name any employee.",
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
                suggested_next_step: { type: "string" },
                sales_signal: { type: "string", enum: ["homeowner", "service_route", "commercial_property", "unknown"] },
                confidence: { type: "string", enum: ["high", "medium", "low", "unknown"] },
                handoff_message: { type: "string" },
              },
              required: ["guidance", "likely_category", "urgency", "suggested_next_step", "sales_signal", "confidence", "handoff_message"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };
    }

    const payload = await response.json();
    const text = payload.output_text || payload.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(text) as Classification;
    const confidence = parsed.confidence || base.confidence;

    return {
      ...base,
      ...parsed,
      confidence,
      handoff_message: parsed.handoff_message || callHandoff(confidence),
      urgency: optionUrgency === "unknown" ? parsed.urgency || base.urgency : optionUrgency,
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
    message: "You’re in. Big Tex will review this and help get you the right part or product path fast.",
    guidance: classification.guidance,
    handoffMessage: classification.handoff_message,
  });
}
