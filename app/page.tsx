const contact = {
  phone: "(832) 859-9678",
  email: "will@bigtexpoolsupplies.com",
  address: "5829 West Sam Houston Parkway N, Suite 1105, Houston, TX 77041",
};

export default function HomePage() {
  return (
    <main>
      <header className="header">
        <nav className="nav">
          <a className="logo" href="#top" aria-label="Big Tex Pool Supplies home">
            <span className="logoMark">TX</span>
            <span>Big Tex Pool Supplies</span>
          </a>

          <div className="navLinks">
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
          <div>
            <div className="eyebrow">Houston pool supply, sourcing, and delivery support</div>

            <h1>The pool supplies Houston operators depend on.</h1>

            <p className="lede">
              Big Tex Pool Supplies helps homeowners, pool service companies, and commercial properties get the chemicals,
              equipment, replacement parts, and hard-to-find items they need—quickly, accurately, and without chasing
              multiple vendors.
            </p>

            <div className="heroActions">
              <a className="button buttonPrimary" href={`tel:${contact.phone}`}>
                Call Big Tex
              </a>
              <a className="button buttonSecondary" href="#commercial">
                Commercial Supply Support
              </a>
            </div>
          </div>

          <aside className="heroCard">
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
  {/* LEFT — Homeowners */}
  <div className="lane">
    <div className="laneMedia">
      <img
        src="/images/residential_pool_01.png"
        alt="Residential swimming pool"
      />
    </div>

    <div className="laneTop">Homeowners</div>
    <h3>Get what you need. Fast.</h3>
    <p>
      Chemicals, filters, cleaners, and essentials to keep your pool clean,
      balanced, and ready without overbuying or guessing.
    </p>
  </div>

  {/* MIDDLE — KEEP EXACTLY AS YOU HAVE (video) */}
  <div className="lane highlight">
    <div className="laneMedia">
      <video autoPlay muted loop playsInline preload="metadata">
        <source src="/video/delivery_01.mp4" type="video/mp4" />
      </video>
    </div>

    <div className="laneTop">Service & Commercial</div>
    <h3>Keep routes moving.</h3>
    <p>
      Reliable supply for service companies, apartments, HOAs, hotels, and
      operators who cannot afford delays, stockouts, or wrong parts.
    </p>
  </div>

  {/* RIGHT — Specialty Parts */}
  <div className="lane">
    <div className="laneMedia">
      <img
        src="/images/speciality_parts_01.png"
        alt="Pool parts and components"
      />
    </div>

    <div className="laneTop">Specialty Parts</div>
    <h3>Find what others can’t.</h3>
    <p>
      Valves, baskets, seals, filters, pumps, cleaner parts, and hard-to-source
      components identified and sourced correctly.
    </p>
  </div>
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

    <h2>More than a supply counter. A partner in pool operations.</h2>

    <p>
      Big Tex is built for customers who cannot afford delays: service teams with
      routes to complete, properties that need pools operational, and homeowners
      who need the right answer the first time.
    </p>
  </div>
</div>

          <div className="steps">
            <div className="step">
              <strong>1. Identify the need</strong>
              Retail order, commercial supply request, delivery need, or specialty part.
            </div>

            <div className="step">
              <strong>2. Confirm availability</strong>
              Check stock, source options, delivery timing, and any missing information.
            </div>

            <div className="step">
              <strong>3. Coordinate fulfillment</strong>
              Prepare pickup, ordering, sourcing, or local delivery support.
            </div>

            <div className="step">
              <strong>4. Keep pools running</strong>
              Reduce delays, missed items, and wasted time across Houston pool operations.
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contactSection">
        <div className="contact">
          <div>
            <h2>Need supplies, delivery support, or a hard-to-find part?</h2>
            <p>
              Call, email, or send the part details. Big Tex will help identify the right product and the fastest
              practical path to fulfillment.
            </p>
            <p className="contactDetail">{contact.address}</p>
            <p className="contactDetail">{contact.email}</p>
          </div>

          <a className="button buttonPrimary" href={`mailto:${contact.email}`}>
            Email Big Tex
          </a>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.</footer>
    </main>
  );
}
