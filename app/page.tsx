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

export default function HomePage() {
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
              Contact
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
              <a className="button buttonSecondary" href="#commercial">
                Commercial Supply Support
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
        <div className="contact contactWithImage">
          <div className="contactBackdrop" aria-hidden="true" />
          <div className="contactContent">
            <div className="eyebrow">Houston supply support</div>
            <h2>Need supplies fast? Call Big Tex.</h2>
            <p>
              Chemicals, parts, delivery support, and hard-to-find items sourced for Houston pool operations. Send the
              details and Big Tex will help identify the right product and the fastest practical path to fulfillment.
            </p>
            <p className="contactDetail">{contact.address}</p>
            <p className="contactDetail">{contact.email}</p>
          </div>

          <div className="contactActions">
            <a className="button buttonPrimary" href={`tel:${contact.phoneHref}`}>
              Call {contact.phone}
            </a>
            <a className="button buttonSecondary contactEmail" href={`mailto:${contact.email}`}>
              Email Big Tex
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.</footer>
    </main>
  );
}
