export const runtime = "nodejs";
export const maxDuration = 30;
export const preferredRegion = "iad1";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";
const STORAGE_BUCKET = "bigtex-part-uploads";

type IntakeMode = "photo" | "ask" | string;

type Classification = {
  guidance: string;
  likely_category: string;
  urgency: "low" | "normal" | "high" | "unknown";
  suggested_next_step: string;
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

function fallbackGuidance(question: string): Classification {
  const text = question.toLowerCase();
  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return {
      guidance:
        "This sounds pump-related. A photo of the pump label, capacitor area, basket lid, or failed part will help Big Tex narrow the replacement path quickly.",
      likely_category: "pump_or_motor",
      urgency: "high",
      suggested_next_step: "Upload a photo and include whether pickup or delivery is needed.",
      sales_signal: "unknown",
    };
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return {
      guidance:
        "Low pressure or weak circulation can involve the filter, valve, basket, pump, or cleaner-side components. A photo of the equipment pad and the visible part is the fastest next step.",
      likely_category: "flow_or_pressure",
      urgency: "normal",
      suggested_next_step: "Upload the equipment pad and the part in question.",
      sales_signal: "unknown",
    };
  }

  if (text.includes("commercial") || text.includes("route") || text.includes("property") || text.includes("hoa")) {
    return {
      guidance:
        "For route or property support, include the item needed, timing pressure, and whether pickup or delivery is preferred. Big Tex can turn that into a fulfillment path.",
      likely_category: "commercial_supply",
      urgency: "high",
      suggested_next_step: "Submit the request with contact details for fast follow-up.",
      sales_signal: "commercial_property",
    };
  }

  return {
    guidance:
      "Good intake start. Add a photo if you have one, then include your contact info so Big Tex can identify the right product, part, or delivery path.",
    likely_category: "general_part_request",
    urgency: "unknown",
    suggested_next_step: "Upload a photo and submit the request.",
    sales_signal: "unknown",
  };
}

async function classifyWithGateway(input: { question: string; description?: string; mode?: IntakeMode }) {
  const apiKey = getEnv("AI_GATEWAY_API_KEY");
  const model = getEnv("BIGTEX_LLM_MODEL") || DEFAULT_MODEL;
  const base = fallbackGuidance(`${input.question || ""} ${input.description || ""}`);

  if (!apiKey) return base;

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
              "You are Big Tex Pool Supplies guided intake. Help Houston pool homeowners, service techs, and commercial operators identify the category of part or supply need. Do not diagnose safety issues, do not claim inventory availability, and do not overpromise. Push toward photo upload, contact capture, and Big Tex follow-up. Return only compact JSON with keys: guidance, likely_category, urgency, suggested_next_step, sales_signal.",
          },
          {
            role: "user",
            content: `Mode: ${input.mode || "ask"}\nQuestion: ${input.question || ""}\nDescription: ${input.description || ""}`,
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
              },
              required: ["guidance", "likely_category", "urgency", "suggested_next_step", "sales_signal"],
            },
          },
        },
      }),
    });

    if (!response.ok) return base;
    const payload = await response.json();
    const text = payload.output_text || payload.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(text) as Classification;
    return { ...base, ...parsed };
  } catch {
    return base;
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

    const question = String(body.question || "").trim();
    const classification = await classifyWithGateway({ question, mode: "ask" });
    return json({ guidance: classification.guidance, classification });
  }

  const formData = await request.formData();
  const name = clean(formData.get("name"));
  const replyTo = clean(formData.get("replyTo"));
  const question = clean(formData.get("question"));
  const description = clean(formData.get("description"));
  const mode = clean(formData.get("mode")) || "photo";
  const source = clean(formData.get("source")) || "website";
  const photo = formData.get("photo");

  if (!replyTo) return json({ error: "Please add a phone number or email so Big Tex can reply." }, 400);
  if (!description && !question && !(photo instanceof File && photo.size > 0)) {
    return json({ error: "Please add a photo, question, or short note." }, 400);
  }

  const supabase = getSupabase();
  const classification = await classifyWithGateway({ question, description, mode });

  const { data: lead, error: insertError } = await supabase
    .from("part_intake_leads")
    .insert({
      name: name || null,
      reply_to: replyTo,
      question: question || null,
      description: description || null,
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

  if (photo instanceof File && photo.size > 0) {
    try {
      const uploaded = await uploadPhoto(photo, lead.id);
      const { error: updateError } = await supabase
        .from("part_intake_leads")
        .update({ photo_path: uploaded.path, photo_name: uploaded.name, photo_mime_type: uploaded.mimeType, photo_size_bytes: uploaded.size })
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
    event_payload: { mode, source, classification },
  });

  return json({
    ok: true,
    leadId: lead.id,
    message: "You’re in. Big Tex will review this and help get you the right part fast.",
    guidance: classification.guidance,
  });
}
