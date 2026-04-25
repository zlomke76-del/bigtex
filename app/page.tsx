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

const seoHelpPages = [
  {
    href: "/houston/pool-parts-houston",
    label: "Parts Help",
    title: "Pool Parts Houston",
    body: "Identify valves, baskets, seals, cleaner parts, fittings, and hard-to-find replacements before buying the wrong part.",
  },
  {
    href: "/houston/pool-pump-not-starting-houston",
    label: "Pump Help",
    title: "Pool Pump Not Starting",
    body: "Narrow pump-side issues like humming, failed starts, lid problems, baskets, seals, capacitors, and motor-related parts.",
  },
  {
    href: "/houston/green-cloudy-pool-water-houston",
    label: "Water Help",
    title: "Green or Cloudy Pool Water",
    body: "Use a water photo and any test readings to narrow the right chemical supply path instead of guessing.",
  },
  {
    href: "/houston/pool-valve-fitting-replacement-houston",
    label: "Valves & Fittings",
    title: "Pool Valve and Fitting Replacement",
    body: "Confirm pipe size, connection points, gaskets, unions, valve kits, seals, and fittings from photos before the repair stalls.",
  },
  {
    href: "/houston/commercial-pool-chemical-supply-houston",
    label: "Commercial",
    title: "Commercial Pool Chemical Supply",
    body: "Support for service companies, apartments, HOAs, hotels, and operators who need chemicals, delivery, and route continuity.",
  },
  {
    href: "/houston/pool-service-route-supply-houston",
    label: "Route Support",
    title: "Pool Service Route Supply",
    body: "Keep routes moving with supply support, sourcing, pickup coordination, delivery planning, and urgent fulfillment paths.",
  },
  {
    href: "/houston/hard-to-find-pool-parts-houston",
    label: "Specialty Parts",
    title: "Hard-to-Find Pool Parts",
    body: "Find obscure, discontinued, brand-specific, or easy-to-confuse pool parts with photo-first verification.",
  },
  {
    href: "/houston/pool-supply-delivery-houston",
    label: "Delivery",
    title: "Pool Supply Delivery",
    body: "Coordinate pickup, staging, delivery, and fulfillment for chemicals, parts, commercial routes, and properties.",
  },
  {
    href: "/houston/pool-cleaner-parts-houston",
    label: "Cleaner Parts",
    title: "Pool Cleaner Parts",
    body: "Identify hoses, wheels, baskets, fittings, cleaner seals, and small replacement parts from photos.",
  },
  {
    href: "/houston/pool-equipment-parts-houston",
    label: "Equipment Pad",
    title: "Pool Equipment Parts",
    body: "Use equipment-pad photos to narrow pump, filter, valve, basket, cleaner, seal, and fitting needs.",
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
const homeQuickPrompts = ["Pump is humming but not starting", "Water is green or cloudy", "Cleaner part broke", "Need a valve or fitting"];
const commercialQuickPrompts = ["Need chemicals for route today", "Commercial pool is green or cloudy", "Need delivery for multiple pools", "Need hard-to-find part fast"];

const urgencyOptions = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "checking", label: "Just checking" },
];

const homeNeedTypes = [
  { value: "part_equipment", label: "Part / equipment" },
  { value: "water_chemicals", label: "Water / chemicals" },
  { value: "delivery_pickup", label: "Delivery / pickup" },
];

const commercialNeedTypes = [
  { value: "commercial_route", label: "Route support" },
  { value: "chemical_supply", label: "Chemical supply" },
  { value: "route_emergency", label: "Route emergency" },
  { value: "recurring_support", label: "Recurring support" },
];

type CustomerLane = "part_help" | "commercial_express";
type IntakeMode = "photo" | "ask";
type IntakeStatus = "idle" | "submitting" | "success" | "error";
type GuideStatus = "idle" | "loading" | "ready" | "error";

type GuideResult = {
  guidance: string;
  handoffMessage: string;
  imageReviewed?: boolean;
};

const starterGuidance =
  "A photo or short description is enough. Big Tex will narrow the likely part, chemical, or supply path before you buy.";

