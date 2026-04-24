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
        <video className="heroVideo" autoPlay muted loop playsInline preload="none">
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

      <section id="supplies" className="section">
        <div className="sectionHeader">
          <h2>Clear supply paths for every customer.</h2>
          <p>
            Whether you’re maintaining one backyard pool or managing routes across Houston, Big Tex helps you get the
            right products, the right parts, and the right support without unnecessary friction.
          </p>
        </div>

        <div className="grid3">
          <div className="card">
            <h3>Retail & Homeowner Supplies</h3>
            <p>
              Everyday chemicals, filters, cleaners, tools, and maintenance essentials for keeping pools clean, safe, and
              ready to use.
            </p>
          </div>

          <div className="card">
            <h3>Commercial & Service Accounts</h3>
            <p>
              Supply support for pool service companies, apartments, HOAs, hotels, and property operators who need
              dependable fulfillment.
            </p>
          </div>

          <div id="parts" className="card">
            <h3>Parts & Specialty Sourcing</h3>
            <p>
              Help locating valves, sealers, baskets, filter components, cleaner parts, pumps, and other hard-to-find
              equipment.
            </p>
          </div>
        </div>
      </section>

      <section id="commercial" className="band">
        <div className="section split">
          <div className="panel">
            <div className="eyebrow">Operational support</div>
            <h2>More than a supply counter. A partner in pool operations.</h2>
            <p>
              Big Tex is built for customers who cannot afford delays: service teams with routes to complete, properties
              that need pools operational, and homeowners who need the right answer the first time.
            </p>
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

      <section id="contact" className="section">
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
