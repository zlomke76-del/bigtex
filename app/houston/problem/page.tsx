import Link from "next/link";
import styles from "./SeoProblemPage.module.css";
import { businessInfo, SeoPage, seoPages, siteUrl } from "../seo-content";

function categoryLabel(category: SeoPage["category"]) {
  switch (category) {
    case "commercial":
      return "Commercial Express";
    case "chemicals":
      return "Water / Chemicals";
    case "equipment":
      return "Equipment Parts";
    default:
      return "Parts Help";
  }
}

export function SeoProblemPage({ page }: { page: SeoPage }) {
  const related = seoPages.filter((item) => item.slug !== page.slug).slice(0, 3);
  const url = `${siteUrl()}/houston/${page.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.description,
    url,
    provider: {
      "@type": "LocalBusiness",
      name: businessInfo.name,
      telephone: businessInfo.phone,
      email: businessInfo.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${businessInfo.addressLine1}, ${businessInfo.addressLine2}`,
        addressLocality: businessInfo.city,
        addressRegion: businessInfo.region,
        postalCode: businessInfo.postalCode,
        addressCountry: businessInfo.country,
      },
      areaServed: {
        "@type": "City",
        name: "Houston",
      },
    },
    serviceType: page.primaryIntent,
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link className={styles.backLink} href="/">
            ← Back to Big Tex Pool Supplies
          </Link>
          <div className={styles.eyebrow}>{page.eyebrow}</div>
          <h1>{page.h1}</h1>
          <p className={styles.intro}>{page.intro}</p>
          <div className={styles.heroActions}>
            <Link className={styles.buttonPrimary} href="/#contact">
              Upload Photo / Start Intake
            </Link>
            <a className={styles.buttonSecondary} href={`tel:${businessInfo.phoneHref}`}>
              Call {businessInfo.phone}
            </a>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.mainGrid}>
          <article className={styles.card}>
            <span className={styles.intent}>{categoryLabel(page.category)}</span>
            <h2>What this usually means</h2>
            <p>{page.primaryIntent}</p>
            <ul className={styles.list}>
              {page.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Common directions to check</h2>
            <ul className={styles.list}>
              {page.likelyCauses.map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Fastest next step</h2>
            <ul className={styles.list}>
              {page.whatToDo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <h2>{page.ctaTitle}</h2>
            <p>{page.ctaText}</p>
            <div className={styles.heroActions}>
              <Link className={styles.buttonPrimary} href="/#contact">
                Start Big Tex Part Finder
              </Link>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h2>How Big Tex helps</h2>
            <div className={styles.chips}>
              {page.bigTexHelps.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className={styles.sideCard}>
            <h2>Visit Big Tex</h2>
            <div className={styles.address}>
              <span>{businessInfo.addressLine1}</span>
              <span>{businessInfo.addressLine2}</span>
              <span>{businessInfo.cityStateZip}</span>
              <span>{businessInfo.phone}</span>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.related}>
        <div className={styles.relatedInner}>
          <h2>Related Houston pool supply help</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link className={styles.relatedCard} key={item.slug} href={`/houston/${item.slug}`}>
                <span>{categoryLabel(item.category)}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