function getFallbackGuidedResponse(message: string, hasPhoto: boolean) {
  const text = message.toLowerCase();

  if (!message.trim() && hasPhoto) {
    return "Based on the photo, Big Tex can start narrowing the part, equipment, water, or supply path. Add a short note if there is timing pressure or a visible issue.";
  }

  if (!message.trim()) return starterGuidance;

  if (text.includes("green") || text.includes("cloudy") || text.includes("water")) {
    return "This likely points to water condition or chemical guidance. A photo of the water color plus any current chemical readings helps Big Tex point you toward the right product path.";
  }

  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return "This likely points to a pump-side part such as a capacitor, motor, lid, basket, or seal. A photo of the pump label or failed part helps confirm the exact match fast.";
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return "Low pressure or weak circulation often points toward the filter, valve, basket, pump, or cleaner-side components. A photo of the equipment pad and visible part is the fastest next step.";
  }

  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) {
    return "Cleaner issues often come down to small replacement parts that are hard to describe by name. Upload a close photo and include the cleaner brand if visible.";
  }

  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) {
    return "This likely points to a valve, fitting, seal, or gasket request. Photos of the part, connection points, and any visible numbers help Big Tex confirm the right fit.";
  }

  return "Good intake start. A photo of the part, equipment pad, label, or water color will help Big Tex identify the right product or supply path faster.";
}

function getFallbackHandoff(message: string, hasPhoto: boolean) {
  if (!message.trim() && !hasPhoto) return "Add a photo or short note, then Big Tex can help confirm the right next step.";
  return "Submit this request or call Big Tex to confirm the exact match before you buy.";
}

