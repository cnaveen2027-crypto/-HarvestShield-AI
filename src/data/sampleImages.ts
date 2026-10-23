import { CropType } from "../types";

export interface SampleProduceImage {
  id: string;
  name: string;
  crop: CropType;
  conditionDescription: string;
  expectedRisk: "Low" | "Medium" | "High";
  dataUri: string;
}

// Generate crisp, recognizable SVG-based produce representations as data URIs
function createProduceSvgDataUri(
  title: string,
  svgContent: string,
  bgColor: string = "#f1f5f9"
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgColor}"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect width="600" height="450" fill="url(#bgGrad)"/>
    <g transform="translate(300, 220)">
      ${svgContent}
    </g>
    <rect x="20" y="20" width="220" height="34" rx="8" fill="#0f172a" fill-opacity="0.75"/>
    <text x="32" y="42" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="600">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRODUCE_IMAGES: SampleProduceImage[] = [
  {
    id: "sample-tomato-bruised",
    name: "Tomato (Bruised & Softening)",
    crop: "Tomato",
    conditionDescription: "Visible blossom-end softening, dark skin depression, and hairline cuticle tear. Early post-harvest mechanical damage.",
    expectedRisk: "High",
    dataUri: createProduceSvgDataUri(
      "Tomato: Severe Bruising & Cut",
      `
      <!-- Tomato Body -->
      <circle cx="0" cy="10" r="130" fill="#dc2626" filter="url(#shadow)"/>
      <ellipse cx="-40" cy="-30" rx="40" ry="25" fill="#f87171" opacity="0.6"/>
      <!-- Soft sunken bruise -->
      <path d="M 30,30 Q 70,20 80,60 Q 75,100 35,90 Q 5,70 30,30 Z" fill="#7f1d1d" opacity="0.85"/>
      <ellipse cx="55" cy="55" rx="20" ry="15" fill="#450a0a" opacity="0.9"/>
      <!-- Surface skin tear -->
      <path d="M 40,45 Q 55,50 65,40" stroke="#fecaca" stroke-width="3" fill="none"/>
      <!-- Calyx / Stem -->
      <path d="M -15,-120 Q 0,-150 10,-140 Q 5,-120 0,-115" stroke="#15803d" stroke-width="10" fill="none" stroke-linecap="round"/>
      <polygon points="0,-115 -25,-90 0,-100 25,-90" fill="#16a34a"/>
      <polygon points="0,-115 -45,-110 -15,-105" fill="#15803d"/>
      <polygon points="0,-115 45,-110 15,-105" fill="#15803d"/>
      `,
      "#fee2e2"
    )
  },
  {
    id: "sample-tomato-fresh",
    name: "Tomato (Grade A Prime Fresh)",
    crop: "Tomato",
    conditionDescription: "Firm turgid red pericarp, glossy waxy cuticle, unbroken green calyx intact, zero visible bruising.",
    expectedRisk: "Low",
    dataUri: createProduceSvgDataUri(
      "Tomato: Fresh Grade A Harvest",
      `
      <!-- Tomato Body -->
      <circle cx="0" cy="10" r="130" fill="#ef4444" filter="url(#shadow)"/>
      <!-- High gloss reflection -->
      <ellipse cx="-45" cy="-35" rx="50" ry="30" fill="#ffffff" opacity="0.4" transform="rotate(-15, -45, -35)"/>
      <ellipse cx="-20" cy="-15" rx="20" ry="10" fill="#ffffff" opacity="0.6"/>
      <!-- Calyx / Fresh green stem -->
      <path d="M -10,-120 Q 5,-155 18,-145 Q 10,-125 0,-115" stroke="#16a34a" stroke-width="10" fill="none" stroke-linecap="round"/>
      <polygon points="0,-115 -35,-95 -5,-105 0,-115" fill="#22c55e"/>
      <polygon points="0,-115 35,-95 5,-105 0,-115" fill="#22c55e"/>
      <polygon points="0,-115 -50,-125 -15,-110" fill="#15803d"/>
      <polygon points="0,-115 50,-125 15,-110" fill="#15803d"/>
      `,
      "#dcfce7"
    )
  },
  {
    id: "sample-banana-freckled",
    name: "Banana (Overripe / Senescent)",
    crop: "Banana",
    conditionDescription: "Extensive brown freckling (sugar spots), softening neck, crown browning, high ethylene release.",
    expectedRisk: "High",
    dataUri: createProduceSvgDataUri(
      "Banana: Senescent Brown Spots",
      `
      <!-- Banana Curve -->
      <path d="M -140,-80 Q 0,-30 140,-90 Q 150,0 60,90 Q -40,130 -140,50 Q -170,-10 -140,-80 Z" fill="#eab308" filter="url(#shadow)"/>
      <path d="M -140,-80 Q 0,-45 130,-90" stroke="#ca8a04" stroke-width="6" fill="none"/>
      <!-- Brown senescent spots -->
      <circle cx="-50" cy="10" r="7" fill="#713f12"/>
      <circle cx="-20" cy="40" r="9" fill="#713f12"/>
      <circle cx="20" cy="50" r="8" fill="#713f12"/>
      <circle cx="50" cy="20" r="6" fill="#713f12"/>
      <circle cx="-80" cy="-10" r="11" fill="#713f12"/>
      <circle cx="-100" cy="20" r="8" fill="#713f12"/>
      <circle cx="70" cy="-10" r="10" fill="#713f12"/>
      <!-- Softening tip -->
      <ellipse cx="140" cy="-90" rx="14" ry="10" fill="#451a03"/>
      <!-- Crown cut -->
      <path d="M -140,-80 L -165,-95 L -160,-110 L -135,-95 Z" fill="#78350f"/>
      `,
      "#fef9c3"
    )
  },
  {
    id: "sample-mango-sapburn",
    name: "Mango (Latex / Sap Stain)",
    crop: "Mango",
    conditionDescription: "Caustic latex drip marks trailing from pedicel causing black necrotic surface burn on cheek.",
    expectedRisk: "Medium",
    dataUri: createProduceSvgDataUri(
      "Mango: Stem-End Sap Stain",
      `
      <!-- Mango Shape -->
      <path d="M 0,-110 C 80,-110 130,-40 120,40 C 110,110 30,140 -40,120 C -110,100 -120,20 -100,-40 C -80,-90 -40,-110 0,-110 Z" fill="#f59e0b" filter="url(#shadow)"/>
      <path d="M -20,-70 C 40,-70 80,-20 80,40" stroke="#fbbf24" stroke-width="12" fill="none" opacity="0.6"/>
      <!-- Stem -->
      <path d="M 0,-110 Q 5,-135 15,-140" stroke="#78350f" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Caustic sap dark trail -->
      <path d="M 0,-105 Q 15,-70 10,-30 Q 5,10 20,45" stroke="#451a03" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.85"/>
      <circle cx="20" cy="45" r="14" fill="#451a03" opacity="0.9"/>
      <circle cx="10" cy="-30" r="8" fill="#451a03" opacity="0.8"/>
      `,
      "#fef3c7"
    )
  },
  {
    id: "sample-onion-softrot",
    name: "Onion (Neck Moisture Rot)",
    crop: "Onion",
    conditionDescription: "Incompletely cured thick neck with water-soaked brownish scale decay, Aspergillus black spores.",
    expectedRisk: "High",
    dataUri: createProduceSvgDataUri(
      "Onion: Neck Rot & Spores",
      `
      <!-- Onion Bulb -->
      <ellipse cx="0" cy="20" rx="120" ry="110" fill="#b45309" filter="url(#shadow)"/>
      <ellipse cx="-20" cy="20" rx="95" ry="90" fill="#d97706" opacity="0.7"/>
      <!-- Papery scale texture lines -->
      <path d="M -70,20 Q 0,110 70,20" stroke="#78350f" stroke-width="3" fill="none" opacity="0.4"/>
      <path d="M -50,-30 Q 0,70 50,-30" stroke="#78350f" stroke-width="3" fill="none" opacity="0.4"/>
      <!-- Root disc -->
      <ellipse cx="0" cy="125" rx="30" ry="10" fill="#78350f"/>
      <path d="M -15,130 L -20,150 M 0,132 L 2,155 M 15,130 L 22,148" stroke="#a16207" stroke-width="3"/>
      <!-- Uncured thick neck with rot -->
      <path d="M -30,-80 L -15,-135 L 15,-135 L 30,-80 Z" fill="#451a03"/>
      <!-- Black mold spots -->
      <circle cx="-10" cy="-85" r="8" fill="#171717"/>
      <circle cx="5" cy="-95" r="10" fill="#171717"/>
      <circle cx="12" cy="-75" r="7" fill="#171717"/>
      `,
      "#fed7aa"
    )
  },
  {
    id: "sample-potato-healthy",
    name: "Potato (Cured Seed / Table)",
    crop: "Potato",
    conditionDescription: "Smooth, firm suberized periderm skin, zero greening, dormant eyes, no fungal lesions.",
    expectedRisk: "Low",
    dataUri: createProduceSvgDataUri(
      "Potato: Well-Cured Tuber",
      `
      <!-- Potato Oval -->
      <path d="M -110,-20 C -120,-70 -50,-90 20,-80 C 90,-70 130,-20 120,40 C 110,90 40,105 -30,95 C -100,85 -100,20 -110,-20 Z" fill="#a16207" filter="url(#shadow)"/>
      <!-- Highlights and texture -->
      <ellipse cx="-20" cy="-20" rx="70" ry="40" fill="#ca8a04" opacity="0.4"/>
      <!-- Dormant eyes -->
      <path d="M -50,-30 Q -40,-25 -30,-30" stroke="#451a03" stroke-width="4" fill="none"/>
      <path d="M 30,-40 Q 40,-35 50,-40" stroke="#451a03" stroke-width="4" fill="none"/>
      <path d="M 10,25 Q 20,30 30,25" stroke="#451a03" stroke-width="4" fill="none"/>
      <path d="M -60,40 Q -50,45 -40,40" stroke="#451a03" stroke-width="4" fill="none"/>
      `,
      "#fef08a"
    )
  }
];
