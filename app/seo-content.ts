export type SeoPage = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  primaryIntent: string;
  searchTerms: string[];
  symptoms: string[];
  likelyCauses: string[];
  whatToDo: string[];
  bigTexHelps: string[];
  ctaTitle: string;
  ctaText: string;
  category: "parts" | "chemicals" | "commercial" | "equipment";
};

export const businessInfo = {
  name: "Big Tex Pool Supplies",
  phone: "(832) 859-9678",
  phoneHref: "+18328599678",
  email: "will@bigtexpoolsupplies.com",
  addressLine1: "5829 West Sam Houston Parkway N",
  addressLine2: "Suite 1105",
  cityStateZip: "Houston, TX 77041",
  city: "Houston",
  region: "TX",
  postalCode: "77041",
  country: "US",
};

export const seoPages: SeoPage[] = [
  {
    slug: "pool-parts-houston",
    title: "Pool Parts Houston",
    metaTitle: "Pool Parts Houston | Big Tex Pool Supplies",
    description:
      "Need pool parts in Houston? Big Tex helps identify valves, fittings, baskets, seals, pumps, cleaner parts, and hard-to-find replacements fast.",
    eyebrow: "Houston pool parts",
    h1: "Need pool parts in Houston? Send it, describe it, or bring it in.",
    intro:
      "Pool parts are often hard to identify by name. Big Tex helps homeowners, service techs, and commercial operators narrow the right part before money is wasted on the wrong fit.",
    primaryIntent: "Find or identify a pool part in Houston.",
    searchTerms: ["pool parts Houston", "pool replacement parts Houston", "pool valve parts Houston", "pool cleaner parts Houston"],
    symptoms: ["Broken valve, fitting, basket, seal, gasket, or cleaner part", "Unknown part name or missing model number", "Wrong replacement part purchased before", "Pool route or repair delayed by one missing part"],
    likelyCauses: ["Brand-specific replacement part", "Different pipe size, fitting style, or seal type", "Obsolete or hard-to-source part", "Equipment label or model number needed for confirmation"],
    whatToDo: ["Take a close photo of the part", "Include any visible numbers, labels, or brand markings", "Show connection points or where the part installs", "Submit the request or call Big Tex to verify before buying"],
    bigTexHelps: ["Part identification", "Hard-to-find sourcing", "Commercial route support", "Pickup or delivery coordination"],
    ctaTitle: "Not sure what part you need?",
    ctaText: "Upload a photo through Big Tex Part Finder and get a verified path before buying.",
    category: "parts",
  },
  {
    slug: "pool-pump-not-starting-houston",
    title: "Pool Pump Not Starting Houston",
    metaTitle: "Pool Pump Not Starting in Houston | Big Tex Pool Supplies",
    description:
      "Pool pump humming, not starting, or losing power? Big Tex helps Houston pool owners and service teams narrow pump-side parts and next steps.",
    eyebrow: "Pump-side help",
    h1: "Pool pump humming or not starting? Narrow the part before replacing the wrong thing.",
    intro:
      "A pump problem can stop circulation and throw the whole pool off. The fastest path is a photo of the pump, label, capacitor area, lid, basket, seal, or failed part so the replacement path can be confirmed.",
    primaryIntent: "Diagnose likely pump-side supply or replacement part need.",
    searchTerms: ["pool pump humming not starting Houston", "pool pump capacitor Houston", "pool pump parts Houston", "pool motor parts Houston"],
    symptoms: ["Pump hums but does not start", "Pump starts then stops", "Pump basket or lid issue", "Visible pump leak or failed seal", "Motor or capacitor suspected"],
    likelyCauses: ["Capacitor or motor issue", "Pump lid, basket, or seal mismatch", "Blocked flow or suction issue", "Model-specific replacement part required"],
    whatToDo: ["Photograph the pump label", "Photograph the failed part or capacitor area if accessible", "Include the pump brand and model if visible", "Submit the request or call Big Tex before buying parts"],
    bigTexHelps: ["Pump-side part narrowing", "Replacement part sourcing", "Fast verification", "Pickup or delivery support"],
    ctaTitle: "Need the pump part fast?",
    ctaText: "Send a photo and note. Big Tex will narrow the likely direction and help verify the exact part path.",
    category: "equipment",
  },
  {
    slug: "green-cloudy-pool-water-houston",
    title: "Green or Cloudy Pool Water Houston",
    metaTitle: "Green or Cloudy Pool Water Houston | Big Tex Pool Supplies",
    description:
      "Green, cloudy, yellow, or off-color pool water in Houston? Big Tex helps identify the likely chemical supply path and next step.",
    eyebrow: "Water and chemical guidance",
    h1: "Green or cloudy pool water? A photo can help narrow the chemical path.",
    intro:
      "Water color tells a story. A photo of green, cloudy, yellow, brown, or off-color water—plus any test readings—helps Big Tex point you toward the right chemical supply path faster.",
    primaryIntent: "Identify likely water condition and chemical supply need.",
    searchTerms: ["green pool water Houston", "cloudy pool water Houston", "pool chemicals Houston", "pool shock Houston"],
    symptoms: ["Green or algae-colored water", "Cloudy or hazy water", "Yellow, brown, or off-color water", "Water still looks bad after chemicals", "Commercial pool needs fast recovery"],
    likelyCauses: ["Algae pressure", "Low sanitizer or imbalance", "Filter or circulation issue", "Metal or contaminant condition", "Chemical program needs confirmation"],
    whatToDo: ["Take a clear photo of the water", "Add current test strip or chemical readings if available", "Note whether the pool is residential, HOA, hotel, or route account", "Submit the request before buying chemicals blindly"],
    bigTexHelps: ["Water condition intake", "Chemical supply guidance", "Commercial chemical support", "Pickup or delivery coordination"],
    ctaTitle: "Not sure what chemical to buy?",
    ctaText: "Upload a water photo and any readings. Big Tex will help narrow the product path.",
    category: "chemicals",
  },
  {
    slug: "pool-valve-fitting-replacement-houston",
    title: "Pool Valve and Fitting Replacement Houston",
    metaTitle: "Pool Valve & Fitting Replacement Houston | Big Tex Pool Supplies",
    description:
      "Need a pool valve, fitting, seal, or gasket in Houston? Big Tex helps identify the right replacement path before you buy.",
    eyebrow: "Valves, fittings, seals",
    h1: "Pool valve, fitting, seal, or gasket problem? Send a photo before guessing.",
    intro:
      "Small parts can stop a pool repair cold. A close photo of the part, connection points, pipe size, label, or visible number helps avoid wrong-fit purchases.",
    primaryIntent: "Find or verify a valve, fitting, seal, or gasket replacement.",
    searchTerms: ["pool valve replacement Houston", "pool fitting Houston", "pool gasket Houston", "pool seal parts Houston"],
    symptoms: ["Leaking valve or fitting", "Cracked union, seal, gasket, or lid", "Unknown pipe size or connection type", "Need exact match before a route can continue"],
    likelyCauses: ["Wrong fitting size", "Brand-specific valve rebuild kit", "Worn gasket or seal", "Obsolete component needing sourcing"],
    whatToDo: ["Photograph the whole part", "Photograph connection points from multiple angles", "Include any visible numbers or brand markings", "Call or submit intake before buying"],
    bigTexHelps: ["Valve and fitting identification", "Seal and gasket sourcing", "Commercial route support", "Fast replacement path"],
    ctaTitle: "Need the exact fit?",
    ctaText: "Use Big Tex Part Finder to send a photo and confirm the right direction before buying.",
    category: "parts",
  },
  {
    slug: "commercial-pool-chemical-supply-houston",
    title: "Commercial Pool Chemical Supply Houston",
    metaTitle: "Commercial Pool Chemical Supply Houston | Big Tex Pool Supplies",
    description:
      "Commercial pool chemical supply in Houston for service routes, apartments, HOAs, hotels, and operators who need reliable fulfillment.",
    eyebrow: "Commercial Express",
    h1: "Commercial pool chemical supply built to keep routes moving.",
    intro:
      "For pool service companies, apartments, HOAs, hotels, and operators, chemical supply is not a one-off purchase. It is operational continuity. Big Tex Commercial Express helps route teams and properties get chemicals, parts, and delivery support faster.",
    primaryIntent: "Start commercial supply support for chemicals, delivery, and route needs.",
    searchTerms: ["commercial pool chemicals Houston", "pool service chemical supplier Houston", "pool route chemical supply Houston", "HOA pool chemicals Houston"],
    symptoms: ["Service route needs chemicals today", "Property pool cannot go down", "Bulk chemical supply needs coordination", "Need delivery, pickup, or recurring supply support"],
    likelyCauses: ["Recurring route demand", "Stockout or vendor delay", "Seasonal chemical pressure", "Property compliance or uptime requirement"],
    whatToDo: ["Select Commercial Express", "Include company or property name", "Add number of pools or properties if available", "Submit supply need, timing, and delivery preference"],
    bigTexHelps: ["Chemical supply support", "Route fulfillment", "Commercial delivery coordination", "Recurring account setup"],
    ctaTitle: "Need commercial supply support?",
    ctaText: "Use Commercial Express to send route, chemical, delivery, or recurring supply needs directly to Big Tex.",
    category: "commercial",
  },
  {
    slug: "pool-service-route-supply-houston",
    title: "Pool Service Route Supply Houston",
    metaTitle: "Pool Service Route Supply Houston | Big Tex Pool Supplies",
    description:
      "Pool service route supply support in Houston for chemicals, parts, delivery, emergency fulfillment, and hard-to-find items.",
    eyebrow: "Route support",
    h1: "Pool service route behind? Big Tex helps keep supplies moving.",
    intro:
      "When a route is moving, delays cost time and money. Commercial Express is built for service teams that need chemicals, parts, sourcing, pickup, or delivery support without chasing multiple vendors.",
    primaryIntent: "Support pool service routes with fast supply and sourcing help.",
    searchTerms: ["pool service supply Houston", "pool route supply Houston", "pool service parts Houston", "pool supply delivery Houston"],
    symptoms: ["Route delayed by missing item", "Need chemicals or parts today", "Multiple stops need the same supply", "Commercial customer needs pool operational fast"],
    likelyCauses: ["Stockout", "Wrong part on truck", "Chemical demand spike", "Delivery coordination needed"],
    whatToDo: ["Choose Commercial Express", "Add route timing and supply need", "Include pickup or delivery preference", "Submit request or call for urgent confirmation"],
    bigTexHelps: ["Route support", "Chemical supply", "Hard-to-find parts", "Delivery and pickup coordination"],
    ctaTitle: "Keep the route moving.",
    ctaText: "Send route supply needs through Commercial Express so Big Tex can help coordinate the fastest practical path.",
    category: "commercial",
  },
  {
    slug: "hard-to-find-pool-parts-houston",
    title: "Hard-to-Find Pool Parts Houston",
    metaTitle: "Hard-to-Find Pool Parts Houston | Big Tex Pool Supplies",
    description:
      "Looking for hard-to-find pool parts in Houston? Big Tex helps identify, source, and verify parts before you buy.",
    eyebrow: "Specialty sourcing",
    h1: "Hard-to-find pool parts are easier when you can show the problem.",
    intro:
      "Some parts are difficult to describe, discontinued, brand-specific, or easy to confuse with similar pieces. Big Tex helps narrow the right sourcing path from photos, labels, and equipment context.",
    primaryIntent: "Source or verify hard-to-find pool parts.",
    searchTerms: ["hard to find pool parts Houston", "specialty pool parts Houston", "obsolete pool parts Houston", "pool parts sourcing Houston"],
    symptoms: ["Unknown part name", "Old equipment", "Similar-looking parts online", "Repair delayed because part cannot be found"],
    likelyCauses: ["Discontinued or obscure replacement", "Brand-specific assembly", "Missing model information", "Exact sizing required"],
    whatToDo: ["Send photo of the part", "Send photo of equipment label", "Show where the part connects", "Include measurements if available"],
    bigTexHelps: ["Specialty sourcing", "Part narrowing", "Replacement path verification", "Commercial support"],
    ctaTitle: "Can’t find it elsewhere?",
    ctaText: "Send Big Tex a photo and details. They can help identify or source the likely path.",
    category: "parts",
  },
  {
    slug: "pool-supply-delivery-houston",
    title: "Pool Supply Delivery Houston",
    metaTitle: "Pool Supply Delivery Houston | Big Tex Pool Supplies",
    description:
      "Pool supply delivery and fulfillment coordination in Houston for chemicals, parts, commercial routes, and properties.",
    eyebrow: "Delivery and fulfillment",
    h1: "Need pool supplies delivered or staged for pickup in Houston?",
    intro:
      "For homeowners, properties, and service routes, the right supply is only useful if it arrives when needed. Big Tex helps coordinate pickup, delivery, sourcing, and fulfillment paths.",
    primaryIntent: "Coordinate pickup or delivery for pool supplies in Houston.",
    searchTerms: ["pool supply delivery Houston", "pool chemical delivery Houston", "pool parts delivery Houston", "commercial pool delivery Houston"],
    symptoms: ["Need chemicals today", "Service route cannot stop", "Property pool needs supplies fast", "Need parts or chemicals staged for pickup"],
    likelyCauses: ["Operational urgency", "Stockout", "Bulk chemical need", "Route timing pressure"],
    whatToDo: ["Select delivery / pickup", "Add timing and location context", "Include item list or photo", "Submit request for follow-up"],
    bigTexHelps: ["Delivery coordination", "Pickup support", "Commercial route supply", "Urgent fulfillment path"],
    ctaTitle: "Need supplies moving?",
    ctaText: "Send your request with timing and pickup or delivery preference.",
    category: "commercial",
  },
  {
    slug: "pool-cleaner-parts-houston",
    title: "Pool Cleaner Parts Houston",
    metaTitle: "Pool Cleaner Parts Houston | Big Tex Pool Supplies",
    description:
      "Need pool cleaner parts in Houston? Big Tex helps identify cleaner hoses, wheels, baskets, fittings, and replacement parts from photos.",
    eyebrow: "Cleaner parts",
    h1: "Pool cleaner part broke? A photo usually gets you further than a part name.",
    intro:
      "Cleaner parts can be small, brand-specific, and difficult to identify. A close photo of the broken part plus any visible brand marking helps narrow the replacement path.",
    primaryIntent: "Identify or source pool cleaner replacement parts.",
    searchTerms: ["pool cleaner parts Houston", "pool vacuum parts Houston", "pool cleaner hose Houston", "pool cleaner replacement parts"],
    symptoms: ["Cleaner stopped moving", "Broken hose, wheel, seal, or fitting", "Unknown cleaner brand or model", "Need small replacement part fast"],
    likelyCauses: ["Wear part failure", "Brand-specific cleaner component", "Wrong hose or fitting", "Missing model detail"],
    whatToDo: ["Photograph the cleaner and broken part", "Include brand marking if visible", "Show where the part attaches", "Submit intake before buying"],
    bigTexHelps: ["Cleaner part identification", "Replacement path", "Hard-to-find sourcing", "Pickup support"],
    ctaTitle: "Need the cleaner working again?",
    ctaText: "Send a photo of the cleaner part and Big Tex can help narrow the right replacement path.",
    category: "parts",
  },
  {
    slug: "pool-equipment-parts-houston",
    title: "Pool Equipment Parts Houston",
    metaTitle: "Pool Equipment Parts Houston | Big Tex Pool Supplies",
    description:
      "Pool equipment parts in Houston for pumps, filters, valves, cleaner systems, baskets, seals, and equipment pad needs.",
    eyebrow: "Equipment pad support",
    h1: "Pool equipment parts are easier to source when the equipment pad is visible.",
    intro:
      "Many equipment problems depend on how the pump, filter, valve, cleaner, and pipe system connect. A photo of the equipment pad helps Big Tex narrow the likely supply path.",
    primaryIntent: "Identify equipment pad parts and supply needs.",
    searchTerms: ["pool equipment parts Houston", "pool filter parts Houston", "pool pump parts Houston", "pool equipment supply Houston"],
    symptoms: ["Equipment pad leak or broken component", "Filter, valve, or pump issue", "Unknown part name", "Need part before service route can continue"],
    likelyCauses: ["Equipment-specific replacement", "Flow or pressure issue", "Valve/fitting mismatch", "Pump, filter, or cleaner-side component need"],
    whatToDo: ["Take a wide photo of the equipment pad", "Take close-ups of the problem area", "Include labels or model numbers", "Submit request for verification"],
    bigTexHelps: ["Equipment part narrowing", "Commercial supply support", "Specialty sourcing", "Fulfillment coordination"],
    ctaTitle: "Not sure what equipment part you need?",
    ctaText: "Upload equipment photos and Big Tex will help narrow the likely direction.",
    category: "equipment",
  },
];

export function getSeoPage(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://bigtex.vercel.app";
}
