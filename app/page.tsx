"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

const contact = {
  phone: "(832) 859-9678",
  phoneHref: "+18328599678",
  email: "will@bigtexpoolsupplies.com",
  addressLine1: "5829 West Sam Houston Parkway N",
  addressLine2: "Suite 1105",
  cityStateZip: "Houston, TX 77041",
};

const supplyLanes = [
  {
    label: "Homeowners",
    title: "Get what you need. Fast.",
    body: "Chemicals, filters, cleaners, and essentials to keep your pool clean, balanced, and ready without overbuying or guessing.",
    image: "/images/residential_pool_01.png",
    alt: "Residential swimming pool",
  },
  {
    label: "Service & Commercial",
    title: "Keep routes moving.",
    body: "Reliable supply for service companies, apartments, HOAs, hotels, and operators who cannot afford delays, stockouts, or wrong parts.",
    video: "/video/delivery_01.mp4",
    highlight: true,
  },
  {
    label: "Speciality Parts",
    title: "Find what others can’t.",
    body: "Valves, baskets, seals, filters, pumps, cleaner parts, and hard-to-source components identified and sourced correctly.",
    image: "/images/speciality_parts_01.png",
    alt: "Pool parts and components",
    id: "parts",
  },
];

const operatingSteps = [
  { title: "1. Identify the need", body: "Retail order, commercial supply request, delivery need, or specialty part." },
  { title: "2. Confirm availability", body: "Check stock, source options, delivery timing, and any missing information." },
  { title: "3. Coordinate fulfillment", body: "Prepare pickup, ordering, sourcing, or local delivery support." },
  { title: "4. Keep pools running", body: "Reduce delays, missed items, and wasted time across Houston pool operations." },
];

const proofPoints = ["Houston supply support", "Commercial routing help", "Hard-to-find parts", "Fast fulfillment path"];
const contactChips = ["Identify parts fast", "Water color guidance", "Same-day Houston delivery", "Commercial route support"];
const quickPrompts = ["Pump is humming but not starting", "Water is green or cloudy", "Cleaner part broke", "Need a valve or fitting"];

const urgencyOptions = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "checking", label: "Just checking" },
];

const needTypes = [
  { value: "part_equipment", label: "Part / equipment" },
  { value: "water_chemicals", label: "Water / chemicals" },
  { value: "delivery_pickup", label: "Delivery / pickup" },
  { value: "commercial_route", label: "Commercial route" },
];

type IntakeMode = "photo" | "ask";
type IntakeStatus = "idle" | "submitting" | "success" | "error";
type GuideStatus = "idle" | "loading" | "ready" | "error";

type GuideResult = {
  guidance: string;
  handoffMessage: string;
};

const starterGuidance = "A photo or short description is enough. Big Tex will narrow the likely part, chemical, or supply path before you buy.";

function getFallbackGuidedResponse(message: string) {
  const text = message.toLowerCase();
  if (!message.trim()) return starterGuidance;
  if (text.includes("green") || text.includes("cloudy") || text.includes("water")) return "This looks like a water or chemical guidance request. A photo of the water color plus any current chemical readings helps Big Tex point you toward the right treatment path.";
  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) return "This usually points to a pump-side part such as a capacitor, motor, lid, basket, or seal. A photo of the pump label or failed part helps confirm the exact match fast.";
  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) return "Low pressure or weak circulation often points toward the filter, valve, basket, pump, or cleaner-side components. A photo of the equipment pad and visible part is the fastest next step.";
  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) return "Cleaner issues often come down to small replacement parts that are hard to describe by name. Upload a close photo and include the cleaner brand if visible.";
  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) return "This sounds like a valve, fitting, seal, or gasket request. Photos of the part, connection points, and any visible numbers help Big Tex confirm the right fit.";
  return "Good intake start. A photo of the part, equipment pad, label, or water color will help Big Tex identify the right product or supply path faster.";
}

function getFallbackHandoff(message: string) {
  if (!message.trim()) return "Add a photo or short note, then Big Tex can help confirm the right next step.";
  return "We’re pretty sure this is the right direction. Call Big Tex to confirm the exact part or product path before you buy.";
}

