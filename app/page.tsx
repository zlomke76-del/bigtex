// page.tsx
// (same as previous but with mobile CTA added at bottom)

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
          <a className="logo" href="#top">
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

      <section id="supplies" className="section sectionElevated">
        <div className="sectionHeader">
          <h2>Clear supply paths. No guesswork.</h2>
        </div>

        <div className="lanes">

          <div className="lane">
            <div className="laneMedia">
              <img src="/images/residential_pool_01.png" />
            </div>
            <h3>Get what you need. Fast.</h3>
          </div>

          <div className="lane highlight">
            <div className="laneMedia">
              <video autoPlay muted loop playsInline>
                <source src="/video/delivery_01.mp4" />
              </video>
            </div>
            <h3>Keep routes moving.</h3>
          </div>

          <div className="lane">
            <div className="laneMedia">
              <img src="/images/speciality_parts_01.png" />
            </div>
            <h3>Find what others can’t.</h3>
          </div>

        </div>
      </section>

      <div className="mobileCTA">
        <a href="tel:8328599678">Call Big Tex</a>
      </div>
    </main>
  );
}
