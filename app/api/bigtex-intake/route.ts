export const runtime = "nodejs";
export const maxDuration = 30;
export const preferredRegion = "iad1";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const STORAGE_BUCKET = "bigtex-part-uploads";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const DEFAULT_NOTIFY_EMAIL = "will@bigtexpoolsupplies.com";
const DEFAULT_FROM_EMAIL = "Big Tex Intake <onboarding@resend.dev>";

const resend = getEnv("RESEND_API_KEY") ? new Resend(getEnv("RESEND_API_KEY")) : null;

type CustomerLane = "part_help" | "commercial_express" | string;
type IntakeMode = "photo" | "ask" | string;
type Urgency = "today" | "this_week" | "checking" | string;
type NeedType = "part_equipment" | "water_chemicals" | "delivery_pickup" | "commercial_route" | "chemical_supply" | "route_emergency" | "recurring_support" | string;
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
    case "chemical_supply":
      return "Need type: commercial chemical supply.";
    case "route_emergency":
      return "Need type: commercial route emergency.";
    case "recurring_support":
      return "Need type: recurring commercial supply support.";
    default:
      return "Need type: not selected.";
  }
}

function getCustomerLaneContext(customerLane: CustomerLane, companyName?: string, poolCount?: string) {
  if (customerLane === "commercial_express") {
    return [
      "Customer lane: Commercial Express.",
      "Treat this as a high-value commercial or route-support lead focused on chemical supply, delivery, parts sourcing, emergency fulfillment, or recurring support.",
      companyName ? `Company/property: ${companyName}.` : "Company/property: not provided.",
      poolCount ? `Pools/properties: ${poolCount}.` : "Pools/properties: not provided.",
    ].join("
");
  }

  return "Customer lane: Part Help / homeowner or one-off request.";
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

  if (text.includes("commercial express") || text.includes("chemical supply") || text.includes("route emergency") || text.includes("recurring commercial")) {
    return {
      guidance: imageReviewed
        ? "Based on the photo and note, this looks like a commercial supply or route-support request. Big Tex can help coordinate chemicals, parts, pickup, delivery, or sourcing to keep the route moving."
        : "This looks like a commercial supply or route-support request. Big Tex can help coordinate chemicals, parts, pickup, delivery, or sourcing to keep the route moving.",
      likely_category: "commercial_express",
      urgency: "high",
      suggested_next_step: "Submit this Commercial Express request with contact details, timing pressure, and delivery or pickup preference.",
      sales_signal: "commercial_property",
      confidence: "medium",
      handoff_message: imageReviewed
        ? "Submit this request or call Big Tex to confirm route timing, chemical supply, delivery, or sourcing needs."
        : "Submit this request or call Big Tex to confirm route timing, chemical supply, delivery, or sourcing needs.",
      image_reviewed: imageReviewed,
    };
  }

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
  customerLane?: CustomerLane;
  companyName?: string;
  poolCount?: string;
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
              "You are Big Tex Pool Supplies guided intake for Houston pool homeowners, service techs, and commercial operators. If Customer lane is Commercial Express, prioritize commercial route support, chemical supply, delivery, emergency fulfillment, recurring account potential, and high-value sales follow-up. Always analyze the uploaded image first when one is provided. The image may show a pool part, equipment pad, label, valve, fitting, basket, cleaner part, seal, gasket, pump, motor, or pool water color. Your job is to narrow the likely direction and move the customer to a verified outcome. Do not finalize parts, guarantee exact matches, give repair instructions, diagnose safety issues, claim inventory availability, or overpromise same-day availability. If the image is unclear, say what clearer photo is needed. Include water color and chemical guidance when relevant. If confidence is medium or high, say what it likely points to and direct the customer to submit the request or call Big Tex to confirm before buying. If confidence is low, ask for a clearer photo or more detail. Handoff message must not name any employee. Return only compact JSON with keys: guidance, likely_category, urgency, suggested_next_step, sales_signal, confidence, handoff_message, image_reviewed. Guidance must be no more than 2 short sentences.",
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

    const isCommercialExpress = input.customerLane === "commercial_express";

    return {
      ...base,
      ...parsed,
      confidence,
      sales_signal: isCommercialExpress ? "commercial_property" : parsed.sales_signal || base.sales_signal,
      likely_category: isCommercialExpress && (!parsed.likely_category || parsed.likely_category === "general_part_request") ? "commercial_express" : parsed.likely_category || base.likely_category,
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

type UploadedPhoto = {
  path: string;
  mimeType: string | null;
  size: number;
  name: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelFromValue(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function urgencyLabel(value: Classification["urgency"]) {
  if (value === "high") return "Today / High Priority";
  if (value === "normal") return "Normal";
  if (value === "low") return "Low / Checking";
  return "Unknown";
}

function buildPlainTextEmail(input: {
  leadId: string;
  referenceId: string;
  name: string;
  replyTo: string;
  message: string;
  mode: string;
  customerLane: string;
  companyName: string;
  poolCount: string;
  urgencyOption: string;
  needType: string;
  classification: Classification;
  imageUrl: string | null;
}) {
  return [
    "New Big Tex Intake",
    "",
    `Reference: ${input.referenceId}`,
    `Lead ID: ${input.leadId}`,
    "",
    "Customer",
    `Name: ${input.name || "Not provided"}`,
    `Reply: ${input.replyTo}`,
    "",
    "Request",
    input.message || "No written note provided.",
    "",
    "Context",
    `Mode: ${labelFromValue(input.mode) || "Unknown"}`,
    `Customer lane: ${input.customerLane === "commercial_express" ? "Commercial Express" : "Part Help"}`,
    `Company/property: ${input.companyName || "Not provided"}`,
    `Pools/properties: ${input.poolCount || "Not provided"}`,
    `Selected urgency: ${labelFromValue(input.urgencyOption) || "Not selected"}`,
    `Need type: ${labelFromValue(input.needType) || "Not selected"}`,
    `System urgency: ${urgencyLabel(input.classification.urgency)}`,
    `Sales signal: ${labelFromValue(input.classification.sales_signal)}`,
    "",
    "AI Direction",
    `Likely category: ${labelFromValue(input.classification.likely_category)}`,
    `Confidence: ${labelFromValue(input.classification.confidence)}`,
    `Image reviewed: ${input.classification.image_reviewed ? "Yes" : "No"}`,
    `Guidance: ${input.classification.guidance}`,
    `Suggested next step: ${input.classification.suggested_next_step}`,
    "",
    "Photo",
    input.imageUrl || "No photo uploaded or signed link unavailable.",
    "",
    "Recommended action",
    "Review the photo and AI direction, then call/text the customer to confirm the exact part, product path, pickup, or delivery next step.",
  ].join("\n");
}

async function createSignedPhotoUrl(supabase: ReturnType<typeof getSupabase>, photoPath: string | null) {
  if (!photoPath) return null;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(photoPath, 60 * 60 * 24);

  if (error) return null;
  return data?.signedUrl || null;
}

async function sendLeadEmail(input: {
  leadId: string;
  name: string;
  replyTo: string;
  message: string;
  mode: string;
  customerLane: string;
  companyName: string;
  poolCount: string;
  urgencyOption: string;
  needType: string;
  classification: Classification;
  uploadedPhoto: UploadedPhoto | null;
}) {
  if (!resend) {
    return { sent: false, skipped: true, error: "Missing RESEND_API_KEY." };
  }

  const supabase = getSupabase();
  const referenceId = `BTX-${String(input.leadId).slice(0, 8).toUpperCase()}`;
  const imageUrl = await createSignedPhotoUrl(supabase, input.uploadedPhoto?.path || null);
  const from = getEnv("BIGTEX_FROM_EMAIL") || DEFAULT_FROM_EMAIL;
  const to = getEnv("BIGTEX_NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL;
  const category = labelFromValue(input.classification.likely_category) || "New Request";
  const priority = urgencyLabel(input.classification.urgency);
  const isCommercialExpress = input.customerLane === "commercial_express";
  const subject = isCommercialExpress
    ? `Commercial Express — ${category} — ${priority}`
    : `New Big Tex Intake — ${category} — ${priority}`;

  const safe = {
    referenceId: escapeHtml(referenceId),
    leadId: escapeHtml(input.leadId),
    name: escapeHtml(input.name || "Not provided"),
    replyTo: escapeHtml(input.replyTo),
    message: escapeHtml(input.message || "No written note provided."),
    mode: escapeHtml(labelFromValue(input.mode) || "Unknown"),
    customerLane: escapeHtml(input.customerLane === "commercial_express" ? "Commercial Express" : "Part Help"),
    companyName: escapeHtml(input.companyName || "Not provided"),
    poolCount: escapeHtml(input.poolCount || "Not provided"),
    urgencyOption: escapeHtml(labelFromValue(input.urgencyOption) || "Not selected"),
    needType: escapeHtml(labelFromValue(input.needType) || "Not selected"),
    systemUrgency: escapeHtml(priority),
    salesSignal: escapeHtml(labelFromValue(input.classification.sales_signal) || "Unknown"),
    category: escapeHtml(category),
    confidence: escapeHtml(labelFromValue(input.classification.confidence) || "Unknown"),
    imageReviewed: input.classification.image_reviewed ? "Yes" : "No",
    guidance: escapeHtml(input.classification.guidance),
    nextStep: escapeHtml(input.classification.suggested_next_step),
    handoff: escapeHtml(input.classification.handoff_message),
    imageName: escapeHtml(input.uploadedPhoto?.name || "No image uploaded"),
  };

  const imageSection = imageUrl
    ? `<a href="${escapeHtml(imageUrl)}" style="display:inline-block;padding:12px 16px;background:#174ea6;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;" target="_blank" rel="noreferrer">View uploaded photo</a><div style="margin-top:8px;color:#5f6b7a;font-size:13px;">${safe.imageName} · signed link valid for 24 hours</div>`
    : `<div style="color:#5f6b7a;">No photo uploaded.</div>`;

  const html = `
    <div style="margin:0;padding:0;background:#f4f8fd;font-family:Arial,Helvetica,sans-serif;color:#162033;">
      <div style="max-width:720px;margin:0 auto;padding:24px;">
        <div style="background:#0b1f4d;color:#ffffff;border-radius:22px 22px 0 0;padding:24px;">
          <div style="font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#c9defc;">Big Tex Pool Supplies</div>
          <h1 style="margin:8px 0 0;font-size:26px;line-height:1.15;">${isCommercialExpress ? "Commercial Express request" : "New intake request"}</h1>
          <p style="margin:10px 0 0;color:#e6eefc;">${safe.customerLane} · ${safe.category} · ${safe.systemUrgency}</p>
        </div>

        <div style="background:#ffffff;border:1px solid #e5ebf4;border-top:0;border-radius:0 0 22px 22px;padding:24px;box-shadow:0 18px 50px rgba(20,38,70,.09);">
          <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;background:#eef6ff;border:1px solid #d7e9ff;border-radius:999px;color:#174ea6;font-size:13px;font-weight:900;">Reference ${safe.referenceId}</div>

          <h2 style="margin:0 0 10px;color:#0b1f4d;font-size:18px;">Customer</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
            <tr><td style="padding:7px 0;color:#5f6b7a;width:150px;">Name</td><td style="padding:7px 0;font-weight:800;">${safe.name}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Reply</td><td style="padding:7px 0;font-weight:800;">${safe.replyTo}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Company/property</td><td style="padding:7px 0;font-weight:800;">${safe.companyName}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Pools/properties</td><td style="padding:7px 0;font-weight:800;">${safe.poolCount}</td></tr>
          </table>

          <h2 style="margin:0 0 10px;color:#0b1f4d;font-size:18px;">Customer request</h2>
          <div style="margin-bottom:22px;padding:14px 16px;background:#f7f9fc;border:1px solid #e5ebf4;border-radius:14px;line-height:1.5;">${safe.message}</div>

          <h2 style="margin:0 0 10px;color:#0b1f4d;font-size:18px;">System read</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
            <tr><td style="padding:7px 0;color:#5f6b7a;width:150px;">Lane</td><td style="padding:7px 0;font-weight:800;">${safe.customerLane}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;width:150px;">Need type</td><td style="padding:7px 0;font-weight:800;">${safe.needType}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Selected urgency</td><td style="padding:7px 0;font-weight:800;">${safe.urgencyOption}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Likely category</td><td style="padding:7px 0;font-weight:800;">${safe.category}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Confidence</td><td style="padding:7px 0;font-weight:800;">${safe.confidence}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Image reviewed</td><td style="padding:7px 0;font-weight:800;">${safe.imageReviewed}</td></tr>
            <tr><td style="padding:7px 0;color:#5f6b7a;">Sales signal</td><td style="padding:7px 0;font-weight:800;">${safe.salesSignal}</td></tr>
          </table>

          <h2 style="margin:0 0 10px;color:#0b1f4d;font-size:18px;">Guidance</h2>
          <div style="margin-bottom:14px;padding:14px 16px;background:#fff7f8;border:1px solid #f4c7cc;border-radius:14px;line-height:1.5;">${safe.guidance}</div>
          <div style="margin-bottom:22px;padding:14px 16px;background:#eef6ff;border:1px solid #d7e9ff;border-radius:14px;line-height:1.5;"><strong>Next step:</strong> ${safe.nextStep}<br/><strong>Customer handoff:</strong> ${safe.handoff}</div>

          <h2 style="margin:0 0 10px;color:#0b1f4d;font-size:18px;">Uploaded photo</h2>
          <div style="margin-bottom:22px;">${imageSection}</div>

          <div style="padding:16px;background:#0b1f4d;color:#ffffff;border-radius:16px;line-height:1.5;">
            <strong>Recommended action:</strong><br/>
            ${isCommercialExpress ? "Prioritize this lead: confirm route timing, chemical need, delivery/pickup path, and recurring support potential." : "Review the image and system read, then call or text the customer to confirm the exact part, chemical path, pickup, or delivery next step."}
          </div>
        </div>
      </div>
    </div>
  `;

  const text = buildPlainTextEmail({
    leadId: input.leadId,
    referenceId,
    name: input.name,
    replyTo: input.replyTo,
    message: input.message,
    mode: input.mode,
    customerLane: input.customerLane,
    companyName: input.companyName,
    poolCount: input.poolCount,
    urgencyOption: input.urgencyOption,
    needType: input.needType,
    classification: input.classification,
    imageUrl,
  });

  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) return { sent: false, skipped: false, error: error.message || "Resend email error." };
  return { sent: true, skipped: false, error: null };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body?.action !== "guide") return json({ error: "Unsupported action." }, 400);

    const message = String(body.message || body.question || "").trim();
    const urgency = String(body.urgency || "").trim();
    const needType = String(body.needType || "").trim();
    const customerLane = String(body.customerLane || "part_help").trim();
    const companyName = String(body.companyName || "").trim();
    const poolCount = String(body.poolCount || "").trim();
    const classification = await classifyWithGateway({ message, mode: "ask", urgency, needType, customerLane, companyName, poolCount });

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
  const customerLane = clean(formData.get("customerLane")) || "part_help";
  const companyName = clean(formData.get("companyName"));
  const poolCount = clean(formData.get("poolCount"));
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
      customerLane,
      companyName,
      poolCount,
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
    customerLane,
    companyName,
    poolCount,
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
      customer_lane: customerLane,
      company_name: companyName || null,
      pool_count: poolCount || null,
      mode,
      source,
      confidence: classification.confidence,
      handoff_message: classification.handoff_message,
      image_reviewed: classification.image_reviewed,
    },
  });

  let uploadedPhoto: UploadedPhoto | null = null;

  if (hasPhoto) {
    try {
      const uploaded = await uploadPhoto(photo, lead.id);
      uploadedPhoto = uploaded;
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
      customer_lane: customerLane,
      company_name: companyName || null,
      pool_count: poolCount || null,
      classification,
    },
  });

  const emailResult = await sendLeadEmail({
    leadId: lead.id,
    name,
    replyTo,
    message,
    mode,
    customerLane,
    companyName,
    poolCount,
    urgencyOption,
    needType,
    classification,
    uploadedPhoto,
  });

  await supabase.from("part_intake_events").insert({
    lead_id: lead.id,
    event_type: emailResult.sent ? "notification_email_sent" : emailResult.skipped ? "notification_email_skipped" : "notification_email_error",
    event_payload: {
      sent: emailResult.sent,
      skipped: emailResult.skipped,
      error: emailResult.error,
      notify_email: getEnv("BIGTEX_NOTIFY_EMAIL") || DEFAULT_NOTIFY_EMAIL,
    },
  });

  return json({
    ok: true,
    leadId: lead.id,
    referenceId: `BTX-${String(lead.id).slice(0, 8).toUpperCase()}`,
    message: customerLane === "commercial_express"
      ? "Big Tex is reviewing your Commercial Express request and will help route the right supply, delivery, chemical, or sourcing path."
      : "Big Tex is reviewing your request and will help identify the exact part or solution.",
    guidance: classification.guidance,
    handoffMessage: "Call now for fastest confirmation, or wait for a response during business hours.",
    imageReviewed: classification.image_reviewed,
  });
}