export default function HomePage() {
  const [mode, setMode] = useState<IntakeMode>("photo");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [urgency, setUrgency] = useState("today");
  const [needType, setNeedType] = useState("part_equipment");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [guideStatus, setGuideStatus] = useState<GuideStatus>("idle");
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [resultMessage, setResultMessage] = useState("");

  const localGuidedResponse = useMemo(() => getFallbackGuidedResponse(message), [message]);
  const localHandoff = useMemo(() => getFallbackHandoff(message), [message]);
  const hasGuidance = guideStatus === "ready" || guideStatus === "error";
  const activeGuidance = guideResult?.guidance || localGuidedResponse;
  const activeHandoff = guideResult?.handoffMessage || localHandoff;
  const mailSubject = encodeURIComponent("Pool part help request");
  const mailBody = encodeURIComponent([
    "Pool part help request",
    "",
    `Name: ${name || ""}`,
    `Reply to: ${replyTo || ""}`,
    `Photo selected: ${file?.name || "No photo selected"}`,
    `Urgency: ${urgency}`,
    `Need type: ${needType}`,
    `Message: ${message || ""}`,
    "",
    "Please attach the part, equipment, or water photo before sending if it did not attach automatically from the website.",
  ].join("\n"));

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function resetResult() {
    setStatus("idle");
    setResultMessage("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setGuideStatus("idle");
    setGuideResult(null);
    resetResult();
  }

  async function handleGuideRequest() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !file) {
      setGuideResult({ guidance: starterGuidance, handoffMessage: "Add a photo or short note so Big Tex can narrow the right next step." });
      setGuideStatus("ready");
      return;
    }

    setGuideStatus("loading");
    try {
      const response = await fetch("/api/bigtex-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "guide", message: trimmedMessage, urgency, needType }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Guided intake is unavailable right now.");
      setGuideResult({ guidance: payload.guidance || localGuidedResponse, handoffMessage: payload.handoffMessage || localHandoff });
      setGuideStatus("ready");
    } catch {
      setGuideResult({ guidance: localGuidedResponse, handoffMessage: localHandoff });
      setGuideStatus("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setResultMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("replyTo", replyTo);
      formData.append("message", message);
      formData.append("mode", mode);
      formData.append("urgency", urgency);
      formData.append("needType", needType);
      formData.append("source", "bigtex-homepage");
      if (file) formData.append("photo", file);

      const response = await fetch("/api/bigtex-intake", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Unable to save this request right now.");

      setStatus("success");
      setResultMessage(payload.message || "You’re in. Big Tex will review this and help get you the right part or product path fast.");
      setGuideResult({ guidance: payload.guidance || activeGuidance, handoffMessage: payload.handoffMessage || activeHandoff });
      setGuideStatus("ready");
    } catch (error) {
      setStatus("error");
      setResultMessage(error instanceof Error ? error.message : "Unable to save this request right now.");
    }
  }

  return (
    <main>
      <header className="header">
        <nav className="nav">
          <a className="logo" href="#top" aria-label="Big Tex Pool Supplies home"><span className="logoMark">TX</span><span>Big Tex Pool Supplies</span></a>
          <div className="navLinks" aria-label="Primary navigation"><a href="#supplies">Supplies</a><a href="#commercial">Commercial</a><a href="#parts">Parts</a><a href="#contact" className="cta">Part Help</a></div>
        </nav>
      </header>

      <section id="top" className="hero">
        <video className="heroVideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/video/pool_01.mp4" type="video/mp4" /></video>
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroCopy">
            <div className="eyebrow">Houston pool supply, sourcing, and delivery support</div>
            <h1>The pool supplies Houston operators depend on.</h1>
            <p className="lede">Big Tex Pool Supplies helps homeowners, pool service companies, and commercial properties get the chemicals, equipment, replacement parts, and hard-to-find items they need—quickly, accurately, and without chasing multiple vendors.</p>
            <div className="heroActions"><a className="button buttonPrimary" href={`tel:${contact.phoneHref}`}>Call Big Tex</a><a className="button buttonSecondary" href="#contact">Upload Part Photo</a></div>
          </div>
          <aside className="heroCard" aria-label="What Big Tex handles"><h2>What we handle</h2><ul className="checks"><li>Pool chemicals, maintenance supplies, and equipment</li><li>Commercial and service-company supply support</li><li>Hard-to-find valves, filters, baskets, cleaners, and replacement parts</li><li>Local fulfillment coordination and delivery planning</li></ul></aside>
        </div>
      </section>

      <section id="supplies" className="section sectionElevated">
        <div className="sectionHeader"><div className="eyebrow eyebrowDark">Supply lanes</div><h2>Clear supply paths. No guesswork.</h2><p>Choose the path that matches how you operate. Big Tex helps get the right products, the right parts, and the right support moving without unnecessary delays.</p></div>
        <div className="flowHint">Start with how you operate</div>
        <div className="lanes">{supplyLanes.map((lane) => (<article key={lane.label} id={lane.id} className={`lane${lane.highlight ? " laneHighlight" : ""}`}><div className="laneMedia">{lane.video ? (<video autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src={lane.video} type="video/mp4" /></video>) : (<img src={lane.image} alt={lane.alt} />)}</div><div className="laneTop">{lane.label}</div><h3>{lane.title}</h3><p>{lane.body}</p></article>))}</div>
      </section>

      <section id="commercial" className="band commercialBand">
        <div className="section split">
          <div className="panel panelWithImage"><div className="panelImage"><img src="/images/repair_01.png" alt="Pool equipment repair and service" /></div><div className="panelContent"><div className="eyebrow">Operational support</div><h2>Built for pool operators who cannot afford delays.</h2><p>Big Tex helps service teams, properties, and homeowners move from “we need this fixed” to the right product, part, or delivery path without chasing multiple vendors.</p><div className="proofChips" aria-label="Big Tex support strengths">{proofPoints.map((point) => (<span key={point}>{point}</span>))}</div></div></div>
          <div className="steps" aria-label="Fulfillment process"><div className="stepsIntro"><div className="eyebrow eyebrowDark">How it works</div><h2>From request to fulfillment, Big Tex keeps it moving.</h2></div>{operatingSteps.map((step) => (<div className="step" key={step.title}><strong>{step.title}</strong><span>{step.body}</span></div>))}</div>
        </div>
      </section>

      <section id="contact" className="section contactSection">
        <div className="contact contactWithImage intakeContact">
          <div className="contactBackdrop" aria-hidden="true" />
          <div className="contactContent"><div className="eyebrow">Big Tex Part Finder</div><h2>Don’t know the part? Send it or ask.</h2><p>Upload a photo or tell us what is happening. Big Tex will narrow the likely part, chemical, or supply path before you buy.</p><div className="contactChips" aria-label="Fast support options">{contactChips.map((chip) => (<span key={chip}>{chip}</span>))}</div><p className="responseNote">Typical response: 10–15 minutes during business hours.</p><div className="addressCard" aria-label="Big Tex Pool Supplies address"><span className="addressIcon">📍</span><div><strong>Visit Big Tex</strong><span>{contact.addressLine1}</span><span>{contact.addressLine2}</span><span>{contact.cityStateZip}</span></div></div></div>

          <form className="intakePanel" onSubmit={handleSubmit}>
            <div className="intakeTopline"><span className="liveDot" />Intake open for Houston pool operators</div>
            <div className="intakeTabs" role="tablist" aria-label="Part finder options"><button type="button" className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>Upload photo</button><button type="button" className={mode === "ask" ? "active" : ""} onClick={() => setMode("ask")}>Ask first</button></div>

            {mode === "photo" && (
              <label className={`uploadBox ${previewUrl ? "hasPreview" : ""}`}>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
                {previewUrl ? (<img className="uploadPreview" src={previewUrl} alt="Selected upload preview" />) : (<span className="uploadIcon">＋</span>)}
                <strong>{file?.name || "Take a photo of the part, equipment, or water"}</strong>
                <small>Send what you see: part, label, equipment pad, valve, basket, seal, fitting, or water color.</small>
              </label>
            )}

            <label className="fieldLabel" htmlFor="intake-message">Tell us what you need help with</label>
            <textarea id="intake-message" value={message} onChange={(event) => { setMessage(event.target.value); setGuideStatus("idle"); setGuideResult(null); resetResult(); }} placeholder="Example: Pump is humming but not starting. I need the right part today." rows={4} />
            <p className="fieldHelp">One short note is enough. Add brand, model, water color, urgency, pickup/delivery, or route details if you have them.</p>

            <div className="quickPrompts" aria-label="Common questions">{quickPrompts.map((prompt) => (<button type="button" key={prompt} onClick={() => { setMessage(prompt); setGuideStatus("idle"); setGuideResult(null); resetResult(); }}>{prompt}</button>))}</div>

            <div className="optionGroup"><span>Urgency</span><div>{urgencyOptions.map((option) => (<button type="button" key={option.value} className={urgency === option.value ? "active" : ""} onClick={() => { setUrgency(option.value); setGuideStatus("idle"); setGuideResult(null); }}>{option.label}</button>))}</div></div>
            <div className="optionGroup"><span>Need type</span><div>{needTypes.map((option) => (<button type="button" key={option.value} className={needType === option.value ? "active" : ""} onClick={() => { setNeedType(option.value); setGuideStatus("idle"); setGuideResult(null); }}>{option.label}</button>))}</div></div>

            <button className="guideButton" type="button" onClick={handleGuideRequest} disabled={guideStatus === "loading"}>{guideStatus === "loading" ? "Checking..." : "Identify the issue"}</button>

            {hasGuidance && (
              <div className="issueResult" role="status">
                <span>{guideStatus === "error" ? "Guidance fallback" : "Likely direction"}</span>
                <p>{activeGuidance}</p>
                <div className="nextStep"><strong>Next best step</strong><p>{activeHandoff}</p><a href={`tel:${contact.phoneHref}`}>Call Big Tex</a></div>
              </div>
            )}

            <div className="fieldGrid"><div><label className="fieldLabel" htmlFor="lead-name">Name</label><input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></div><div><label className="fieldLabel" htmlFor="lead-reply">Phone or email</label><input id="lead-reply" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} placeholder="Best reply method" /></div></div>
            <div className="intakeActions"><button className="button buttonPrimary" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending..." : "Submit & Get Help Fast"}</button><a className="button buttonSecondary" href={`mailto:${contact.email}?subject=${mailSubject}&body=${mailBody}`}>Email Request</a></div>
            <div className={`intakeResult ${status === "success" ? "success" : ""} ${status === "error" ? "error" : ""}`} role="status"><strong>{status === "success" ? "You’re in." : status === "error" ? "Couldn’t save request." : "Fastest path: send a photo and a reply method."}</strong><span>{resultMessage || "Big Tex uses this intake to identify the part, chemical, or supply path and follow up with the fastest practical next step."}</span></div>
          </form>
        </div>
      </section>
      <footer className="footer">© {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.</footer>
    </main>
  );
}