export default function HomePage() {
  const [customerLane, setCustomerLane] = useState<CustomerLane>("part_help");
  const [mode, setMode] = useState<IntakeMode>("photo");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [poolCount, setPoolCount] = useState("");
  const [urgency, setUrgency] = useState("today");
  const [needType, setNeedType] = useState("part_equipment");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [guideStatus, setGuideStatus] = useState<GuideStatus>("idle");
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [resultMessage, setResultMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const hasPhoto = Boolean(file);
  const localGuidedResponse = useMemo(() => getFallbackGuidedResponse(message, hasPhoto), [message, hasPhoto]);
  const localHandoff = useMemo(() => getFallbackHandoff(message, hasPhoto), [message, hasPhoto]);
  const isCommercialExpress = customerLane === "commercial_express";
  const activeNeedTypes = isCommercialExpress ? commercialNeedTypes : homeNeedTypes;
  const activeQuickPrompts = isCommercialExpress ? commercialQuickPrompts : homeQuickPrompts;
  const panelHeadline = isCommercialExpress ? "Commercial Express" : "Big Tex Part Finder";
  const submitLabel = isCommercialExpress ? "Start Commercial Express" : "Submit & Get Help Fast";
  const hasPreSubmitGuidance = status !== "success" && (guideStatus === "ready" || guideStatus === "error");
  const activeGuidance = guideResult?.guidance || localGuidedResponse;
  const activeHandoff = guideResult?.handoffMessage || localHandoff;
  const guideLabel = guideResult?.imageReviewed ? "Photo-reviewed direction" : guideStatus === "error" ? "Guidance fallback" : "Likely direction";
  const canEditIntake = status !== "success";

  const mailSubject = encodeURIComponent(isCommercialExpress ? "Commercial pool supply request" : "Pool part help request");
  const mailBody = encodeURIComponent(
    [
      isCommercialExpress ? "Commercial pool supply request" : "Pool part help request",
      "",
      `Name: ${name || ""}`,
      `Reply to: ${replyTo || ""}`,
      `Photo selected: ${file?.name || "No photo selected"}`,
      `Lane: ${customerLane}`,
      `Company: ${companyName || ""}`,
      `Pools / properties: ${poolCount || ""}`,
      `Urgency: ${urgency}`,
      `Need type: ${needType}`,
      `Message: ${message || ""}`,
      "",
      "Please attach the part, equipment, or water photo before sending if it did not attach automatically from the website.",
    ].join("\n"),
  );

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
    setReferenceId("");
  }

  function resetGuidance() {
    setGuideStatus("idle");
    setGuideResult(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    resetGuidance();
    resetResult();
  }

  function handleNewRequest() {
    setMessage("");
    setName("");
    setReplyTo("");
    setCompanyName("");
    setPoolCount("");
    setCustomerLane("part_help");
    setUrgency("today");
    setNeedType("part_equipment");
    setFile(null);
    resetGuidance();
    resetResult();
    setMode("photo");
  }

  function selectCustomerLane(nextLane: CustomerLane) {
    setCustomerLane(nextLane);
    setNeedType(nextLane === "commercial_express" ? "commercial_route" : "part_equipment");
    resetGuidance();
    resetResult();
  }

  async function handleGuideRequest() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage && !file) {
      setGuideResult({
        guidance: starterGuidance,
        handoffMessage: "Add a photo or short note so Big Tex can narrow the right next step.",
      });
      setGuideStatus("ready");
      return;
    }

    setGuideStatus("loading");

    try {
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append("action", "guide");
        formData.append("message", trimmedMessage);
        formData.append("mode", mode);
        formData.append("urgency", urgency);
        formData.append("needType", needType);
        formData.append("source", "bigtex-homepage-guide");
        formData.append("customerLane", customerLane);
        formData.append("companyName", companyName);
        formData.append("poolCount", poolCount);
        formData.append("photo", file);

        response = await fetch("/api/bigtex-intake", { method: "POST", body: formData });
      } else {
        response = await fetch("/api/bigtex-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "guide",
            message: trimmedMessage,
            urgency,
            needType,
            customerLane,
            companyName,
            poolCount,
          }),
        });
      }

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Guided intake is unavailable right now.");

      setGuideResult({
        guidance: payload.guidance || localGuidedResponse,
        handoffMessage: payload.handoffMessage || localHandoff,
        imageReviewed: Boolean(payload.imageReviewed),
      });
      setGuideStatus("ready");
    } catch {
      setGuideResult({ guidance: localGuidedResponse, handoffMessage: localHandoff, imageReviewed: false });
      setGuideStatus("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setResultMessage("");
    setReferenceId("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("replyTo", replyTo);
      formData.append("message", message);
      formData.append("mode", mode);
      formData.append("urgency", urgency);
      formData.append("needType", needType);
      formData.append("source", "bigtex-homepage");
      formData.append("customerLane", customerLane);
      formData.append("companyName", companyName);
      formData.append("poolCount", poolCount);
      if (file) formData.append("photo", file);

      const response = await fetch("/api/bigtex-intake", { method: "POST", body: formData });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload?.error || "Unable to save this request right now.");

      setStatus("success");
      setResultMessage(payload.message || "Big Tex is reviewing your request and will help identify the exact part or solution.");
      setReferenceId(payload.referenceId || "");
      setGuideResult({
        guidance: payload.guidance || activeGuidance,
        handoffMessage: payload.handoffMessage || "Call now for fastest confirmation, or wait for a response during business hours.",
        imageReviewed: Boolean(payload.imageReviewed),
      });
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
          <a className="logo" href="#top" aria-label="Big Tex Pool Supplies home">
            <span className="logoMark">TX</span>
            <span>Big Tex Pool Supplies</span>
          </a>

          <div className="navLinks" aria-label="Primary navigation">
            <a href="#supplies">Supplies</a>
            <a href="#pool-help">Pool Help</a>
            <a href="#commercial">Commercial</a>
            <a href="#contact" className="cta">
              Part Help
            </a>
          </div>
        </nav>
      </header>

      <section id="top" className="hero">
        <video className="heroVideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/video/pool_01.mp4" type="video/mp4" />
        </video>
        <div className="heroOverlay" />

        <div className="heroInner">
          <div className="heroCopy">
            <div className="eyebrow">Houston pool supply, sourcing, and delivery support</div>
            <h1>The pool supplies Houston operators depend on.</h1>
            <p className="lede">
              Big Tex Pool Supplies helps homeowners, pool service companies, and commercial properties get the chemicals,
              equipment, replacement parts, and hard-to-find items they need—quickly, accurately, and without chasing
              multiple vendors.
            </p>
            <div className="heroActions">
              <a className="button buttonPrimary" href={`tel:${contact.phoneHref}`}>
                Call Big Tex
              </a>
              <a className="button buttonSecondary" href="#contact">
                Upload Part Photo
              </a>
              <a className="button buttonGhost" href="#pool-help">
                Browse Pool Help
              </a>
            </div>
          </div>

          <aside className="heroCard" aria-label="What Big Tex handles">
            <h2>What we handle</h2>
            <ul className="checks">
              <li>Pool chemicals, maintenance supplies, and equipment</li>
              <li>Commercial and service-company supply support</li>
              <li>Hard-to-find valves, filters, baskets, cleaners, and replacement parts</li>
              <li>Local fulfillment coordination and delivery planning</li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="supplies" className="section sectionElevated">
        <div className="sectionHeader">
          <div className="eyebrow eyebrowDark">Supply lanes</div>
          <h2>Clear supply paths. No guesswork.</h2>
          <p>
            Choose the path that matches how you operate. Big Tex helps get the right products, the right parts, and the
            right support moving without unnecessary delays.
          </p>
        </div>

        <div className="flowHint">Start with how you operate</div>

        <div className="lanes">
          {supplyLanes.map((lane) => (
            <article key={lane.label} id={lane.id} className={`lane${lane.highlight ? " laneHighlight" : ""}`}>
              <div className="laneMedia">
                {lane.video ? (
                  <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
                    <source src={lane.video} type="video/mp4" />
                  </video>
                ) : (
                  <img src={lane.image} alt={lane.alt} />
                )}
              </div>
              <div className="laneTop">{lane.label}</div>
              <h3>{lane.title}</h3>
              <p>{lane.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pool-help" className="section helpSection">
        <div className="sectionHeader">
          <div className="eyebrow eyebrowDark">Houston pool help</div>
          <h2>Problem pages that lead customers back to Big Tex.</h2>
          <p>
            These pages are practical intake doors for customers searching with a specific pool problem. Each one helps
            them understand the likely direction, then routes them into Part Help, Commercial Express, a call, or a visit.
          </p>
        </div>

        <div className="helpGrid" aria-label="Houston pool supply help pages">
          {seoHelpPages.map((page) => (
            <a className="helpCard" key={page.href} href={page.href}>
              <span>{page.label}</span>
              <strong>{page.title}</strong>
              <p>{page.body}</p>
            </a>
          ))}
        </div>

        <div className="helpCta">
          <div>
            <strong>Not sure which page fits?</strong>
            <span>Start with a photo or short note and Big Tex will narrow the right path.</span>
          </div>
          <a className="button buttonPrimary" href="#contact">
            Start Part Finder
          </a>
        </div>
      </section>

      <section id="commercial" className="band commercialBand">
        <div className="section split">
          <div className="panel panelWithImage">
            <div className="panelImage">
              <img src="/images/repair_01.png" alt="Pool equipment repair and service" />
            </div>
            <div className="panelContent">
              <div className="eyebrow">Operational support</div>
              <h2>Built for pool operators who cannot afford delays.</h2>
              <p>
                Big Tex helps service teams, properties, and homeowners move from “we need this fixed” to the right
                product, part, or delivery path without chasing multiple vendors.
              </p>
              <div className="proofChips" aria-label="Big Tex support strengths">
                {proofPoints.map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="steps" aria-label="Fulfillment process">
            <div className="stepsIntro">
              <div className="eyebrow eyebrowDark">How it works</div>
              <h2>From request to fulfillment, Big Tex keeps it moving.</h2>
            </div>
            {operatingSteps.map((step) => (
              <div className="step" key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section contactSection">
        <div className="contact contactWithImage intakeContact">
          <div className="contactBackdrop" aria-hidden="true" />

          <div className="contactContent">
            <div className="eyebrow">Part Help + Commercial Express</div>
            <h2>Choose the right lane. Big Tex keeps it moving.</h2>
            <p>
              Homeowners can get help identifying parts, equipment issues, or water problems. Commercial operators can
              use Commercial Express for routes, chemicals, delivery, and recurring supply support.
            </p>
            <div className="contactChips" aria-label="Fast support options">
              {contactChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <p className="responseNote">Typical response: 10–15 minutes during business hours.</p>
            <div className="addressCard" aria-label="Big Tex Pool Supplies address">
              <span className="addressIcon">📍</span>
              <div>
                <strong>Visit Big Tex</strong>
                <span>{contact.addressLine1}</span>
                <span>{contact.addressLine2}</span>
                <span>{contact.cityStateZip}</span>
              </div>
            </div>
          </div>

          <form className="intakePanel" onSubmit={handleSubmit}>
            <div className="intakeTopline">
              <span className="liveDot" />
              {isCommercialExpress ? "Commercial Express active" : "Part Help active"}
            </div>

            <div className="laneSelector" aria-label="Choose intake lane">
              <button type="button" className={customerLane === "part_help" ? "active" : ""} onClick={() => selectCustomerLane("part_help")}>
                <strong>Part Help</strong>
                <span>Home / one-off questions</span>
              </button>
              <button type="button" className={customerLane === "commercial_express" ? "active commercial" : "commercial"} onClick={() => selectCustomerLane("commercial_express")}>
                <strong>Commercial Express</strong>
                <span>Routes, chemicals, delivery</span>
              </button>
            </div>

            <div className="laneContext">
              <strong>{panelHeadline}</strong>
              <span>{isCommercialExpress ? "Priority support for pool service routes, apartments, HOAs, hotels, and operators." : "Upload a photo or ask what you need so Big Tex can narrow it quickly."}</span>
            </div>

            <div className="intakeTabs" role="tablist" aria-label="Part finder options">
              <button type="button" className={mode === "photo" ? "active" : ""} onClick={() => { setMode("photo"); resetGuidance(); resetResult(); }}>
                Upload photo
              </button>
              <button type="button" className={mode === "ask" ? "active" : ""} onClick={() => { setMode("ask"); resetGuidance(); resetResult(); }}>
                Ask first
              </button>
            </div>

            {mode === "photo" && (
              <label className={`uploadBox ${previewUrl ? "hasPreview" : ""} ${guideStatus === "loading" ? "isAnalyzing" : ""}`}>
                <input type="file" accept="image/*" capture="environment" disabled={!canEditIntake} onChange={handleFileChange} />
                {previewUrl ? <img className="uploadPreview" src={previewUrl} alt="Selected upload preview" /> : <span className="uploadIcon">＋</span>}
                <strong>{file?.name || (isCommercialExpress ? "Take a photo of the pool, equipment, label, or chemical need" : "Take a photo of the part, equipment, or water")}</strong>
                <small>{guideStatus === "loading" && file ? "Analyzing photo..." : isCommercialExpress ? "Send route-critical details: water color, equipment pad, chemical need, label, fitting, or part." : "Send what you see: part, label, equipment pad, valve, basket, seal, fitting, or water color."}</small>
              </label>
            )}

            {status !== "success" && (
              <>
                <label className="fieldLabel" htmlFor="intake-message">Tell us what you need help with</label>
                <textarea
                  id="intake-message"
                  value={message}
                  disabled={!canEditIntake}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    resetGuidance();
                    resetResult();
                  }}
                  placeholder={isCommercialExpress ? "Example: Need chlorine and acid support for tomorrow's route." : "Example: Pump is humming but not starting. I need the right part today."}
                  rows={4}
                />

                <p className="fieldHelp">{isCommercialExpress ? "Add route timing, chemical need, delivery/pickup preference, properties, or urgency." : "One short note is enough. Add brand, model, water color, urgency, pickup/delivery, or route details if you have them."}</p>

                <div className="quickPrompts" aria-label="Common questions">
                  {activeQuickPrompts.map((prompt) => (
                    <button type="button" key={prompt} onClick={() => { setMessage(prompt); resetGuidance(); resetResult(); }}>
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="optionGroup">
                  <span>Urgency</span>
                  <div>
                    {urgencyOptions.map((option) => (
                      <button type="button" key={option.value} className={urgency === option.value ? "active" : ""} onClick={() => { setUrgency(option.value); resetGuidance(); resetResult(); }}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="optionGroup">
                  <span>Need type</span>
                  <div>
                    {activeNeedTypes.map((option) => (
                      <button type="button" key={option.value} className={needType === option.value ? "active" : ""} onClick={() => { setNeedType(option.value); resetGuidance(); resetResult(); }}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="guideButton" type="button" onClick={handleGuideRequest} disabled={guideStatus === "loading"}>
                  {guideStatus === "loading" ? (file ? "Analyzing photo..." : "Checking...") : file ? "Analyze photo" : "Identify the issue"}
                </button>

                {hasPreSubmitGuidance && (
                  <div className="issueResult" role="status">
                    <span>{guideLabel}</span>
                    <p>{activeGuidance}</p>
                    <div className="nextStep">
                      <strong>Next step</strong>
                      <p>{activeHandoff}</p>
                      <a href={`tel:${contact.phoneHref}`}>Call Big Tex</a>
                    </div>
                  </div>
                )}

                {isCommercialExpress && (
                  <div className="commercialFields">
                    <div>
                      <label className="fieldLabel" htmlFor="company-name">Company / Property</label>
                      <input id="company-name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company, HOA, hotel, or property" />
                    </div>
                    <div>
                      <label className="fieldLabel" htmlFor="pool-count">Pools / Properties</label>
                      <input id="pool-count" value={poolCount} onChange={(event) => setPoolCount(event.target.value)} placeholder="Example: 12 pools / 4 properties" />
                    </div>
                  </div>
                )}

                <div className="fieldGrid">
                  <div>
                    <label className="fieldLabel" htmlFor="lead-name">Name</label>
                    <input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="fieldLabel" htmlFor="lead-reply">Phone or email</label>
                    <input id="lead-reply" value={replyTo} onChange={(event) => setReplyTo(event.target.value)} placeholder="Best reply method" />
                  </div>
                </div>

                <div className="intakeActions">
                  <button className="button buttonPrimary" type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending..." : submitLabel}
                  </button>
                  <a className="button buttonSecondary" href={`mailto:${contact.email}?subject=${mailSubject}&body=${mailBody}`}>
                    Email Request
                  </a>
                </div>

                {status === "error" && (
                  <div className="intakeResult error" role="status">
                    <strong>Couldn’t save request.</strong>
                    <span>{resultMessage}</span>
                  </div>
                )}

                {status === "idle" && (
                  <div className="intakeResult" role="status">
                    <strong>{isCommercialExpress ? "Commercial Express: route support starts here." : "Fastest path: send a photo and a reply method."}</strong>
                    <span>{isCommercialExpress ? "Big Tex uses this intake to prioritize chemicals, delivery, sourcing, and recurring commercial supply needs." : "Big Tex uses this intake to identify the part, chemical, or supply path and follow up with the fastest practical next step."}</span>
                  </div>
                )}
              </>
            )}

            {status === "success" && (
              <div className="submittedPanel" role="status">
                <span>{isCommercialExpress ? "Commercial Express received" : "You’re all set"}</span>
                <h3>{isCommercialExpress ? "Big Tex is reviewing your commercial supply request." : "Big Tex is reviewing your request."}</h3>
                <p>{resultMessage || (isCommercialExpress ? "Big Tex will help route your chemical, delivery, part, or recurring support need." : "Big Tex will help identify the exact part or solution.")}</p>
                {referenceId && <div className="referenceBadge">Reference ID: {referenceId}</div>}
                <div className="submittedActions">
                  <a className="button buttonPrimary" href={`tel:${contact.phoneHref}`}>Call Big Tex</a>
                  <button type="button" className="button buttonSecondary" onClick={handleNewRequest}>Send another request</button>
                </div>
                <small>{isCommercialExpress ? "Call now for urgent route support, or wait for a response during business hours." : "Call now for fastest confirmation, or wait for a response during business hours."}</small>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footerInner">
          <div>
            <strong>Big Tex Pool Supplies</strong>
            <span>Houston pool supply, sourcing, commercial support, and delivery coordination.</span>
          </div>

          <nav className="footerLinks" aria-label="Helpful Big Tex pages">
            <a href="/houston/pool-parts-houston">Pool Parts Houston</a>
            <a href="/houston/commercial-pool-chemical-supply-houston">Commercial Chemical Supply</a>
            <a href="/houston/pool-supply-delivery-houston">Pool Supply Delivery</a>
            <a href="/houston/green-cloudy-pool-water-houston">Green / Cloudy Water</a>
            <a href="/houston/hard-to-find-pool-parts-houston">Hard-to-Find Parts</a>
          </nav>

          <span>© {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.</span>
        </div>
      </footer>
    </main>
  );
}
