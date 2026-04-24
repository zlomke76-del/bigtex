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
            <a href="#contact" className="cta">Contact</a>
          </div>
        </nav>
      </header>

      {/* HERO WITH VIDEO */}
      <section id="top" className="hero">
        <video
          className="heroVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/video/pool_01.mp4" type="video/mp4" />
        </video>

        <div className="heroOverlay" />

        <div className="heroInner">
          <div>
            <div className="eyebrow">
              Houston pool supply, delivery, and sourcing
            </div>
            <h1>Pool supplies that keep Houston pools running.</h1>

            <p className="lede">
              Big Tex Pool Supplies helps homeowners, pool service companies,
              and commercial operators get the chemicals, equipment,
              replacement parts, and hard-to-find supplies they need—without
              wasting time chasing vendors.
            </p>

            <div className="heroActions">
              <a className="button buttonPrimary" href={`tel:${contact.phone}`}>
                Call {contact.phone}
              </a>
              <a className="button buttonSecondary" href="#commercial">
                Commercial supply support
              </a>
            </div>
          </div>

          <aside className="heroCard">
            <h2>What we help with</h2>
            <ul className="checks">
              <li>Pool chemicals and everyday supply needs</li>
              <li>Commercial and service-company support</li>
              <li>
                Hard-to-find valves, filters, baskets, cleaners, and parts
              </li>
              <li>
                Ordering support, fulfillment coordination, and local delivery
                planning
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="supplies" className="section">
        <div className="sectionHeader">
          <h2>Clear paths for every customer.</h2>
          <p>
            Buy supplies, support a commercial route, or source a specific part.
          </p>
        </div>

        <div className="grid3">
          <div className="card">
            <h3>Retail & Online Ordering</h3>
            <p>
              Fast access to pool chemicals, parts, filters, cleaners, and
              maintenance essentials.
            </p>
          </div>

          <div className="card">
            <h3>Commercial Supply</h3>
            <p>
              Recurring supply support for pool service companies, apartments,
              and commercial operators.
            </p>
          </div>

          <div id="parts" className="card">
            <h3>Hard-to-Find Parts</h3>
            <p>
              Manufacturer-backed sourcing for valves, filters, and specialty
              equipment.
            </p>
          </div>
        </div>
      </section>

      <section id="commercial" className="band">
        <div className="section split">
          <div className="panel">
            <div className="eyebrow">Operational upgrade path</div>
            <h2>From pool supply store to managed supply partner.</h2>
            <p>
              Inventory visibility, assisted ordering, TankScan and Aqua Alert
              integration, and route-aware delivery planning.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <strong>1. Clarify the business</strong>
              Separate retail, commercial, and delivery.
            </div>

            <div className="step">
              <strong>2. Capture demand</strong>
              Orders, alerts, and customer needs in one system.
            </div>

            <div className="step">
              <strong>3. Govern fulfillment</strong>
              Only execute when inventory and demand are valid.
            </div>

            <div className="step">
              <strong>4. Scale operations</strong>
              Add routing, trucks, and inventory automation.
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="contact">
          <div>
            <h2>Need supplies or a hard-to-find part?</h2>
            <p>{contact.address}</p>
            <p>{contact.email}</p>
          </div>

          <a
            className="button buttonPrimary"
            href={`mailto:${contact.email}`}
          >
            Email Big Tex
          </a>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Big Tex Pool Supplies. Houston, Texas.
      </footer>
    </main>
  );
}
