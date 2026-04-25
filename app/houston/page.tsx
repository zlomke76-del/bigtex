import type { Metadata } from "next";
import Link from "next/link";
import { seoPages, siteUrl } from "../seo-content";
import styles from "../components/SeoProblemPage.module.css";

export const metadata: Metadata = {
  title: "Houston Pool Supply Help | Big Tex Pool Supplies",
  description:
    "Houston pool supply help for parts, chemicals, commercial routes, delivery, and hard-to-find pool equipment needs.",
  alternates: {
    canonical: `${siteUrl()}/houston`,
  },
};

function categoryLabel(category: string) {
  if (category === "commercial") return "Commercial Express";
  if (category === "chemicals") return "Water / Chemicals";
  if (category === "equipment") return "Equipment Parts";
  return "Parts Help";
}

export default function HoustonHubPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link className={styles.backLink} href="/">
            ← Back to Big Tex Pool Supplies
          </Link>
          <div className={styles.eyebrow}>Houston pool supply help</div>
          <h1>Pool parts, chemicals, delivery, and commercial supply support in Houston.</h1>
          <p className={styles.intro}>
            Browse common pool supply problems, then use Big Tex Part Finder or Commercial Express to send a photo,
            describe the issue, and get a verified path before buying.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.buttonPrimary} href="/#contact">
              Start Intake
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.related} style={{ paddingTop: 56 }}>
        <div className={styles.relatedInner}>
          <h2>Houston pool supply topics</h2>
          <div className={styles.relatedGrid}>
            {seoPages.map((page) => (
              <Link className={styles.relatedCard} key={page.slug} href={`/houston/${page.slug}`}>
                <span>{categoryLabel(page.category)}</span>
                <strong>{page.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
