"use client";

import { FormEvent, useMemo, useState } from "react";

const contact = {
  phone: "(832) 859-9678",
  phoneHref: "+18328599678",
  email: "will@bigtexpoolsupplies.com",
  address: "5829 West Sam Houston Parkway N, Suite 1105, Houston, TX 77041",
};

const supplyLanes = [
  {
    label: "Homeowners",
    title: "Get what you need. Fast.",
    body:
      "Chemicals, filters, cleaners, and essentials to keep your pool clean, balanced, and ready without overbuying or guessing.",
    image: "/images/residential_pool_01.png",
    alt: "Residential swimming pool",
  },
  {
    label: "Service & Commercial",
    title: "Keep routes moving.",
    body:
      "Reliable supply for service companies, apartments, HOAs, hotels, and operators who cannot afford delays, stockouts, or wrong parts.",
    video: "/video/delivery_01.mp4",
    highlight: true,
  },
  {
    label: "Speciality Parts",
    title: "Find what others can’t.",
    body:
      "Valves, baskets, seals, filters, pumps, cleaner parts, and hard-to-source components identified and sourced correctly.",
    image: "/images/speciality_parts_01.png",
    alt: "Pool parts and components",
    id: "parts",
  },
];

const operatingSteps = [
  {
    title: "1. Identify the need",
    body: "Retail order, commercial supply request, delivery need, or specialty part.",
  },
  {
    title: "2. Confirm availability",
    body: "Check stock, source options, delivery timing, and any missing information.",
  },
  {
    title: "3. Coordinate fulfillment",
    body: "Prepare pickup, ordering, sourcing, or local delivery support.",
  },
  {
    title: "4. Keep pools running",
    body: "Reduce delays, missed items, and wasted time across Houston pool operations.",
  },
];

const proofPoints = ["Houston supply support", "Commercial routing help", "Hard-to-find parts", "Fast fulfillment path"];
const contactChips = ["Photo ID help", "Houston delivery", "Commercial support", "Hard-to-find parts"];
const quickPrompts = ["Pump is humming but not starting", "Water pressure is low", "Cleaner part broke", "Need a valve or fitting"];

type IntakeMode = "photo" | "ask";

function getGuidedResponse(question: string) {
  const text = question.toLowerCase();

  if (!question.trim()) {
    return "Tell us what is happening with the pool, equipment, or part. A short note is enough to start narrowing the path.";
  }

  if (text.includes("pump") || text.includes("humming") || text.includes("motor")) {
    return "This sounds pump-related. A photo of the pump label, capacitor area, basket lid, or the failed part can help Big Tex narrow the replacement path quickly.";
  }

  if (text.includes("pressure") || text.includes("flow") || text.includes("circulation")) {
    return "Low pressure or weak circulation can point to filter, valve, basket, pump, or cleaner-side issues. A photo of the equipment pad and the part in question is the fastest next step.";
  }

  if (text.includes("cleaner") || text.includes("vacuum") || text.includes("hose")) {
    return "Cleaner issues often come down to small replacement parts that are hard to describe by name. Upload a close photo and include the cleaner brand if visible.";
  }

  if (text.includes("valve") || text.includes("fitting") || text.includes("seal") || text.includes("gasket")) {
    return "That is exactly the kind of part request where a photo helps. Send the part, the connection points, and any visible numbers so Big Tex can source the right fit.";
  }

  if (text.includes("commercial") || text.includes("route") || text.includes("property") || text.includes("hoa")) {
    return "For route or property support, include the item needed, timing pressure, and whether pickup or delivery is preferred. Big Tex can help turn that into a fulfillment path.";
  }

  return "Good intake start. Add a photo if you have one, then include your contact info so Big Tex can identify the right product, part, or delivery path.";
}

export default function HomePage() {
  const [mode, setMode] = useState<IntakeMode>("photo");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const guidedResponse = useMemo(() => getGuidedResponse(question), [question]);

  const mailSubject = encodeURIComponent("Pool part help request");
  const mailBody = encodeURIComponent(
    [
      "Pool part help request",
      "",
      `Name: ${name || ""}`,
      `Reply to: ${replyTo || ""}`,
      `Photo selected: ${fileName || "No photo selected"}`,
      `Question: ${question || ""}`,
      `Description: ${description || ""}`,
      "",
      "Please attach the part photo before sending if it did not attach automatically from the website.",
    ].join("\n"),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
            <a href="#commercial">Commercial</a>
            <a href="#parts">Parts</a>
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
            <div className="eyebrow">Big Tex Part Finder</div>
            <h2>Don’t know the part? Send it or ask.</h2>
            <p>
              Upload a photo, describe the problem, or ask what you need. Big Tex will help identify the right product,
              replacement part, or supply path so the pool gets back online faster.
            </p>
            <div className="contactChips" aria-label="Fast support options">
              {contactChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <p className="contactDetail">{contact.address}</p>
            <p className="contactDetail">{contact.email}</p>
          </div>

          <form className="intakePanel" onSubmit={handleSubmit}>
            <div className="intakeTopline">
              <span className="liveDot" />
              Intake open for Houston pool operators
            </div>

            <div className="intakeTabs" role="tablist" aria-label="Part finder options">
              <button type="button" className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>
                Upload photo
              </button>
              <button type="button" className={mode === "ask" ? "active" : ""} onClick={() => setMode("ask")}>
                Ask first
              </button>
            </div>

            {mode === "photo" ? (
              <label className="uploadBox">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
                />
                <span className="uploadIcon">＋</span>
                <strong>{fileName || "Upload or take a photo"}</strong>
                <small>Part, label, equipment pad, valve, basket, cleaner, seal, or fitting.</small>
              </label>
            ) : (
              <div className="askBox">
                <label htmlFor="part-question">What is happening?</label>
                <textarea
                  id="part-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: Pump is humming but not starting. I need the right part today."
                  rows={4}
                />
                <div className="quickPrompts" aria-label="Common questions">
                  {quickPrompts.map((prompt) => (
                    <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="solaceLite">
                  <span>Guided intake</span>
                  <p>{guidedResponse}</p>
                </div>
              </div>
            )}

            <label className="fieldLabel" htmlFor="part-description">
              Short note
            </label>
            <textarea
              id="part-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Brand, model, urgency, pickup or delivery, commercial route details..."
              rows={3}
            />

            <div className="fieldGrid">
              <div>
                <label className="fieldLabel" htmlFor="lead-name">
                  Name
                </label>
                <input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="fieldLabel" htmlFor="lead-reply">
                  Phone or email
                </label>
                <input
                  id="lead-reply"
                  value={replyTo}
                  onChange={(event) => setReplyTo(event.target.value)}
                  placeholder="Best reply method"
                />
              </div>
            </div>

            <div className="intakeActions">
              <button className="button buttonPrimary" type="submit">
                Get Help Fast
              </button>
              <a className="button buttonSecondary" href={`mailto:${contact.email}?subject=${mailSubject}&body=${mailBody}`}>
                Email Request
              </a>
            </div>

            {submitted && (
              <div className="intakeResult" role="status">
                <strong>Request staged.</strong>
                <span>
                  Call Big Tex now for fastest response, or use Email Request to send the details. Backend lead storage can
                  be wired next to capture this form automatically.
                </span>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.</footer>
    </main>
  );
}
