import type { Metadata } from "next";
import Link from "next/link";
import { seoPages, siteUrl } from "../seo-content";

export const metadata: Metadata = {
  title: "Houston Pool Supply Help | Big Tex Pool Supplies",
  description:
    "Get help with Houston pool parts, chemicals, equipment issues, water problems, and commercial pool supply support from Big Tex Pool Supplies.",
  alternates: {
    canonical: `${siteUrl()}/houston`,
  },
  openGraph: {
    title: "Houston Pool Supply Help | Big Tex Pool Supplies",
    description:
      "Find Houston pool supply help for parts, chemicals, equipment issues, water problems, and commercial operators.",
    url: `${siteUrl()}/houston`,
    type: "website",
    locale: "en_US",
    siteName: "Big Tex Pool Supplies",
  },
};

export default function HoustonHubPage() {
  return (
    <main>
      <section style={{ padding: "72px 22px", maxWidth: 1120, margin: "0 auto" }}>
        <p
          style={{
            color: "#174ea6",
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: "0 0 12px",
          }}
        >
          Houston pool supply help
        </p>

        <h1
          style={{
            color: "#0b1f4d",
            fontSize: "clamp(40px, 6vw, 68px)",
            lineHeight: 0.95,
            letterSpacing: "-0.06em",
            margin: "0 0 18px",
            maxWidth: 860,
          }}
        >
          Pool parts, chemicals, and supply support in Houston.
        </h1>

        <p
          style={{
            color: "#5f6b7a",
            fontSize: 20,
            lineHeight: 1.6,
            maxWidth: 820,
            margin: "0 0 34px",
          }}
        >
          Big Tex Pool Supplies helps Houston homeowners, service routes, and
          commercial operators identify parts, solve water issues, and keep pool
          operations moving.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {seoPages.map((page) => (
            <Link
              key={page.slug}
              href={`/houston/${page.slug}`}
              style={{
                display: "block",
                padding: 24,
                background: "#ffffff",
                border: "1px solid #d9e4f2",
                borderRadius: 22,
                boxShadow: "0 16px 42px rgba(20, 38, 70, 0.07)",
              }}
            >
              <p
                style={{
                  color: "#e63946",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                }}
              >
                Pool help
              </p>

              <h2
                style={{
                  color: "#0b1f4d",
                  fontSize: 24,
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  margin: "0 0 10px",
                }}
              >
                {page.title}
              </h2>

              <p
                style={{
                  color: "#5f6b7a",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {page.description}
              </p>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <Link
            href="/#contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "15px 20px",
              color: "#ffffff",
              background: "#e63946",
              borderRadius: 14,
              fontWeight: 900,
              boxShadow: "0 16px 34px rgba(230, 57, 70, 0.25)",
            }}
          >
            Get Part Help
          </Link>
        </div>
      </section>
    </main>
  );
}
