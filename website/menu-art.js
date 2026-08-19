/* ============================================================
   SWEET SNOW — ILLUSTRATION KIT
   ------------------------------------------------------------
   Every piece of food art on the site is drawn here as SVG, so
   it stays sharp at any size and needs no image files.

   The structure: one bowl (or cup) is drawn once, and each
   flavor supplies a different topping "cap" that gets clipped
   to the snow mound. Adding a flavor to menu-2026-august.js without
   adding a cap here just yields a plain white snow bowl.
   ============================================================ */

window.MENU_ART = (function () {
  "use strict";

  const INK = "#2B2620";

  // clipPath ids must be unique per document, or bowls inherit
  // each other's clip regions and render as slivers.
  let seq = 0;
  const uid = () => "a" + (seq++).toString(36);

  /* ---------------- silhouettes ---------------- */

  const MOUND = "M18 84 Q20 53 41 34 Q57 20 70 18 Q83 20 99 34 Q120 53 122 84 Z";
  const BOWL  = "M13 84 Q17 114 38 138 Q44 149 56 152 L84 152 Q96 149 102 138 Q123 114 127 84 Z";
  const SPILL = "M12 80 Q21 93 30 80 Q39 93 48 80 Q57 93 66 80 Q75 93 84 80 Q93 93 102 80 Q111 93 120 80 Q125 87 128 80 L128 74 L12 74 Z";

  const CUP_MOUND = "M26 76 Q28 48 47 32 Q62 20 70 18 Q78 20 93 32 Q112 48 114 76 Z";
  const CUP_BODY  = "M24 76 L38 150 Q41 158 50 158 L90 158 Q99 158 102 150 L116 76 Z";
  const CUP_SPILL = "M23 74 Q31 86 39 74 Q47 86 55 74 Q63 86 71 74 Q79 86 87 74 Q95 86 103 74 Q110 84 117 74 L117 68 L23 68 Z";

  /* ---------------- topping primitives ---------------- */

  const slice = (x, y, rot, f = "#E8465A", inner = "#FBA6B4") =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <path d="M0 -11 Q8.5 -10 7.5 0 Q5.5 9.5 0 12 Q-5.5 9.5 -7.5 0 Q-8.5 -10 0 -11 Z"
         fill="${f}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
       <path d="M0 -6.5 Q4 -5.5 3.4 0 Q2.4 5.5 0 7 Q-2.4 5.5 -3.4 0 Q-4 -5.5 0 -6.5 Z" fill="${inner}"/>
     </g>`;

  const cubeT = (x, y, s, f, rot = 0) =>
    `<rect x="${x - s}" y="${y - s}" width="${s * 2}" height="${s * 2}" rx="2.6" fill="${f}"
       stroke="${INK}" stroke-width="2.4" transform="rotate(${rot} ${x} ${y})"/>`;

  const ballT = (x, y, r, f) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${INK}" stroke-width="2.4"/>`;

  const mochi = (x, y, r = 6.5) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFDF4" stroke="${INK}" stroke-width="2.4"/>`;

  const dot = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;

  // Irregular toasted flake — reads as Corn Flakes, not a corn cube.
  const flake = (x, y, rot, f = "#E8B54A") =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <path d="M-10 -1 Q-8 -6 -2 -5.5 Q4 -7 9 -2 Q11 2 6 5 Q0 6.5 -6 4 Q-11 2 -10 -1 Z"
         fill="${f}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M-4 -1 Q1 -2.5 5 1" fill="none" stroke="#C48A28" stroke-width="1.2"
         stroke-linecap="round" opacity="0.75"/>
     </g>`;

  // A regular Oreo sandwich seen from the side: two wafers with a
  // cream filling that actually peeks out between them.
  const oreoCookie = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <ellipse cx="0" cy="11" rx="16" ry="5.6" fill="#2E2C2A" stroke="${INK}" stroke-width="2.6"/>
       <ellipse cx="0" cy="5.5" rx="15" ry="4.4" fill="#FFF8EC" stroke="${INK}" stroke-width="2.4"/>
       <ellipse cx="0" cy="0" rx="16" ry="5.6" fill="#2E2C2A" stroke="${INK}" stroke-width="2.6"/>
     </g>`;

  // Powder or sauce lying over the top of the snow, white still showing below.
  const coat = (f, stroke = true) =>
    `<path d="M13 69 Q16 48 39 30 Q56 18 70 16 Q84 18 101 30 Q124 48 127 69
              Q99 57 70 57 Q41 57 13 69 Z"
       fill="${f}" ${stroke ? `stroke="${INK}" stroke-width="2.6"` : ""} stroke-linejoin="round"/>`;

  // Round frozen scoop — the ridges are the marks a hard scoop leaves.
  function iceCream(x, y, fill = "#FFF6E8", ridge = "#D4B48A") {
    const clip = uid();
    const r = 15.5;
    return `<g transform="translate(${x} ${y})">
      <defs><clipPath id="${clip}"><circle cx="0" cy="0" r="${r}"/></clipPath></defs>
      <circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="2.6"/>
      <g clip-path="url(#${clip})" fill="none" stroke="${ridge}" stroke-width="1.7" stroke-linecap="round">
        <path d="M-3 -14 Q-13 -8 -12 2 Q-9 12 2 14"/>
        <path d="M5 -13 Q-8 -6 -7 4 Q-3 13 8 12"/>
        <path d="M11 -8 Q0 -3 0 7 Q3 13 11 9"/>
        <path d="M-12 -4 Q-2 -9 8 -3"/>
      </g>
      <g clip-path="url(#${clip})">
        <ellipse cx="-5.2" cy="-6.2" rx="5.4" ry="3.3" fill="#FFFFFF" opacity="0.7"/>
        <circle cx="4.5" cy="-4" r="0.95" fill="#FFFFFF"/>
        <circle cx="-4" cy="3.5" r="0.7" fill="#FFFFFF"/>
        <circle cx="7" cy="5.5" r="0.7" fill="#FFFFFF"/>
        <circle cx="-8" cy="8" r="0.55" fill="#FFFFFF"/>
      </g>
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="${INK}" stroke-width="2.6"/>
    </g>`;
  }

  const snowDrip = (f) =>
    `<path d="M31 62 Q34 70 31 77 M53 68 Q56 75 53 81 M87 68 Q84 75 87 81 M109 62 Q106 70 109 77"
       fill="none" stroke="${f}" stroke-width="5.5" stroke-linecap="round"/>`;

  const vesselDrip = (clip, f) =>
    `<g clip-path="url(#${clip})">
       <path d="M40 90 Q42 104 39 116 M72 92 Q74 108 70 122 M102 90 Q100 102 104 112"
         fill="none" stroke="${f}" stroke-width="5" stroke-linecap="round"/>
       <circle cx="39" cy="117" r="3.2" fill="${f}"/>
       <circle cx="70" cy="123" r="3.4" fill="${f}"/>
       <circle cx="104" cy="113" r="3" fill="${f}"/>
     </g>`;

  /* ---------------- per-flavor caps ---------------- */

  const CAPS = {
    "Strawberry": {
      drip: "#E8465A",
      bits: slice(38, 48, -18) + slice(58, 34, -4) + slice(80, 35, 8) + slice(101, 50, 20)
          + slice(48, 66, -10) + slice(70, 58, 2) + slice(92, 66, 12)
          + mochi(60, 22) + mochi(78, 24)
    },
    "Mango": {
      drip: "#FFA51F",
      bits: cubeT(40, 50, 8, "#FFA51F", -10) + cubeT(58, 36, 8, "#FFB930", 6) + cubeT(80, 36, 8, "#FFA51F", -6)
          + cubeT(99, 50, 8, "#FFB930", 14) + cubeT(50, 66, 8, "#FFB930", 4) + cubeT(70, 58, 8, "#FFA51F", -12)
          + cubeT(90, 66, 8, "#FFB930", 10) + mochi(64, 22) + mochi(82, 25)
    },
    "Watermelon": {
      drip: "#F26D7E",
      bits: ballT(40, 50, 9, "#E8465A") + ballT(60, 36, 9, "#F26D7E") + ballT(81, 36, 9, "#E8465A")
          + ballT(100, 50, 9, "#F26D7E") + ballT(50, 66, 9, "#F26D7E") + ballT(71, 58, 9, "#E8465A")
          + ballT(91, 66, 9, "#F26D7E")
          + dot(40, 50, 2, INK) + dot(81, 36, 2, INK) + dot(71, 58, 2, INK) + dot(100, 50, 2, INK)
          + mochi(66, 21)
    },
    "Injeolmi": {
      coat: coat("#E5C795"),
      bits: `<path d="M48 34 Q70 22 92 34 Q94 44 70 47 Q46 44 48 34 Z" fill="#7A3B2E"
               stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
          + dot(58, 35, 2.4, "#4E241B") + dot(70, 38, 2.4, "#4E241B") + dot(81, 34, 2.4, "#4E241B")
          + mochi(44, 54) + mochi(70, 60) + mochi(96, 54)
          + dot(30, 62, 2.6, "#C98A4B") + dot(110, 62, 2.6, "#C98A4B")
    },
    "Black Sesame": {
      coat: coat("#6F655B"),
      bits: `<path d="M52 36 Q64 28 76 36 Q78 44 64 46 Q50 44 52 36 Z" fill="#7A3B2E"
               stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
          + ballT(40, 58, 6.5, "#7A3B2E") + ballT(100, 56, 6, "#7A3B2E")
          + ballT(88, 66, 5, "#8B3A2A")
          + mochi(46, 48) + mochi(94, 42)
          + dot(36, 54, 2.6, "#1E1B18") + dot(58, 56, 2.6, "#1E1B18") + dot(82, 56, 2.6, "#1E1B18")
          + dot(104, 48, 2.6, "#1E1B18") + dot(70, 50, 2.4, "#1E1B18")
          + dot(50, 30, 2.2, "#EFEAE2") + dot(90, 30, 2.2, "#EFEAE2")
    },
    "Oreo": {
      coat: coat("#7A4A32"),
      drip: "#4A3A30",
      // Cookie sits on top of the powder so it still reads as an Oreo.
      // Crumbs around it are unclipped so they scatter off the peak too.
      crown: oreoCookie(70, 16, -22)
          + cubeT(48, 26, 3.2, "#2E2C2A", 28) + cubeT(90, 24, 3.6, "#2E2C2A", -18)
          + ballT(56, 20, 2.6, "#2E2C2A") + ballT(86, 30, 2.8, "#2E2C2A")
          + cubeT(62, 32, 2.8, "#FFF8EC", 12),
      bits: cubeT(32, 48, 3.6, "#2E2C2A", 22) + cubeT(44, 36, 4, "#2E2C2A", -16)
          + cubeT(58, 50, 3.4, "#2E2C2A", 8) + cubeT(72, 38, 4.2, "#2E2C2A", -24)
          + cubeT(86, 46, 3.6, "#2E2C2A", 18) + cubeT(100, 34, 4, "#2E2C2A", -10)
          + cubeT(108, 52, 3.4, "#2E2C2A", 30) + cubeT(38, 62, 3.8, "#2E2C2A", -22)
          + cubeT(54, 68, 3.2, "#2E2C2A", 14) + cubeT(70, 60, 4, "#2E2C2A", -8)
          + cubeT(88, 66, 3.4, "#2E2C2A", 20) + cubeT(102, 62, 3.6, "#2E2C2A", -28)
          + ballT(36, 54, 2.6, "#2E2C2A") + ballT(50, 44, 2.4, "#2E2C2A")
          + ballT(66, 54, 2.8, "#2E2C2A") + ballT(82, 36, 2.4, "#2E2C2A")
          + ballT(96, 56, 2.6, "#2E2C2A") + ballT(112, 46, 2.4, "#2E2C2A")
          + cubeT(48, 58, 2.6, "#FFF8EC", 40) + cubeT(78, 64, 2.4, "#FFF8EC", -15)
          + mochi(42, 42, 5.5) + mochi(98, 44, 5.5)
    },
    "Sweet Corn": {
      bits: cubeT(40, 52, 5.5, "#FFC93C") + cubeT(58, 44, 5.5, "#FFD34F") + cubeT(84, 44, 5.5, "#FFD34F")
          + cubeT(100, 54, 5.5, "#FFC93C") + cubeT(50, 64, 5.5, "#FFD34F") + cubeT(92, 64, 5.5, "#FFC93C")
          + flake(46, 38, -28, "#E8B54A") + flake(70, 48, 12, "#F0C45A") + flake(94, 36, 22, "#D9A43E")
          + flake(36, 60, 8, "#F0C45A") + flake(62, 62, -18, "#E8B54A") + flake(86, 58, 30, "#D9A43E")
          + flake(108, 48, -12, "#E8B54A")
          + `<path d="M34 66 Q52 58 70 64 Q88 58 106 66" fill="none" stroke="#FFF6D8" stroke-width="4.5" stroke-linecap="round"/>`
          + mochi(70, 22),
      crown: flake(52, 24, -36, "#F0C45A") + flake(88, 26, 28, "#E8B54A")
    },
    "Lychee": {
      drip: "#F5B3C8",
      // Halved lychees read as white balls with a blush rim and a soft
      // dimple; pale jelly cubes and deep-pink popping boba around them.
      bits: ballT(40, 50, 9, "#FFF8F2") + ballT(62, 38, 9, "#FFF4EE") + ballT(86, 40, 9, "#FFF8F2")
          + ballT(102, 54, 9, "#FFF4EE") + ballT(50, 64, 9, "#FFF4EE") + ballT(74, 56, 9, "#FFF8F2")
          + `<g fill="none" stroke="#F2BECE" stroke-width="2.2" stroke-linecap="round">
               <path d="M36 47 Q40 44 44 47"/><path d="M58 35 Q62 32 66 35"/>
               <path d="M82 37 Q86 34 90 37"/><path d="M98 51 Q102 48 106 51"/>
               <path d="M46 61 Q50 58 54 61"/><path d="M70 53 Q74 50 78 53"/>
             </g>`
          + cubeT(34, 62, 4.6, "#FFD6E2", 14) + cubeT(94, 66, 4.6, "#FFD6E2", -12)
          + cubeT(112, 44, 4.2, "#FFE0EA", 20)
          + dot(44, 38, 3, "#E8608A") + dot(74, 44, 3, "#E8608A") + dot(98, 40, 3, "#E8608A")
          + dot(60, 66, 3, "#E8608A") + dot(86, 62, 3, "#E8608A") + dot(110, 58, 3, "#E8608A")
          + mochi(52, 28) + mochi(90, 28),
      // Yogurt ice cream scoop sits on the peak.
      crown: iceCream(70, 14, "#FFFDF6", "#E3CBD6")
    },
    "Cinnamon Toast": {
      coat: coat("#E8C79A"),
      bits: cubeT(42, 48, 8, "#D9A05B", 18) + cubeT(62, 36, 8, "#E8B76F", -8) + cubeT(84, 38, 8, "#D9A05B", 10)
          + cubeT(100, 52, 8, "#E8B76F", -16) + cubeT(52, 64, 8, "#E8B76F", 6) + cubeT(76, 60, 8, "#D9A05B", -12)
          + cubeT(94, 68, 8, "#E8B76F", 14) + mochi(70, 22)
    },
    "Dubai Chocolate": {
      drip: "#4A2818",
      coat: `<path d="M16 74 Q22 56 44 48 Q70 40 96 48 Q118 56 124 74 Q98 62 70 62 Q42 62 16 74 Z"
               fill="#8FBF4A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`,
      bits: cubeT(46, 50, 5, "#3A2418", -18) + cubeT(62, 42, 4.6, "#5C3A22", 14)
          + cubeT(90, 48, 4.6, "#5C3A22", 20)
          + cubeT(54, 62, 4.4, "#3A2418", 8) + cubeT(88, 62, 4.4, "#3A2418", 10)
          + `<g fill="none" stroke-linecap="round">
               <g stroke="#E8B85A" stroke-width="2.8">
                 <path d="M40 58 Q48 40 58 56"/><path d="M50 50 Q60 32 70 50"/>
                 <path d="M62 46 Q72 28 82 46"/><path d="M74 50 Q84 34 94 52"/>
                 <path d="M86 58 Q96 42 104 60"/>
               </g>
               <g stroke="#C48A32" stroke-width="2.4">
                 <path d="M44 64 Q54 48 62 64"/><path d="M58 60 Q68 44 78 60"/>
                 <path d="M72 58 Q82 42 90 62"/><path d="M48 70 Q60 56 70 70"/>
                 <path d="M68 68 Q80 54 88 70"/>
               </g>
             </g>`
          + dot(36, 70, 2.3, "#6B9A32") + dot(50, 72, 2.1, "#C4E06A")
          + dot(90, 72, 2.2, "#6B9A32") + dot(104, 70, 2.1, "#C4E06A")
          + dot(70, 68, 2, "#7FA653"),
      crown: `<g transform="translate(70 16)">
                <g fill="none" stroke-linecap="round">
                  <path d="M-22 18 Q-14 4 -4 16" stroke="#E8B85A" stroke-width="2.8"/>
                  <path d="M4 16 Q14 4 22 18" stroke="#E8B85A" stroke-width="2.8"/>
                  <path d="M-18 22 Q-8 8 2 20" stroke="#C48A32" stroke-width="2.4"/>
                  <path d="M-2 20 Q10 8 18 22" stroke="#C48A32" stroke-width="2.4"/>
                </g>
                <ellipse cx="0" cy="12" rx="15.5" ry="13.5" fill="#A97046" stroke="${INK}" stroke-width="2.6"/>
                <path d="M-13 5 Q-15 -6 0 -11 Q15 -6 13 5 L7 10 Q0 3 -7 10 Z"
                  fill="#3A2418" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M-7 8 Q-8 16 -7 20 M3 10 Q4 18 3 22 M10 7 Q11 14 10 18"
                  fill="none" stroke="#3A2418" stroke-width="2.8" stroke-linecap="round"/>
              </g>`
    }
  };

  // Cup scoops match the topping, except Black Sesame stays vanilla.
  const SCOOP = {
    "Mango":        { fill: "#FFB44A", ridge: "#E08A18" },
    "Strawberry":   { fill: "#EE7B8C", ridge: "#D45A6C" },
    "Oreo":         { fill: "#6B4534", ridge: "#4A2C22" },
    "Injeolmi":     { fill: "#E6C89A", ridge: "#C9A46A" },
    "Black Sesame": { fill: "#FFF6E8", ridge: "#D4B48A" }
  };

  // Soft background circle behind each bowl, tinted to the flavor.
  const HALO = {
    "Mango": "#FFF0CC", "Strawberry": "#FFE3E8", "Oreo": "#ECE8E2",
    "Injeolmi": "#F6EAD2", "Black Sesame": "#E9E5DE", "Watermelon": "#FFE0E2",
    "Sweet Corn": "#FFF1C4", "Lychee": "#FCE4EE", "Dubai Chocolate": "#E8F0C8"
  };

  /* ---------------- vessels ---------------- */

  // The flared tin bowl, snow piled above the rim.
  function bowl(flavor) {
    const cfg = CAPS[flavor] || {};
    const m = uid(), b = uid();
    return `<svg class="art-svg" viewBox="0 0 140 162" role="img" aria-label="${flavor} bingsu">
      <defs>
        <clipPath id="${m}"><path d="${MOUND}"/></clipPath>
        <clipPath id="${b}"><path d="${BOWL}"/></clipPath>
      </defs>
      <path d="${MOUND}" fill="#FFFFFF" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${m})">
        ${cfg.coat || ""}
        ${cfg.drip ? snowDrip(cfg.drip) : ""}
        ${cfg.bits || ""}
      </g>
      <path d="${MOUND}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="${BOWL}" fill="#DCDFDC" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${b})">
        <path d="M36 104 Q46 132 58 146" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.6"/>
        <path d="M104 104 Q96 130 86 145" fill="none" stroke="${INK}" stroke-width="4" opacity="0.10"/>
      </g>
      <path d="${SPILL}" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${cfg.drip ? vesselDrip(b, cfg.drip) : ""}
      ${cfg.crown || ""}
    </svg>`;
  }

  // The takeaway cup, same topping caps clipped to a narrower mound.
  // Every cup gets a frozen scoop on the peak; flavor toppings stay as they are.
  function cup(flavor) {
    const cfg = CAPS[flavor] || {};
    const m = uid(), b = uid();
    return `<svg class="art-svg" viewBox="0 -8 140 176" role="img" aria-label="${flavor} cup bingsu">
      <defs>
        <clipPath id="${m}"><path d="${CUP_MOUND}"/></clipPath>
        <clipPath id="${b}"><path d="${CUP_BODY}"/></clipPath>
      </defs>
      <path d="${CUP_MOUND}" fill="#FFFFFF" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${m})">
        ${cfg.coat || ""}
        ${cfg.drip ? snowDrip(cfg.drip) : ""}
        ${cfg.bits || ""}
      </g>
      <path d="${CUP_MOUND}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="${CUP_BODY}" fill="#F7FBFE" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${b})">
        <path d="M40 92 L50 152" fill="none" stroke="#FFFFFF" stroke-width="6" opacity="0.9"/>
        <path d="M100 92 L92 152" fill="none" stroke="${INK}" stroke-width="4" opacity="0.08"/>
        <path d="M24 118 L116 118" fill="none" stroke="#A9DCF5" stroke-width="7" opacity="0.55"/>
      </g>
      <path d="${CUP_SPILL}" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${cfg.drip ? vesselDrip(b, cfg.drip) : ""}
      ${cfg.crown || ""}
      ${iceCream(70, 8, (SCOOP[flavor] || {}).fill, (SCOOP[flavor] || {}).ridge)}
    </svg>`;
  }

  // Dashed placeholder for the flavor we haven't announced yet.
  function ghost() {
    return `<svg class="art-svg" viewBox="0 0 140 162" aria-hidden="true">
      <path d="${MOUND}" fill="none" stroke="#D8CFBB" stroke-width="3.4" stroke-dasharray="10 9"/>
      <path d="${BOWL}" fill="none" stroke="#D8CFBB" stroke-width="3.4" stroke-dasharray="10 9"/>
    </svg>`;
  }

  /* ---------------- taiyaki + cookie ---------------- */

  const FISH_BODY = "M14 50 Q16 20 58 14 Q112 6 142 28 L176 10 Q184 30 177 50 Q184 70 176 90 L142 72 Q112 94 58 86 Q16 80 14 50 Z";

  function fishBase(fill, extra, label) {
    const c = uid();
    return `<svg class="art-svg" viewBox="0 0 210 100" role="img" aria-label="${label}">
      <defs><clipPath id="${c}"><path d="${FISH_BODY}"/></clipPath></defs>
      <path d="${FISH_BODY}" fill="${fill}" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
      <g clip-path="url(#${c})" stroke="${INK}" stroke-width="2" opacity="0.45">
        <path d="M60 0 L130 100 M84 0 L154 100 M108 0 L178 100" fill="none"/>
        <path d="M130 0 L60 100 M154 0 L84 100 M178 0 L108 100" fill="none"/>
      </g>
      ${extra || ""}
      <circle cx="44" cy="40" r="4.6" fill="${INK}"/>
      <path d="M30 56 Q38 62 48 58" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  const fish = () => fishBase("#F5CB84", "", "Taiyaki");

  const iceFish = () => fishBase("#F5CB84",
    `<circle cx="70" cy="16" r="17" fill="#FFFDF4" stroke="${INK}" stroke-width="3"/>
     <path d="M56 20 Q70 30 84 20" fill="none" stroke="${INK}" stroke-width="2.4"/>`,
    "Taiyaki ice cream");

  const dubaiFish = () => fishBase("#C98A4B",
    `<path d="M56 22 Q96 12 138 30 Q120 44 96 40 Q74 38 56 22 Z" fill="#7FA653" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
     <circle cx="78" cy="28" r="3" fill="#5B3A21"/><circle cx="104" cy="32" r="3" fill="#5B3A21"/>`,
    "Dubai taiyaki");

  const cookie = () => `<svg class="art-svg" viewBox="0 0 210 126" role="img" aria-label="Dubai chewy cookie">
    <g stroke="${INK}" stroke-width="3.6" stroke-linejoin="round">
      <path d="M9 69 Q7 33 31 19 Q55 7 79 19 Q101 31 100 69 Q99 103 77 111 Q55 119 33 111 Q10 103 9 69 Z" fill="#CB9C5F"/>
      <path d="M31 19 Q55 7 79 19 Q92 27 97 41 Q74 30 52 33 Q38 35 24 43 Q26 28 31 19 Z" fill="#A6763F"/>
      <path d="M19 68 Q18 38 37 26 Q55 18 73 26 Q92 38 91 68 Q90 97 73 104 Q55 111 37 104 Q20 97 19 68 Z"
            fill="#B5C65A" stroke-width="3"/>
      <path d="M110 69 Q109 31 131 19 Q155 7 179 19 Q203 33 201 69 Q200 103 177 111 Q155 119 133 111 Q111 103 110 69 Z" fill="#CB9C5F"/>
      <path d="M131 19 Q155 7 179 19 Q193 28 199 43 Q175 31 152 34 Q138 36 124 44 Q126 28 131 19 Z" fill="#A6763F"/>
      <path d="M120 68 Q119 38 136 26 Q155 18 172 26 Q192 38 191 68 Q190 97 172 104 Q155 111 136 104 Q121 97 120 68 Z"
            fill="#B5C65A" stroke-width="3"/>
    </g>
    <g fill="#7C9435">
      <circle cx="40" cy="50" r="3.2"/><circle cx="63" cy="44" r="2.7"/><circle cx="55" cy="70" r="3.1"/>
      <circle cx="34" cy="82" r="2.5"/><circle cx="76" cy="78" r="2.9"/><circle cx="61" cy="94" r="2.3"/>
      <circle cx="50" cy="58" r="2.3"/><circle cx="72" cy="60" r="2.5"/><circle cx="42" cy="68" r="2.1"/>
      <circle cx="140" cy="48" r="2.9"/><circle cx="164" cy="46" r="3.2"/><circle cx="153" cy="70" r="2.7"/>
      <circle cx="133" cy="80" r="2.5"/><circle cx="176" cy="76" r="2.9"/><circle cx="159" cy="95" r="2.3"/>
      <circle cx="146" cy="60" r="2.4"/><circle cx="170" cy="62" r="2.3"/><circle cx="137" cy="66" r="2.1"/>
    </g>
  </svg>`;

  return { bowl, cup, ghost, fish, iceFish, dubaiFish, cookie, halo: (n) => HALO[n] || "#F5EFDC", CAPS, HALO };
})();
