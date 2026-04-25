export const runtime = "nodejs";
export const maxDuration = 30;
export const preferredRegion = "iad1";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const STORAGE_BUCKET = "bigtex-part-uploads";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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
  image_reviewed: boolean;
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

function defaultHandoff(confidence: Confidence, imageReviewed: boolean) {
  if (confidence === "low") {
    return imageReviewed
      ? "A clearer photo or one more detail will help Big Tex confirm the right next step."
      : "Upload a photo or add a little more detail so Big Tex can confirm the right next step.";
  }

  return imageReviewed
    ? "Submit this request or call Big Tex to confirm the exact match before you buy."
    : "Submit this request or call Big Tex to confirm the exact part or product path before you buy.";
}

function fallbackGuidance(input: string, imageReviewed = false): Classification {
  const text = input.toLowerCase();

  if (text.includes("green") || text.includes("cloudy") || text.includes("yellow") || text.includes("brown") || text.includes("algae") || text.includes("water")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this likely points to water condition or chemical guidance. A current test reading will help confirm the right product path."
        : "This likely points to water condition or chemical guidance. A clear photo of the water color plus any current chemical readings will help narrow the right product path.",
      likely_category: "water_chemicals",
      urgency: "normal",
      suggested_next_step: "Submit this request with a photo and any test strip or chemical readings if available.",
      sales_signal: "homeowner",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this likely points to a pump-side issue. The exact match may depend on the label, capacitor area, lid, basket, seal, or motor details."
        : "This likely points to a pump-side part such as a capacitor, motor, lid, basket, or seal. A photo of the pump label or failed part helps confirm the exact match fast.",
      likely_category: "pump_or_motor",
      urgency: "high",
      suggested_next_step: "Submit this request with the pump label or failed-part photo.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this likely points to a flow or pressure path. The filter, valve, basket, pump, or cleaner-side components may need confirmation."
        : "Low pressure or weak circulation often points toward the filter, valve, basket, pump, or cleaner-side components. A photo of the equipment pad and visible part is the fastest next step.",
      likely_category: "flow_or_pressure",
      urgency: "normal",
      suggested_next_step: "Submit this request with the equipment pad and visible part photo.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this likely points to a cleaner-part request. Visible brand markings or a closer angle can help confirm the exact replacement."
        : "Cleaner issues often come down to small replacement parts that are hard to describe by name. Upload a close photo and include the cleaner brand if visible.",
      likely_category: "cleaner_parts",
      urgency: "normal",
      suggested_next_step: "Submit this request with a close photo and any visible brand markings.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this likely points to a valve, fitting, seal, or gasket issue. Photos of the connection points and any visible numbers help confirm the right fit."
        : "This likely points to a valve, fitting, seal, or gasket request. Photos of the part, connection points, and any visible numbers help Big Tex confirm the right fit.",
      likely_category: "valve_fitting_or_seal",
      urgency: "normal",
      suggested_next_step: "Submit this request with close photos of the part and connection points.",
      sales_signal: "unknown",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  if (text.includes("commercial") || text.includes("route") || text.includes("property") || text.includes("hoa")) {
    return {
      guidance: "This likely points to route or property support. Timing, pickup/delivery preference, and item details will help Big Tex route it fast.",
      likely_category: "commercial_supply",
      urgency: "high",
      suggested_next_step: "Submit this request with contact details for fast follow-up.",
      sales_signal: "commercial_property",
      confidence: "medium",
      handoff_message: defaultHandoff("medium", imageReviewed),
      image_reviewed: imageReviewed,
    };
  }

  return {
    guidance: imageReviewed
      ? "Based on the photo and note, Big Tex can start narrowing the part, equipment, water, or supply path. A clearer close-up may be needed for exact matching."
      : "A photo of the part, equipment pad, label, or water color will help Big Tex identify the right product or supply path faster.",
    likely_category: "general_part_request",
    urgency: "unknown",
    suggested_next_step: "Submit this request with a photo and reply method.",
    sales_signal: "unknown",
    confidence: imageReviewed ? "medium" : "low",
    handoff_message: defaultHandoff(imageReviewed ? "medium" : "low", imageReviewed),
    image_reviewed: imageReviewed,
  };
}

async function fileToDataUrl(file: File) {
  if (!file || file.size <= 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please upload a photo under 8MB.");
  }

  const type = file.type || "image/jpeg";
  if (!type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${type};base64,${base64}`;
}

function parseGatewayText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text;

  const output = payload?.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (typeof part?.text === "string" && part.text.trim()) return part.text;
      }
    }
  }

  return "";
}

async function classifyWithGateway(input: {
  message: string;
  mode?: IntakeMode;
  urgency?: Urgency;
  needType?: NeedType;
  imageDataUrl?: string | null;
}) {
  const apiKey = getEnv("AI_GATEWAY_API_KEY");
  const model = getEnv("BIGTEX_LLM_MODEL") || DEFAULT_MODEL;
  const imageReviewed = Boolean(input.imageDataUrl);
  const context = `${input.message || ""}\n${getNeedContext(input.needType || "")}\nUrgency option: ${input.urgency || "not_selected"}`;
  const base = fallbackGuidance(context, imageReviewed);
  const optionUrgency = mapUrgency(input.urgency || "");

  if (!apiKey) {
    return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };
  }

  const content: any[] = [
    {
      type: "input_text",
      text: `Mode: ${input.mode || "ask"}\nMessage: ${input.message || ""}\n${getNeedContext(input.needType || "")}\nUrgency option: ${input.urgency || "not_selected"}`,
    },
  ];

  if (input.imageDataUrl) {
    content.push({ type: "input_image", image_url: input.imageDataUrl });
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
              "You are Big Tex Pool Supplies guided intake for Houston pool homeowners, service techs, and commercial operators. Always analyze the uploaded image first when one is provided. The image may show a pool part, equipment pad, label, valve, fitting, basket, cleaner part, seal, gasket, pump, motor, or pool water color. Your job is to narrow the likely direction and move the customer to a verified outcome. Do not finalize parts, guarantee exact matches, give repair instructions, diagnose safety issues, claim inventory availability, or overpromise same-day availability. If the image is unclear, say what clearer photo is needed. Include water color and chemical guidance when relevant. If confidence is medium or high, say what it likely points to and direct the customer to submit the request or call Big Tex to confirm before buying. If confidence is low, ask for a clearer photo or more detail. Handoff message must not name any employee. Return only compact JSON with keys: guidance, likely_category, urgency, suggested_next_step, sales_signal, confidence, handoff_message, image_reviewed. Guidance must be no more than 2 short sentences.",
          },
          {
            role: "user",
            content,
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
                image_reviewed: { type: "boolean" },
              },
              required: ["guidance", "likely_category", "urgency", "suggested_next_step", "sales_signal", "confidence", "handoff_message", "image_reviewed"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return { ...base, urgency: optionUrgency === "unknown" ? base.urgency : optionUrgency };
    }

    const payload = await response.json();
    const text = parseGatewayText(payload);
    const parsed = JSON.parse(text) as Classification;
    const confidence = parsed.confidence || base.confidence;

    return {
      ...base,
      ...parsed,
      confidence,
      image_reviewed: imageReviewed || Boolean(parsed.image_reviewed),
      handoff_message: parsed.handoff_message || defaultHandoff(confidence, imageReviewed),
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
      imageReviewed: classification.image_reviewed,
      classification,
    });
  }

  const formData = await request.formData();
  const action = clean(formData.get("action"));
  const name = clean(formData.get("name"));
  const replyTo = clean(formData.get("replyTo"));
  const message = clean(formData.get("message"));
  const mode = clean(formData.get("mode")) || "photo";
  const urgencyOption = clean(formData.get("urgency"));
  const needType = clean(formData.get("needType"));
  const source = clean(formData.get("source")) || "website";
  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  const imageDataUrl = hasPhoto ? await fileToDataUrl(photo) : null;

  if (action === "guide") {
    if (!message && !hasPhoto) {
      return json({ error: "Please add a photo or tell Big Tex what you need help with." }, 400);
    }

    const classification = await classifyWithGateway({
      message,
      mode,
      urgency: urgencyOption,
      needType,
      imageDataUrl,
    });

    return json({
      guidance: classification.guidance,
      handoffMessage: classification.handoff_message,
      imageReviewed: classification.image_reviewed,
      classification,
    });
  }

  if (!replyTo) return json({ error: "Please add a phone number or email so Big Tex can reply." }, 400);
  if (!message && !hasPhoto) return json({ error: "Please add a photo or tell Big Tex what you need help with." }, 400);

  const supabase = getSupabase();
  const classification = await classifyWithGateway({
    message,
    mode,
    urgency: urgencyOption,
    needType,
    imageDataUrl,
  });

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
      image_reviewed: classification.image_reviewed,
    },
  });

  if (hasPhoto) {
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
    event_payload: {
      mode,
      source,
      urgency_option: urgencyOption || null,
      need_type: needType || null,
      classification,
    },
  });

  return json({
    ok: true,
    leadId: lead.id,
    referenceId: `BTX-${String(lead.id).slice(0, 8).toUpperCase()}`,
    message: "Big Tex is reviewing your request and will help identify the exact part or solution.",
    guidance: classification.guidance,
    handoffMessage: "Call now for fastest confirmation, or wait for a response during business hours.",
    imageReviewed: classification.image_reviewed,
  });
}
