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

  // Clear plastic cup — same snow + toppings as the bowl, flared
  // wider at the rim. The takeaway cup from the original kit.
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

  // Soft, flour-dusted pillows with rounded corners, distinct from fruit balls.
  const mochi = (x, y, r = 7, rotation = 0) =>
    `<g data-topping="mochi" transform="translate(${x} ${y}) rotate(${rotation})">
       <path d="M${-r} -1 Q${-r-0.7} ${-r+1} -2 ${-r} Q${r-2} ${-r-1} ${r} -3
         Q${r+1} ${r-2} 3 ${r} Q${-r+1} ${r+1} ${-r} 2 Z"
         fill="#FFFCF2" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M${-r+2} 3 Q0 ${r+1} ${r-2} 2" fill="none" stroke="#E7DCCB" stroke-width="1.7" stroke-linecap="round"/>
       <path d="M${-r+3} -2 Q-2 ${-r+2} 2 ${-r+3}" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round"/>
     </g>`;

  const dot = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;

  // Irregular toasted flake — reads as Corn Flakes, not a corn cube.
  const flake = (x, y, rot, f = "#E8B54A") =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <path d="M-10 -1 Q-8 -6 -2 -5.5 Q4 -7 9 -2 Q11 2 6 5 Q0 6.5 -6 4 Q-11 2 -10 -1 Z"
         fill="${f}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
       <path d="M-4 -1 Q1 -2.5 5 1" fill="none" stroke="#C48A28" stroke-width="1.2"
         stroke-linecap="round" opacity="0.75"/>
     </g>`;

  // Fruity Pebbles — small bright chips.
  const pebble = (x, y, rot, f) =>
    `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.2" fill="${f}" stroke="${INK}" stroke-width="2.2"
       transform="rotate(${rot} ${x} ${y})"/>`;

  // Fruit Loops — a cereal O.
  const loop = (x, y, rot, f) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="${f}" stroke="${INK}" stroke-width="2.4"/>
       <ellipse cx="0" cy="0" rx="3.1" ry="2.3" fill="#FFFDF6" stroke="${INK}" stroke-width="2"/>
     </g>`;

  const banana = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <path d="M-12 3 Q-9 -8 0 -11 Q10 -8 12 4 Q7 10 0 11 Q-8 9 -12 3 Z"
         fill="#F8D44A" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
       <path d="M-6 1 Q0 -5 7 2" fill="none" stroke="#E0B028" stroke-width="1.4" stroke-linecap="round"/>
     </g>`;

  // Glossy Korean red bean — the kidney shape that reads as 팥, not a berry.
  const pat = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
       <path d="M-8 0.4 Q-8.2 -4.8 -2.4 -5.4 Q3.6 -6.2 8 -1 Q8.3 3.5 2.6 5.2 Q-6.6 5.5 -8 0.4 Z"
         fill="#8B3228" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
       <ellipse cx="-2.2" cy="-1.3" rx="2.3" ry="1.4" fill="#D4785A" opacity="0.7"/>
     </g>`;

  const coconut = (x, y, rot, fill = "#FFFDF4") =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <ellipse cx="0" cy="0" rx="6.5" ry="2.4" fill="${fill}" stroke="${INK}" stroke-width="1.8"/>
     </g>`;

  // A translucent fruit boba and soft coconut-jelly cube keep the specials
  // readable at menu size without confusing either one with mochi.
  const poppingBoba = (x, y, r, fill) =>
    `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="2.1"/>
      <circle cx="${x - r * .28}" cy="${y - r * .3}" r="${r * .25}" fill="#FFFFFF" opacity=".75"/></g>`;
  const coconutJelly = (x, y, s, rotation = 0) =>
    `<rect x="${x-s}" y="${y-s}" width="${s*2}" height="${s*2}" rx="${s*.42}" fill="#F8F4E4"
       stroke="${INK}" stroke-width="2.1" opacity=".94" transform="rotate(${rotation} ${x} ${y})"/>`;
  const biscuitCrumb = (x, y, rotation = 0, fill = "#C4843A") =>
    `<path d="M${x-4} ${y+3} L${x-5} ${y-2} L${x-1} ${y-5} L${x+5} ${y-2} L${x+3} ${y+4} Z"
       fill="${fill}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"
       transform="rotate(${rotation} ${x} ${y})"/>`;

  const biscoff = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <rect x="-11" y="-7" width="22" height="14" rx="2.4" fill="#C4843A" stroke="${INK}" stroke-width="2.4"/>
       <path d="M-7 -2 H7 M-7 2 H7" fill="none" stroke="#8A5520" stroke-width="1.4" stroke-linecap="round"/>
     </g>`;

  // A regular Oreo sandwich seen from the side: two wafers with a
  // cream filling that actually peeks out between them.
  const oreoCookie = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <ellipse cx="0" cy="11" rx="16" ry="5.6" fill="#2E2C2A" stroke="${INK}" stroke-width="2.6"/>
       <ellipse cx="0" cy="5.5" rx="15" ry="4.4" fill="#FFF8EC" stroke="${INK}" stroke-width="2.4"/>
       <ellipse cx="0" cy="0" rx="16" ry="5.6" fill="#2E2C2A" stroke="${INK}" stroke-width="2.6"/>
     </g>`;

  // A peeled lychee half — pearly flesh, the brown seed peeking out.
  const lycheeHalf = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <circle cx="0" cy="0" r="9.5" fill="#FFF7F2" stroke="${INK}" stroke-width="2.4"/>
       <path d="M-6 -2 Q0 -8 6 -2" fill="none" stroke="#F4C7D4" stroke-width="2" stroke-linecap="round"/>
       <ellipse cx="0.5" cy="2.2" rx="3.6" ry="4.4" fill="#5A3826" stroke="${INK}" stroke-width="1.6"/>
       <ellipse cx="-0.6" cy="1" rx="1.1" ry="1.5" fill="#8A5A3E"/>
     </g>`;

  // A whole peeled lychee — white-ish ball, faint blush, seed so it
  // doesn't read as mochi.
  const lycheeBall = (x, y, r = 9.2) =>
    `<g transform="translate(${x} ${y})">
       <circle cx="0" cy="0" r="${r}" fill="#FFF9F4" stroke="${INK}" stroke-width="2.4"/>
       <circle cx="-1.4" cy="-2.2" r="${r * 0.42}" fill="#FFE8EE" opacity="0.85"/>
       <ellipse cx="1.2" cy="${r * 0.18}" rx="${r * 0.34}" ry="${r * 0.42}" fill="#5A3826" stroke="${INK}" stroke-width="1.5"/>
       <ellipse cx="0.2" cy="${r * 0.04}" rx="${r * 0.1}" ry="${r * 0.14}" fill="#8A5A3E"/>
     </g>`;

  // A whole lychee in its bumpy pink-red skin — knobbly outline so it
  // still says "lychee" at TV distance, plus a stem.
  const lycheeWhole = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">
       <path d="M0 -10.5 Q4 -12 7 -8.5 Q11.5 -7 10.5 -2 Q12 3 8.5 6.5 Q7 11 2 10.5 Q-2 12 -6 9.5
                Q-11 8 -10.5 3 Q-12 -2 -9 -6 Q-8 -11 -3 -10.5 Z"
         fill="#F06A82" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
       <g fill="#D84A66">
         <circle cx="-4.5" cy="-4" r="1.5"/><circle cx="1" cy="-6" r="1.5"/><circle cx="5.5" cy="-2" r="1.5"/>
         <circle cx="-5.5" cy="1.5" r="1.5"/><circle cx="0" cy="0.5" r="1.5"/><circle cx="4.5" cy="4.5" r="1.5"/>
         <circle cx="-2" cy="5.5" r="1.5"/>
       </g>
       <path d="M-2 -11 Q-1 -16 3 -17" fill="none" stroke="#6E8B3A" stroke-width="2.4" stroke-linecap="round"/>
       <path d="M3 -17 Q7 -18 8 -14 Q4 -13 3 -17 Z" fill="#8FB84E" stroke="${INK}" stroke-width="1.6"/>
     </g>`;

  // Powder or sauce lying over the top of the snow, white still showing below.
  const coat = (f, stroke = true) =>
    `<path d="M13 69 Q16 48 39 30 Q56 18 70 16 Q84 18 101 30 Q124 48 127 69
              Q99 57 70 57 Q41 57 13 69 Z"
       fill="${f}" ${stroke ? `stroke="${INK}" stroke-width="2.6"` : ""} stroke-linejoin="round"/>`;

  // Round frozen scoop — the ridges are the marks a hard scoop leaves.
  function iceCream(x, y, fill = "#FFF6E8", ridge = "#D4B48A", r = 15.5) {
    const clip = uid();
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

  // Thick honey — a glossy ribbon with a round bead at the end.
  const honeyDrip = (x, y1, y2) =>
    `<g>
       <path d="M${x} ${y1} Q${x + 3} ${(y1 + y2) / 2} ${x - 1} ${y2}"
         fill="none" stroke="#E8A018" stroke-width="5" stroke-linecap="round"/>
       <path d="M${x} ${y1} Q${x + 3} ${(y1 + y2) / 2} ${x - 1} ${y2}"
         fill="none" stroke="#FFD56A" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
       <ellipse cx="${x - 1}" cy="${y2 + 3}" rx="4.2" ry="5" fill="#E8A018" stroke="${INK}" stroke-width="1.8"/>
       <ellipse cx="${x - 2}" cy="${y2 + 1}" rx="1.6" ry="2" fill="#FFE08A"/>
     </g>`;

  const coffeeDrip = (x, y1, y2) =>
    `<g>
       <path d="M${x} ${y1} Q${x + 3} ${(y1 + y2) / 2} ${x - 1} ${y2}"
         fill="none" stroke="#4A2C1C" stroke-width="5" stroke-linecap="round"/>
       <path d="M${x} ${y1} Q${x + 3} ${(y1 + y2) / 2} ${x - 1} ${y2}"
         fill="none" stroke="#8B5A3A" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
       <ellipse cx="${x - 1}" cy="${y2 + 3}" rx="4.2" ry="5" fill="#4A2C1C" stroke="${INK}" stroke-width="1.8"/>
       <ellipse cx="${x - 2}" cy="${y2 + 1}" rx="1.6" ry="2" fill="#8B5A3A"/>
     </g>`;

  const creamDrip = (x, y1, y2) =>
    `<g>
       <path d="M${x} ${y1} Q${x + 3} ${(y1 + y2) / 2} ${x - 1} ${y2}"
         fill="none" stroke="#FFF8F2" stroke-width="5.5" stroke-linecap="round"/>
       <ellipse cx="${x - 1}" cy="${y2 + 3}" rx="4.4" ry="5.2" fill="#FFF8F2" stroke="${INK}" stroke-width="1.8"/>
       <ellipse cx="${x - 2}" cy="${y2 + 1}" rx="1.6" ry="2" fill="#FFFFFF"/>
     </g>`;

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
    "Bingsu de Fruta": {
      noScoop: true,
      drip: "#B63E2F",
      bits: cubeT(54, 35, 8, "#FFB93E", -12) + ballT(79, 33, 8, "#AFCF69")
        + cubeT(91, 54, 8, "#F5DC70", 12) + ballT(42, 55, 8, "#F16B77")
        + cubeT(62, 63, 8, "#FFB93E", 8) + ballT(77, 53, 8, "#F16B77")
        + ballT(101, 70, 7, "#AFCF69") + cubeT(43, 73, 7, "#F5DC70", -9)
        + '<path d="M40 48 Q65 42 97 61 M46 62 Q70 55 98 71" fill="none" stroke="#B63E2F" stroke-width="3.3" stroke-linecap="round"/>'
        + [ [53,31],[82,32],[89,52],[42,54],[61,62],[77,52] ].map(([x,y])=>dot(x,y,1.5,"#8F3928")).join(""),
      crown: '<g transform="translate(86 26) rotate(20)"><path d="M-13 0 A13 13 0 0 1 13 0 Z" fill="#C7DF83" stroke="#3F7336" stroke-width="2.5"/><path d="M0 0 L-7 -8 M0 0 V-11 M0 0 L7 -8" stroke="#FFF7CF" stroke-width="1.5"/></g>'
    },
    "Strawberry": {
      drip: "#E8465A",
      bits: slice(38, 48, -18) + slice(58, 34, -4) + slice(80, 35, 8) + slice(101, 50, 20)
          + slice(48, 66, -10) + slice(70, 58, 2) + slice(92, 66, 12)
    },
    "Strawberry Cheesecake": {
      drip: "#E8465A",
      bits: slice(36, 50, -32) + slice(54, 36, -8) + slice(76, 34, 14) + slice(98, 48, 28)
          + slice(46, 64, -18) + slice(68, 56, 6) + slice(90, 64, 20)
          + slice(26, 58, -40) + slice(114, 56, 36) + slice(70, 44, -12)
          + slice(58, 50, 22) + slice(86, 42, -24)
          + cubeT(50, 52, 5.8, "#FFF4D6", 16) + cubeT(80, 50, 5.6, "#FFE9B8", -12)
          + cubeT(64, 62, 5.4, "#FFF4D6", 22)
          + cubeT(42, 42, 2.4, "#C4843A", 22) + cubeT(74, 40, 2.2, "#A86A28", -14)
          + cubeT(92, 54, 2.4, "#C4843A", 8) + cubeT(56, 56, 2.2, "#A86A28", 28)
          + creamDrip(48, 34, 54) + creamDrip(100, 36, 52)
          + mochi(60, 22) + mochi(80, 24)
    },
    "Mango": {
      drip: "#FFA51F",
      bits: cubeT(40, 50, 8, "#FFA51F", -10) + cubeT(58, 36, 8, "#FFB930", 6) + cubeT(80, 36, 8, "#FFA51F", -6)
          + cubeT(99, 50, 8, "#FFB930", 14) + cubeT(50, 66, 8, "#FFB930", 4) + cubeT(70, 58, 8, "#FFA51F", -12)
          + cubeT(90, 66, 8, "#FFB930", 10)
          + coconut(32, 48, -24) + coconut(110, 46, 18)
          + coconut(44, 62, 8) + coconut(96, 60, -12)
          + coconut(68, 48, 22) + coconut(86, 40, -16),
      crown: coconut(50, 16, -20) + coconut(90, 18, 14) + coconut(70, 10, 8)
    },
    "Coconut Mango Yogurt": {
      coat: coat("#FFF8F2"),
      drip: "#FFB44A",
      bits: cubeT(38, 52, 7.5, "#FFA51F", -10) + cubeT(56, 40, 7.5, "#FFB930", 8)
          + cubeT(84, 38, 7.5, "#FFA51F", -6) + cubeT(102, 52, 7.5, "#FFB930", 14)
          + cubeT(48, 66, 7.2, "#FFB930", 4) + cubeT(90, 64, 7.2, "#FFA51F", -12)
          + dot(44, 46, 3.6, "#FFA51F") + dot(72, 50, 3.4, "#FFB930")
          + dot(98, 44, 3.6, "#FFA51F") + dot(58, 62, 3.2, "#FFB930")
          + coconut(32, 48, -24) + coconut(110, 46, 18)
          + coconut(40, 64, 8) + coconut(108, 62, -12)
          + coconut(68, 58, 22) + coconut(86, 46, -16),
      crown: cubeT(50, 18, 5.2, "#FFA51F", -16) + cubeT(92, 20, 4.8, "#FFB930", 12)
          + coconut(46, 28, -20) + coconut(96, 30, 14)
          + coconut(70, 12, 8)
    },
    "Watermelon": {
      drip: "#F26D7E",
      bits: ballT(40, 50, 9, "#E8465A") + ballT(60, 36, 9, "#F26D7E") + ballT(81, 36, 9, "#E8465A")
          + ballT(100, 50, 9, "#F26D7E") + ballT(50, 66, 9, "#F26D7E") + ballT(71, 58, 9, "#E8465A")
          + ballT(91, 66, 9, "#F26D7E")
          + dot(40, 50, 2, INK) + dot(81, 36, 2, INK) + dot(71, 58, 2, INK) + dot(100, 50, 2, INK)
    },
    "Melon": {
      drip: "#8FBF4A",
      bits: ballT(40, 50, 9, "#C5E86A") + ballT(60, 36, 9, "#A8D445") + ballT(81, 36, 9, "#C5E86A")
          + ballT(100, 50, 9, "#A8D445") + ballT(50, 66, 9, "#B5DC52") + ballT(71, 58, 9, "#C5E86A")
          + ballT(91, 66, 9, "#A8D445")
    },
    "Injeolmi": {
      coat: coat("#E5C795"),
      bits: `<path d="M48 34 Q70 22 92 34 Q94 44 70 47 Q46 44 48 34 Z" fill="#7A3B2E"
               stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
          + dot(58, 35, 2.4, "#4E241B") + dot(70, 38, 2.4, "#4E241B") + dot(81, 34, 2.4, "#4E241B")
          + cubeT(42, 54, 6.4, "#F3E6C4", 16) + cubeT(70, 60, 6.2, "#F6EAD2", -10)
          + cubeT(96, 54, 6, "#F3E6C4", 20)
          + dot(30, 62, 2.6, "#C98A4B") + dot(110, 62, 2.6, "#C98A4B")
    },
    "Red Bean Injeolmi": {
      coat: coat("#E5C795"),
      bits: `<path d="M48 34 Q70 22 92 34 Q94 44 70 47 Q46 44 48 34 Z" fill="#7A3B2E"
               stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
          + dot(58, 35, 2.4, "#4E241B") + dot(70, 38, 2.4, "#4E241B") + dot(81, 34, 2.4, "#4E241B")
          + cubeT(42, 54, 6.4, "#F3E6C4", 16) + cubeT(70, 60, 6.2, "#F6EAD2", -10)
          + cubeT(96, 54, 6, "#F3E6C4", 20)
          + pat(36, 58, -18, 0.95) + pat(108, 56, 14, 0.95)
          + dot(30, 62, 2.6, "#C98A4B") + dot(110, 62, 2.6, "#C98A4B")
    },
    "Black Sesame": {
      coat: coat("#6F655B"),
      bits: `<path d="M52 36 Q64 28 76 36 Q78 44 64 46 Q50 44 52 36 Z" fill="#7A3B2E"
               stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
          + ballT(40, 58, 6.5, "#7A3B2E") + ballT(100, 56, 6, "#7A3B2E")
          + ballT(88, 66, 5, "#8B3A2A")
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
          + cubeT(44, 48, 2.6, "#4A2C22", 28) + cubeT(76, 40, 2.4, "#3A2418", -18)
          + cubeT(96, 58, 2.5, "#4A2C22", 12) + cubeT(60, 68, 2.3, "#3A2418", -8)
          + `<path d="M34 66 Q52 58 70 64 Q88 58 106 66" fill="none" stroke="#FFF6D8" stroke-width="4.5" stroke-linecap="round"/>`
          + mochi(70, 22),
      crown: flake(52, 24, -36, "#F0C45A") + flake(88, 26, 28, "#E8B54A")
    },
    "Cereal Killer": {
      coat: coat("#FFE6F2"),
      drip: "#FF7AA8",
      bits: pebble(36, 50, -18, "#FF5B8A") + pebble(50, 36, 22, "#FFD44A")
          + pebble(78, 34, -12, "#5ECF6A") + pebble(98, 42, 16, "#9B6BFF")
          + pebble(44, 62, 8, "#3EC8C8") + pebble(88, 60, -20, "#FF5B8A")
          + pebble(108, 56, 14, "#FFD44A") + pebble(62, 68, 28, "#FF8A2B")
          + cubeT(58, 46, 4.4, "#C4843A", -16) + cubeT(82, 50, 4, "#A86A28", 12)
          + cubeT(40, 68, 3.8, "#D4A05A", 20) + cubeT(100, 66, 4.2, "#C4843A", -8)
          + flake(70, 40, 18, "#FFF3C0") + flake(92, 36, -22, "#F7E8A8")
          + flake(52, 56, 8, "#FFF6D0") + flake(112, 48, 26, "#F0E4B0")
          + slice(66, 52, -6) + slice(86, 64, 10) + slice(48, 44, 4),
      crown: pebble(54, 16, 20, "#FF5B8A") + pebble(86, 14, -14, "#5ECF6A")
          + cubeT(70, 18, 3.6, "#C4843A", -8) + flake(96, 22, 24, "#FFF3C0")
          + pebble(62, 10, 8, "#9B6BFF") + pebble(80, 8, -22, "#FFD44A")
    },
    "Yogurt Berry": {
      coat: coat("#FFF8F2"),
      drip: "#F4C7D4",
      bits: ballT(38, 52, 7.2, "#3A2A8A") + ballT(58, 38, 6.6, "#4A3A9A")
          + ballT(96, 40, 7, "#2E1E72") + ballT(112, 56, 6.4, "#3A2A8A")
          + ballT(48, 66, 6.2, "#4A3A9A") + ballT(86, 64, 6.8, "#2E1E72")
          + honeyDrip(44, 36, 58) + honeyDrip(108, 40, 56)
          + cubeT(44, 50, 6.4, "#FFF4D6", 16) + cubeT(74, 46, 6, "#FFE9B8", -10)
          + cubeT(100, 58, 5.8, "#FFF4D6", 22)
          + cubeT(40, 44, 2.6, "#C4843A", 20) + cubeT(92, 48, 2.4, "#A86A28", -14)
          + cubeT(62, 60, 2.4, "#C4843A", 8),
      crown: iceCream(70, 22, "#FFF6E8", "#D4B48A")
          + ballT(48, 28, 5.4, "#3A2A8A") + ballT(94, 30, 5, "#4A3A9A")
          + cubeT(88, 16, 4.6, "#FFF4D6", 14)
    },
    "Lychee": {
      drip: "#F5B3C8",
      // Peeled lychee halves: translucent white flesh with the dark seed
      // showing, so they read as lychee rather than mochi. A couple of
      // whole ones keep the bumpy red-pink shell for recognition. Pale
      // pink jelly cubes and deep-pink popping boba fill the gaps.
      bits: lycheeHalf(42, 50, -14) + lycheeHalf(70, 60, 6) + lycheeHalf(98, 52, 16)
          + lycheeWhole(58, 36, -8) + lycheeWhole(84, 38, 10)
          // no jelly (dropped 2026-08-19) — more popping boba instead
          + dot(50, 30, 3.4, "#E8608A") + dot(90, 30, 3.4, "#E8608A")
          + dot(58, 68, 3.4, "#E8608A") + dot(84, 68, 3.4, "#E8608A")
          + dot(114, 58, 3.2, "#E8608A") + dot(26, 60, 3.2, "#E8608A")
          + dot(34, 66, 3.2, "#E8608A") + dot(106, 66, 3.2, "#E8608A")
          + dot(112, 44, 3, "#E8608A") + dot(28, 50, 3, "#E8608A")
          + mochi(30, 40, 5.5) + mochi(110, 36, 5.5),
      // Yogurt ice cream scoop, set low enough to sit fully inside the
      // 0..162 viewBox — at y=14 the top half was clipped off.
      crown: iceCream(70, 24, "#FFFDF6", "#E3CBD6")
    },
    "Lychee Heaven": {
      drip: "#F5B3C8",
      // Seedless lychee pieces sit inside the mound instead of above it.
      bits: `<g fill="#FFF6EE" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round">
          <path d="M34 46 Q40 38 48 44 Q53 48 49 56 Q41 61 35 55 Z"/>
          <path d="M85 42 Q94 36 101 45 Q104 54 96 58 Q85 57 85 42 Z"/>
          <path d="M53 55 Q61 49 68 56 L67 68 Q59 73 52 66 Z"/>
          <path d="M77 60 Q85 53 93 61 Q96 69 87 73 Q78 72 77 60 Z"/>
        </g>`
        + ballT(32, 65, 4.5, "#F4D6DE") + ballT(47, 69, 4.5, "#F4D6DE")
        + ballT(74, 49, 4.5, "#F4D6DE") + ballT(104, 64, 4.5, "#F4D6DE")
        + ballT(111, 53, 4, "#F4D6DE") + ballT(57, 42, 4, "#F4D6DE")
        + dot(31, 63, 1.3, "#FFFFFF") + dot(73, 47, 1.3, "#FFFFFF")
        + dot(103, 62, 1.3, "#FFFFFF")
        + `<g fill="#DDB679" stroke="#785736" stroke-width="1.6" stroke-linejoin="round">
          <path d="M37 35 l12 4 -9 3 Z"/><path d="M94 32 l10 6 -12 -1 Z"/>
          <path d="M25 54 l11 -4 -5 7 Z"/><path d="M68 68 l7 -8 2 11 Z"/>
          <path d="M96 72 l10 -6 -3 9 Z"/><path d="M47 60 l8 3 -11 3 Z"/>
        </g>`,
      // Only the yogurt scoop crowns the bowl; coconut rests on its surface.
      crown: iceCream(70, 24, "#FFFDF6", "#E3CBD6")
        + `<g fill="#DDB679" stroke="#785736" stroke-width="1.5" stroke-linejoin="round">
          <path d="M60 14 l8 3 -9 2 Z"/><path d="M76 22 l7 -4 -2 7 Z"/>
        </g>`
    },
    "Cinnamon Toast": {
      coat: coat("#E8C79A"),
      bits: cubeT(42, 48, 8, "#D9A05B", 18) + cubeT(62, 36, 8, "#E8B76F", -8) + cubeT(84, 38, 8, "#D9A05B", 10)
          + cubeT(100, 52, 8, "#E8B76F", -16) + cubeT(52, 64, 8, "#E8B76F", 6) + cubeT(76, 60, 8, "#D9A05B", -12)
          + cubeT(94, 68, 8, "#E8B76F", 14) + mochi(70, 22)
    },
    "Matcha Strawberry": {
      coat: coat("#7FA653"),
      drip: "#5B8A32",
      bits: slice(38, 50, -16) + slice(58, 38, -4) + slice(84, 36, 10) + slice(102, 52, 18)
          + slice(48, 66, -8) + slice(90, 64, 12)
          + cubeT(44, 42, 2.8, "#C4843A", 22) + cubeT(70, 48, 2.6, "#A86A28", -14)
          + cubeT(96, 44, 2.8, "#C4843A", 8) + cubeT(56, 58, 2.4, "#A86A28", 30),
      crown: iceCream(70, 22, "#C5E07A", "#7FA653")
    },
    "Matcha Banana Cream": {
      coat: coat("#7FA653"),
      drip: "#5B8A32",
      bits: banana(42, 52, -16) + banana(78, 42, 10) + banana(104, 56, -8)
          + banana(56, 68, 14) + banana(92, 66, -12)
          + cubeT(36, 60, 3.2, "#D9A05B", 20) + cubeT(66, 48, 2.8, "#C4843A", -16)
          + cubeT(88, 40, 2.6, "#E8B76F", 8) + cubeT(114, 60, 3, "#D9A05B", -24),
      // Soft cream cap like Oreo Tiramisu mascarpone — not a scooped ball.
      crown: `<path d="M32 50 Q36 24 70 12 Q104 24 108 50
                 Q88 38 70 38 Q52 38 32 50 Z"
               fill="#FFF8F2" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
          + creamDrip(46, 40, 62) + creamDrip(70, 30, 56) + creamDrip(94, 40, 64)
          + banana(48, 16, -20) + banana(90, 18, 14)
          + cubeT(36, 34, 2.6, "#D9A05B", 18) + cubeT(104, 36, 2.4, "#C4843A", -14)
          + cubeT(70, 24, 2.2, "#E8B76F", 8)
          + cubeT(58, 36, 2.0, "#C4843A", 22)
          // Fine green matcha dust stays visibly on the white banana cream.
          + [[45,35],[54,30],[62,24],[69,33],[76,26],[84,32],[94,36],[59,40],[80,39]]
            .map(([x,y], i) => dot(x, y, i % 3 === 0 ? 1.5 : 1.05, "#5B8A32")).join("")
    },
    "Matcha Red Bean Injeolmi": {
      coat: coat("#7FA653"),
      drip: "#5B8A32",
      bits: pat(36, 54, -28, 1.15) + pat(56, 46, 16, 1.2) + pat(76, 54, -10, 1.18)
          + pat(96, 48, 22, 1.12) + pat(108, 60, -14, 1.08)
          + pat(44, 66, 10, 1.05) + pat(68, 66, -18, 1.1) + pat(90, 66, 8, 1.05)
          + dot(32, 48, 2.6, "#C98A4B") + dot(62, 40, 2.4, "#C98A4B")
          + dot(88, 42, 2.6, "#C98A4B") + dot(114, 50, 2.4, "#C98A4B")
          + dot(40, 38, 1.7, "#E8C89A") + dot(52, 34, 1.4, "#D4B07A")
          + dot(66, 32, 1.8, "#E5C795") + dot(80, 34, 1.5, "#C9A46A")
          + dot(94, 38, 1.6, "#E8C89A") + dot(48, 50, 1.4, "#D4B07A")
          + dot(72, 44, 1.7, "#E5C795") + dot(100, 46, 1.5, "#C9A46A")
          + dot(58, 58, 1.3, "#E8C89A") + dot(84, 56, 1.4, "#D4B07A"),
      crown: iceCream(70, 22, "#C45A6A", "#8B3228")
          + dot(62, 12, 1.5, "#E8C89A") + dot(74, 10, 1.3, "#D4B07A")
          + dot(80, 18, 1.4, "#E5C795") + dot(66, 22, 1.2, "#C9A46A")
    },
    "Strawnana": {
      bits: slice(40, 48, -14) + slice(62, 34, 4) + slice(96, 48, 16) + slice(50, 64, -8)
          + banana(80, 40, -18) + banana(70, 58, 12) + banana(100, 62, -8)
          + cubeT(36, 60, 3.2, "#D9A05B", 20) + cubeT(88, 34, 2.8, "#C4843A", -16)
          + cubeT(54, 44, 2.6, "#E8B76F", 8) + cubeT(108, 52, 3, "#D9A05B", -24),
      crown: honeyDrip(36, 48, 96) + honeyDrip(108, 46, 94)
    },
    "Acai": {
      bits: slice(32, 56, -16) + slice(50, 44, 4) + slice(104, 52, 18) + slice(88, 64, -6)
          + banana(40, 38, -22) + banana(100, 40, 16) + banana(56, 66, 8)
          + ballT(48, 54, 5, "#3A2A8A") + ballT(92, 48, 4.6, "#4A3A9A")
          + ballT(36, 66, 4.2, "#2E1E72") + ballT(108, 64, 4.4, "#3A2A8A")
          + ballT(76, 68, 4, "#4A3A9A")
          + cubeT(28, 48, 3.2, "#D9A05B", 22) + cubeT(114, 46, 3, "#C4843A", -14)
          + cubeT(62, 58, 2.8, "#E8B76F", 8) + cubeT(96, 70, 2.6, "#D9A05B", -20)
          + cubeT(44, 70, 2.4, "#C4843A", 16)
          + coconut(24, 42, -24) + coconut(118, 38, 18) + coconut(30, 70, 6)
          + coconut(122, 58, -12)
          + honeyDrip(52, 36, 58) + honeyDrip(90, 34, 56),
      crown: iceCream(70, 22, "#6B2B8C", "#3A1458", 20)
          + honeyDrip(62, 8, 34) + honeyDrip(80, 10, 36)
          + coconut(50, 10, -30) + coconut(92, 12, 22)
    },
    "Strawberry Oreo Tiramisu": {
      coat: coat("#5C3A22"),
      drip: "#4A2C1C",
      bits: slice(34, 56, -16) + slice(56, 42, -4) + slice(88, 40, 10) + slice(106, 58, 18)
          + slice(46, 70, -8) + slice(92, 68, 12)
          + cubeT(28, 58, 4.4, "#2E2C2A", 22) + cubeT(42, 48, 4.8, "#1A1816", -16)
          + cubeT(56, 60, 4.2, "#2E2C2A", 8) + cubeT(70, 50, 5, "#1A1816", -24)
          + cubeT(84, 58, 4.4, "#2E2C2A", 18) + cubeT(98, 48, 4.8, "#1A1816", -10)
          + cubeT(110, 62, 4.2, "#2E2C2A", 30) + cubeT(34, 70, 4.6, "#1A1816", -22)
          + cubeT(52, 72, 4, "#2E2C2A", 14) + cubeT(68, 66, 4.8, "#1A1816", -8)
          + cubeT(88, 72, 4.2, "#2E2C2A", 20) + cubeT(104, 70, 4.4, "#1A1816", -28)
          + cubeT(46, 62, 3.4, "#FFF8EC", 40) + cubeT(78, 64, 3.2, "#FFF8EC", -15)
          + ballT(32, 62, 3.2, "#2E2C2A") + ballT(64, 56, 3.4, "#1A1816")
          + ballT(96, 54, 3, "#2E2C2A") + ballT(116, 60, 3, "#1A1816")
          + dot(38, 52, 2.4, "#3A2418") + dot(60, 50, 2.2, "#4A2C1C")
          + dot(80, 52, 2.4, "#3A2418") + dot(108, 56, 2, "#4A2C1C"),
      crown: `<path d="M26 54 Q30 26 70 14 Q110 26 114 54
                 Q92 40 70 40 Q48 40 26 54 Z"
               fill="#FFE8EE" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>`
          + creamDrip(44, 36, 62) + creamDrip(70, 28, 58) + creamDrip(96, 36, 64)
          + slice(50, 22, -16) + slice(90, 24, 12)
          + cubeT(36, 30, 4, "#2E2C2A", 20) + cubeT(58, 20, 4.4, "#1A1816", -12)
          + cubeT(82, 20, 4.2, "#2E2C2A", 8) + cubeT(102, 32, 4.6, "#1A1816", -18)
          + cubeT(70, 32, 3.6, "#FFF8EC", 28)
          + cubeT(46, 38, 3.4, "#2E2C2A", -8) + cubeT(94, 40, 3.6, "#1A1816", 16)
          + dot(54, 18, 2, "#4A2C1C") + dot(76, 16, 1.8, "#3A2418")
          + dot(88, 22, 2, "#4A2C1C")
    },
    "Oreo Tiramisu": {
      // Dark Oreo crumb band, then a smaller mascarpone cap on top.
      coat: coat("#3A322C"),
      bits: cubeT(32, 56, 4, "#2E2C2A", 22) + cubeT(46, 50, 4.4, "#2E2C2A", -16)
          + cubeT(60, 60, 3.8, "#2E2C2A", 8) + cubeT(74, 52, 4.6, "#2E2C2A", -24)
          + cubeT(88, 58, 4, "#2E2C2A", 18) + cubeT(102, 50, 4.4, "#2E2C2A", -10)
          + cubeT(110, 62, 3.8, "#2E2C2A", 30) + cubeT(38, 68, 4.2, "#2E2C2A", -22)
          + cubeT(54, 72, 3.6, "#2E2C2A", 14) + cubeT(70, 66, 4.4, "#2E2C2A", -8)
          + cubeT(90, 70, 3.8, "#2E2C2A", 20) + cubeT(104, 68, 4, "#2E2C2A", -28)
          + cubeT(48, 62, 3, "#FFF8EC", 40) + cubeT(80, 64, 2.8, "#FFF8EC", -15)
          + ballT(36, 60, 3, "#2E2C2A") + ballT(66, 58, 3.2, "#2E2C2A")
          + ballT(94, 54, 2.8, "#2E2C2A") + ballT(114, 56, 2.8, "#2E2C2A"),
      crown: `<path d="M18 60 Q22 46 46 40 Q70 36 94 40 Q118 46 122 60
                 Q98 72 70 74 Q42 72 18 60 Z"
               fill="#2E2C2A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
          + cubeT(30, 56, 3.6, "#1A1816", 20) + cubeT(48, 52, 4, "#3A322C", -12)
          + cubeT(70, 50, 3.8, "#1A1816", 8) + cubeT(92, 52, 4.2, "#3A322C", -18)
          + cubeT(110, 58, 3.6, "#1A1816", 14) + cubeT(58, 62, 3.4, "#FFF8EC", 28)
          + cubeT(84, 64, 3.2, "#FFF8EC", -10)
          + `<path d="M40 42 Q44 20 70 12 Q96 20 100 42
                 Q84 32 70 32 Q56 32 40 42 Z"
               fill="#FFF8F2" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
          + creamDrip(50, 40, 58) + creamDrip(70, 32, 54) + creamDrip(90, 40, 60)
          + oreoCookie(48, 6, -26)
          + cubeT(90, 10, 3.2, "#2E2C2A", 20) + cubeT(94, 22, 2.8, "#2E2C2A", -12)
          + cubeT(86, 18, 2.4, "#FFF8EC", 8)
          + dot(62, 16, 1.6, "#4A2C1C") + dot(78, 12, 1.4, "#6B4530")
          + dot(70, 10, 1.5, "#4A2C1C") + dot(84, 20, 1.3, "#3D2818")
          + dot(56, 20, 1.4, "#6B4530")
    },
    "House Coffee": {
      coat: coat("#6B4530"),
      drip: "#FFF1D0",
      bits: cubeT(36, 52, 3.2, "#C4843A", 18) + cubeT(54, 42, 2.8, "#A86A28", -14)
          + cubeT(86, 44, 3, "#C4843A", 8) + cubeT(104, 52, 2.8, "#A86A28", -20)
          + cubeT(48, 64, 2.6, "#C4843A", 22) + cubeT(92, 62, 2.8, "#A86A28", -10)
          + mochi(42, 50) + mochi(96, 48) + mochi(70, 62)
          + creamDrip(48, 34, 54) + creamDrip(98, 36, 52),
      crown: iceCream(70, 24, "#FFF6E8", "#D4B48A")
          + cubeT(92, 16, 2.8, "#C4843A", -22) + cubeT(50, 18, 2.6, "#A86A28", 16)
    },
    "Classic Red Bean": {
      drip: "#FFF1D0",
      bits: pat(34, 56, -32, 1.15) + pat(54, 48, 18, 1.2) + pat(74, 54, -8, 1.18)
          + pat(94, 46, 24, 1.15) + pat(108, 58, -16, 1.1)
          + pat(42, 68, 12, 1.05) + pat(66, 68, -20, 1.1) + pat(88, 68, 8, 1.05)
          + ballT(48, 38, 6, "#E8465A") + ballT(92, 38, 5.4, "#C45A6A")
          + cubeT(40, 48, 5, "#FFB930", 16) + cubeT(78, 42, 4.6, "#FFD34F", -10)
          + cubeT(62, 60, 4.4, "#F4A06A", 22)
          + ballT(112, 66, 5, "#8FBF4A")
          + flake(30, 44, -28) + flake(114, 42, 22) + flake(52, 74, 8) + flake(98, 74, -14)
          + mochi(58, 30) + mochi(84, 26),
      crown: pat(70, 10, 8, 1.35) + pat(54, 20, -28, 1.15) + pat(86, 18, 20, 1.15)
          + pat(62, 28, 32, 1.05) + pat(80, 30, -18, 1.05)
    },
    "Hojicha Banana": {
      coat: coat("#C4A06A"),
      drip: "#8B5A2B",
      bits: banana(42, 48, -16) + banana(78, 38, 10) + banana(104, 52, -8)
          + banana(56, 64, 14) + banana(92, 64, -12)
          + cubeT(36, 60, 3.2, "#D9A05B", 20) + cubeT(66, 44, 2.8, "#C4843A", -16)
          + cubeT(88, 36, 2.6, "#E8B76F", 8) + cubeT(114, 60, 3, "#D9A05B", -24)
          + cubeT(50, 44, 2.4, "#C4843A", 16)
          + mochi(48, 30) + mochi(96, 28)
          + honeyDrip(44, 36, 56) + honeyDrip(108, 38, 54),
      crown: iceCream(70, 22, "#FFF6E8", "#D4B48A")
          + banana(50, 14, -28) + banana(92, 16, 22)
          + honeyDrip(62, 8, 32)
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
    "Coconut Mango Yogurt": { fill: "#FFF6E8", ridge: "#D4B48A" },
    "Strawberry":   { fill: "#EE7B8C", ridge: "#D45A6C" },
    "Strawberry Cheesecake": { fill: "#FFF6E8", ridge: "#D4B48A" },
    "Strawberry Oreo Tiramisu": { fill: "#FFF6E8", ridge: "#D4B48A" },
    "Oreo":         { fill: "#6B4534", ridge: "#4A2C22" },
    "Oreo Tiramisu": { fill: "#6B4534", ridge: "#4A2C22" },
    "Injeolmi":     { fill: "#E6C89A", ridge: "#C9A46A" },
    "Red Bean Injeolmi": { fill: "#C45A6A", ridge: "#8B3228" },
    "Black Sesame": { fill: "#FFF6E8", ridge: "#D4B48A" }
  };

  // Cup-only names reuse the matching bowl cap.
  const CUP_AS = {};

  // Soft background circle behind each bowl, tinted to the flavor.
  const HALO = {
    "Mango": "#FFF0CC", "Strawberry": "#FFE3E8", "Oreo": "#ECE8E2",
    "Injeolmi": "#F6EAD2", "Black Sesame": "#E9E5DE", "Watermelon": "#FFE0E2",
    "Sweet Corn": "#FFF1C4", "Melon": "#E4F5C8", "Lychee": "#FCE4EE",
    "Yogurt Berry": "#F3E8F6", "Blueberry Yogurt": "#F3E8F6", "Cereal Killer": "#FFD6E8",
    "Matcha Strawberry": "#E4F0C8", "Matcha Strawberry Biscoff": "#E4F0C8",
    "Matcha Banana Cream": "#E8F0C4", "Matcha Red Bean Injeolmi": "#E4E8C8", "Strawnana": "#FFE8C8", "Acai": "#EED4F6",
    "House Coffee": "#E8D8C8", "Classic Red Bean": "#F0D8D0", "Pat Bingsu": "#F0D8D0",
    "Dubai Chocolate": "#E8F0C8", "Hojicha Banana": "#F0E4CC",
    "Oreo Tiramisu": "#E8D8C8", "Lychee Heaven": "#FCE4EE",
    "Coconut Mango Yogurt": "#FFF0CC", "Strawberry Cheesecake": "#FFE8EE",
    "Strawberry Oreo Tiramisu": "#FFE3E8", "Red Bean Injeolmi": "#F6EAD2"
  };
  CAPS["Pat Bingsu"] = CAPS["Classic Red Bean"];
  CAPS["Matcha Strawberry Biscoff"] = CAPS["Matcha Strawberry"];
  CAPS["Classic Red Bean Matcha"] = CAPS["Matcha Red Bean Injeolmi"];
  CAPS["Matcha Injeolmi Redbean"] = CAPS["Matcha Red Bean Injeolmi"];
  CAPS["Matcha Injeolmi Red Bean"] = CAPS["Matcha Red Bean Injeolmi"];
  CAPS["Blueberry Yogurt"] = CAPS["Yogurt Berry"];
  CAPS["Strawnana Pie"] = {
    noScoop: true,
    drip: "#E8465A",
    bits: slice(39, 49, -14) + slice(62, 36, 4) + slice(97, 49, 16) + slice(49, 65, -8)
      + banana(80, 40, -18) + banana(70, 58, 12) + banana(101, 63, -8)
      + biscuitCrumb(35, 61, 20) + biscuitCrumb(56, 46, 8) + biscuitCrumb(88, 34, -16)
      + biscuitCrumb(108, 53, -24) + biscuitCrumb(87, 70, 14),
    crown: `<path d="M31 51 Q35 27 70 15 Q105 27 109 51 Q92 40 70 40 Q48 40 31 51 Z"
              fill="#FFF8F2" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`
      + creamDrip(47, 39, 59) + creamDrip(71, 29, 55) + creamDrip(94, 39, 61)
      + slice(51, 21, -18) + banana(90, 20, 16)
      // A small piped rosette reads as whipped cream, separate from the banana-cream blanket.
      + `<path d="M68 28 Q62 25 66 20 Q70 15 74 20 Q79 24 74 28 Q71 31 68 28 Z"
           fill="#FFFDF8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
         <path d="M66 23 Q70 18 74 23 M66 26 Q70 21 75 26" fill="none" stroke="#E7DCCB" stroke-width="1.25" stroke-linecap="round"/>`
  };
  CAPS["Classic Pat Bingsu"] = {
    noScoop: true,
    drip: "#F4DFC0",
    coat: coat("#F8FBFF"),
    bits: pat(34, 56, -32, 1.15) + pat(54, 47, 18, 1.2) + pat(74, 55, -8, 1.18)
      + pat(95, 47, 24, 1.15) + pat(108, 59, -16, 1.1) + pat(43, 68, 12, 1.05)
      + pat(67, 68, -20, 1.1) + pat(89, 68, 8, 1.05)
      + flake(31, 44, -28) + flake(48, 36, 15) + flake(111, 43, 22) + flake(53, 75, 8) + flake(99, 74, -14)
      + cubeT(40, 49, 5, "#FFB930", 16) + cubeT(78, 42, 4.6, "#FFD34F", -10)
      + cubeT(63, 60, 4.4, "#F4A06A", 22) + ballT(112, 66, 5, "#8FBF4A")
      // Toasted injeolmi powder visibly dusts both fruit cocktail and beans.
      + [[32,51],[44,43],[58,54],[69,44],[82,53],[96,40],[106,55],[50,67],[77,65],[98,69]]
        .map(([x,y], i) => dot(x, y, i % 3 === 0 ? 2 : 1.35, i % 2 ? "#D4B07A" : "#E5C795")).join("")
      + `<path d="M28 53 Q46 61 59 52 M80 55 Q96 63 112 53" fill="none" stroke="#F4DFC0" stroke-width="4.5" stroke-linecap="round"/>`,
    crown: `<path d="M52 21 Q56 14 62 19 Q68 11 74 19 Q81 13 88 21" fill="none" stroke="#F4DFC0" stroke-width="5" stroke-linecap="round"/>`
  };
  CAPS["Blueberry Yogurt Cheesecake"] = CAPS["Blueberry Yogurt"];
  CAPS["Matcha Strawberry"] = CAPS["Matcha Strawberry Biscoff"];
  CAPS["Açaí"] = CAPS["Acai"];
  HALO["Açaí"] = HALO["Acai"];
  CAPS["Cookies and Cream"] = CAPS["Oreo Tiramisu"];
  HALO["Cookies and Cream"] = HALO["Oreo Tiramisu"];
  HALO["Mango Special"] = "#FFF0CC";
  HALO["Strawberry Special"] = "#FFE3E8";
  HALO["Strawnana Pie"] = "#FFE8C8";
  HALO["Classic Pat Bingsu"] = "#F0D8D0";
  HALO["Blueberry Yogurt Cheesecake"] = HALO["Blueberry Yogurt"];

  // The white MOUND remains the milk-snow base; these shapes build the tiramisu cross-section above it.
  const hojichaLadyfinger = (x, y, rotation = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rotation})">
       <rect x="-8.8" y="-3.8" width="17.6" height="7.6" rx="3.1" fill="#E7B96D"
         stroke="${INK}" stroke-width="2.2"/>
       <path d="M-4.6 -1.4 H4.6 M-4.6 1.4 H4.6" fill="none" stroke="#BD7C36"
         stroke-width="1.15" stroke-linecap="round" opacity=".85"/>
       <path d="M-5.8 -2.2 Q-2.5 -3.1 .5 -2.1" fill="none" stroke="#FFF0BD"
         stroke-width="1.05" stroke-linecap="round" opacity=".8"/>
     </g>`;

  CAPS["Hojicha Tiramisu"] = {
    drip: "#A36D3D",
    bits:
      // Homemade cream tucked between milk snow and the soaked ladyfingers.
      `<path d="M24 71 Q30 62 40 65 Q47 58 56 64 Q64 57 72 63 Q81 57 89 64 Q99 58 108 66 Q116 63 120 71
         Q99 76 70 75 Q42 76 24 71 Z" fill="#FFF3D9" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
      // Regular, neatly arranged middle band of syrup-soaked ladyfinger bites.
      + hojichaLadyfinger(38, 58, -7) + hojichaLadyfinger(54, 56, 4)
      + hojichaLadyfinger(70, 57, -4) + hojichaLadyfinger(86, 56, 5)
      + hojichaLadyfinger(102, 58, -7)
      + `<path d="M30 53 Q45 58 59 53 T87 53 T111 54 M37 62 Q51 66 65 61 T92 61 T105 62"
           fill="none" stroke="#8A542E" stroke-width="2.5" stroke-linecap="round" opacity=".88"/>`
      + `<path d="M25 48 Q38 26 57 22 Q70 14 83 23 Q102 30 120 49
           Q103 55 86 52 Q70 56 54 52 Q38 55 25 48 Z" fill="#FFF4DE" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
      // Warm roasted-tea powder sits on the upper cream, leaving its puffed edge visible.
      + `<path d="M37 42 Q46 29 60 25 Q70 19 80 26 Q96 32 104 43 Q88 47 70 45 Q53 47 37 42 Z"
           fill="#B27645" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
      + `<g fill="#895631" opacity=".72">${[[47,39],[54,36],[62,40],[69,34],[76,39],[84,35],[92,40],[58,43],[73,42],[87,43]]
        .map(([x,y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.25 : .8}"/>`).join("")}</g>`,
    crown: ""
  };

  HALO["Hojicha Tiramisu"] = "#EEDCC8";

  // Coffee syrup over milk snow, finished with golden Biscoff crumbs.
  CAPS["Vietnamese Coffee"] = {
    drip: "#71462E",
    bits: '<path d="M37 42 Q55 51 73 42 T104 43 M28 62 Q48 72 71 62 T113 64" fill="none" stroke="#71462E" stroke-width="4" stroke-linecap="round"/>'
      + cubeT(57,28,3.5,"#C68B46",18) + cubeT(78,26,3,"#C68B46",-16)
      + cubeT(43,41,4,"#C68B46",-12) + cubeT(93,40,4,"#C68B46",24)
      + cubeT(63,47,3.5,"#C68B46",25) + cubeT(79,55,4,"#C68B46",-18)
      + cubeT(36,61,3.5,"#C68B46",16) + cubeT(101,63,3.5,"#C68B46",-25)
      + cubeT(56,69,3,"#C68B46",-20)
      + [[65,33],[73,37],[51,54],[88,30],[85,68],[39,52],[94,54],[60,59],[104,71]].map(([x,y])=>dot(x,y,1.4,"#B47734")).join(""),
    crown: ""
  };
  HALO["Vietnamese Coffee"] = "#E8D8C8";

  // The torched layer is inside; the visible finish uses dehydrated marshmallows.
  const dryMarshmallow = (x,y,rot=0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-4" y="-4" width="8" height="10" rx="2.5" fill="#FFF9ED" stroke="${INK}" stroke-width="1.7"/>
    <ellipse cy="-3" rx="3.7" ry="1.8" fill="#FFFFFF" stroke="#D8CFC0" stroke-width=".8"/>
  </g>`;
  const grahamPiece = (x,y,rot=0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="#D8AA65" stroke="${INK}" stroke-width="2.2"/>
    <path d="M0 -5 V5" stroke="#A37136" stroke-width="1.2"/>
    <g fill="#94602F"><circle cx="-4" cy="-2" r=".8"/><circle cx="4" cy="-2" r=".8"/><circle cx="-4" cy="2" r=".8"/><circle cx="4" cy="2" r=".8"/></g>
  </g>`;
  const cacaoDust = () => '<g fill="#8B5B3B" opacity=".7">'
    +[[39,35],[46,32],[52,38],[60,33],[83,35],[92,39],[36,46],[44,54],[54,49],[61,56],[77,48],[83,57],[96,54],[109,63],[31,65],[41,68],[58,67],[68,61],[79,72],[91,69],[101,65]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3===0?1.4:.85}"/><circle cx="${x+2.5}" cy="${y+2}" r=".55"/>`).join('')+'</g>';
  CAPS["S'mores"] = {
    coat:coat("#E6CDB5"),
    drip:"#533124",
    bits:grahamPiece(47,42,-22)+grahamPiece(94,43,24)+grahamPiece(68,61,-12)
      +grahamPiece(36,72,16)+grahamPiece(102,70,-18)
      +[[34,54,-15],[53,60,8],[87,60,-8],[72,42,12],[57,77,-14],[85,78,10],[108,57,24]].map(([x,y,r])=>dryMarshmallow(x,y,r)).join("")
      +'<path d="M33 47 Q53 55 75 49 T108 58 M30 65 Q58 77 79 67 T109 75" fill="none" stroke="#533124" stroke-width="2.8" stroke-linecap="round"/>'
      +cacaoDust(),
    crown:iceCream(70,21,"#FFF6E8","#D4B48A",16)
  };
  HALO["S'mores"]="#F2DFCA";

  const greenGrape = (x,y,rot=0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <ellipse rx="8" ry="10.5" fill="#94B94A" stroke="${INK}" stroke-width="2"/>
    <ellipse cy="-.7" rx="6.2" ry="8.6" fill="#DAEAA6"/>
    <path d="M0 -6 Q-2 0 0 5" fill="none" stroke="#B9D274" stroke-width="1.2"/>
    <path d="M-3 -5 Q-5 -1 -4 2" fill="none" stroke="#F4F8DB" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
  CAPS["Green Grape Aloe"] = {
    drip:"#D2DF9A",
    bits:[[52,32,-28],[87,32,25],[40,47,-30],[59,47,-10],[79,47,18],[99,47,32],[29,65,-20],[49,65,15],[70,65,-8],[90,65,-15],[110,65,22],[36,82,-20],[58,82,8],[80,82,-10],[101,82,25]].map(([x,y,r])=>greenGrape(x,y,r)).join("")
      +cubeT(48,50,4.2,"#F2F6D9",-12)+cubeT(87,58,4.5,"#F2F6D9",15)
      +cubeT(66,74,4.2,"#F2F6D9",-20)+cubeT(103,76,3.8,"#F2F6D9",8)
      +[[46,37,-20,"#F05B65"],[95,38,25,"#FFBF3F"],[31,53,-15,"#F79539"],[68,43,20,"#A36CD8"],[87,47,-25,"#4DB4E4"],[55,57,10,"#F05B65"],[101,58,30,"#A36CD8"],[39,68,-15,"#FFBF3F"],[78,62,20,"#F79539"],[59,70,-20,"#4DB4E4"],[93,72,10,"#F05B65"]].map(([x,y,r,c])=>pebble(x,y,r,c)).join("")
      +'<path d="M52 58 l5 -3 M87 39 l5 3 M37 77 l5 -2 M73 53 l4 -3" fill="none" stroke="#668438" stroke-width="1.7" stroke-linecap="round"/>',
    crown:iceCream(70,21,"#FFFBEF","#DCD6B7",16)
  };
  HALO["Green Grape Aloe"]="#EAF1D5";

  const creamPuff = (x,y,r=10) => `<g transform="translate(${x} ${y})">
    <path d="M-${r} 2 Q-${r+2} -5 -5 -7 Q0 -${r+3} 5 -7 Q${r+2} -5 ${r} 2 Q${r} 9 0 9 Q-${r} 9 -${r} 2 Z" fill="#E6BD7D" stroke="${INK}" stroke-width="2.3"/>
    <path d="M-${r-1} 2 Q0 6 ${r-1} 2" fill="none" stroke="#FFF8E9" stroke-width="4"/>
    <path d="M-4 -5 Q0 -8 4 -5" fill="none" stroke="#B98748" stroke-width="1.5" stroke-linecap="round"/>
  </g>`;
  const butterWaffle = (x=84,y=28,rotation=20) => `<g transform="translate(${x} ${y}) rotate(${rotation})">
    <rect x="-11" y="-20" width="22" height="34" rx="3" fill="#E9BE70" stroke="${INK}" stroke-width="2.5"/>
    <path d="M-4 -17 V11 M4 -17 V11 M-8 -10 H8 M-8 -2 H8 M-8 6 H8" fill="none" stroke="#B88540" stroke-width="2"/>
  </g>`;
  const cookieDough = (x,y,r=6) => `<g transform="translate(${x} ${y})">
    <path d="M-${r} 0 Q-${r} -${r} 0 -${r} Q${r+1} -${r-1} ${r} 2 Q${r-1} ${r+1} -2 ${r} Q-${r} ${r-1} -${r} 0 Z" fill="#DDBD8F" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="-2" cy="-2" r="1.2" fill="#583829"/><circle cx="2" cy="2" r="1.1" fill="#583829"/>
  </g>`;
  CAPS["Cookie Monster"] = {
    coat:coat("#E6CDB5"),
    drip:"#583829",
    bits:butterWaffle(98,51,35)+creamPuff(37,58,10)+creamPuff(95,63,11)
      +creamPuff(63,51,10)+cookieDough(55,70)+cookieDough(76,67,7)+cookieDough(107,53,5)
      +'<path d="M35 44 Q53 40 68 48 T105 53 M45 73 Q62 65 91 74" fill="none" stroke="#583829" stroke-width="3.5" stroke-linecap="round"/>'
      +[[48,40],[62,47],[81,52],[105,72],[53,76],[72,37]].map(([x,y])=>`<path d="M${x-3} ${y+3} Q${x-4} ${y} ${x} ${y-4} Q${x+4} ${y} ${x+3} ${y+3} Z" fill="#493127"/>`).join("")
      +[[42,49],[61,64],[88,44],[82,78],[32,73],[100,48],[70,59],[53,32]].map(([x,y])=>cubeT(x,y,1.6,"#6B4C36",25)).join("")+cacaoDust(),
    crown:butterWaffle()+creamPuff(60,28,12)
  };
  HALO["Cookie Monster"]="#EEDFCB";

  // Mochi is an unclipped finishing layer: peaks and edge pieces must remain
  // whole, and cream caps or ice cream must never hide the rice-cake pillows.
  const MOCHI_TOPPINGS = {
    "Mango": [[49,28,7,-14],[81,26,7,14],[37,58,7,-8],[101,62,7,18]],
    "Strawberry": [[49,27,7,-16],[83,27,7,12],[36,60,7,-12],[102,62,7,16]],
    "Watermelon": [[49,27,7,-12],[84,28,7,14],[37,62,7,-8]],
    "Melon": [[49,27,7,-12],[84,28,7,14],[103,63,7,12]],
    "Injeolmi": [[40,47,7,-16],[77,56,7,10],[102,65,7,-10]],
    "Black Sesame": [[39,47,7,-14],[94,40,7,16],[71,64,7,-8]],
    "Mango Special": [[49,28,7,-14],[81,26,7,14],[37,58,7,-8],[101,62,7,18]],
    "Strawberry Special": [[49,27,7,-16],[83,27,7,12],[36,60,7,-12],[102,62,7,16]],
    "Classic Pat Bingsu": [[48,28,7,-14],[82,27,7,14],[70,64,7,-8]],
    "Cereal Killer": [[47,28,7,-14],[84,27,7,14],[34,64,7,-8]],
    "Matcha Strawberry": [[36,43,7,-14],[104,43,7,16],[70,65,7,-8]],
    "Matcha Strawberry Biscoff": [[36,43,7,-14],[104,43,7,16],[70,65,7,-8]],
    "Lychee Heaven": [[35,43,7,-14],[106,42,7,16],[72,65,7,-8]],
    "Red Bean Injeolmi": [[43,49,7,-14],[96,51,7,16],[70,63,7,-8]]
  };
  Object.entries(MOCHI_TOPPINGS).forEach(([flavor, pieces]) => {
    CAPS[flavor] = { ...CAPS[flavor], topMochi: pieces.map(p => mochi(...p)).join("") };
  });
  // Side mochi is used only for recipes that explicitly include it.
  const sideMochi = mochi(119,140,6,-12) + mochi(127,131,6,10) + mochi(132,145,6,15);
  CAPS["Oreo Tiramisu"] = { ...CAPS["Oreo Tiramisu"], sideMochi, topMochi: "" };
  CAPS["Cookies and Cream"] = CAPS["Oreo Tiramisu"];
  // A level cream finish, shown in perspective, keeps these two bowls clean.
  const creamMound = "M18 84 L26 39 Q26 25 70 25 Q114 25 114 39 L122 84 Z";
  const flatCream = `<g data-topping="flat-cream">
    <path d="M26 39 Q70 23 114 39 L113 50 Q91 61 70 57 Q49 61 27 50 Z"
      fill="#FFF5E1" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <ellipse cx="70" cy="38" rx="44" ry="13" fill="#FFFCF2" stroke="${INK}" stroke-width="2.6"/>
    <path d="M34 48 Q70 57 105 48" fill="none" stroke="#EADCC6" stroke-width="1.5"/>
  </g>`;
  const teaDust = (color, count = 110) => `<g data-topping="tea-powder" fill="${color}">` +
    Array.from({length:count},(_,i)=>{
      const a=i*2.399963, r=Math.sqrt((i+.5)/count);
      return `<circle cx="${(70+39*r*Math.cos(a)).toFixed(2)}" cy="${(38+10*r*Math.sin(a)).toFixed(2)}" r="${i%4===0?'.8':'.5'}" opacity="${i%3===0?'.85':'.6'}"/>`;
    }).join("") + '</g>';
  const flatBanana = (x,y,rotation) => `<g data-topping="banana" transform="translate(${x} ${y}) rotate(${rotation})">
    <ellipse cy="2" rx="10" ry="6" fill="#E9C979" stroke="${INK}" stroke-width="1.9"/>
    <ellipse rx="10" ry="6" fill="#FFF0B9" stroke="${INK}" stroke-width="1.9"/>
    <ellipse rx="5.6" ry="3.2" fill="#FFF8D9"/>
    <path d="M-2 -1 L0 0 2 -1 M0 0 L0 2" fill="none" stroke="#BB9456" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
  CAPS["Hojicha Tiramisu"] = {
    mound: creamMound,
    drip: "#A36D3D",
    bits: hojichaLadyfinger(39,64,-4) + hojichaLadyfinger(59,63,2)
      + hojichaLadyfinger(80,63,-2) + hojichaLadyfinger(100,64,4),
    crown: flatCream + '<ellipse cx="70" cy="38" rx="38" ry="9" fill="#AF815A" opacity=".35"/>' + teaDust("#865530",150),
    sideMochi,
    topMochi: ""
  };
  CAPS["Matcha Banana Cream"] = {
    mound: creamMound,
    drip: "#6D8E3D",
    bits: '<path d="M25 66 Q70 71 115 66" fill="none" stroke="#D5B587" stroke-width="4"/>'
      + [34,46,60,73,87,101,110].map((x,i)=>dot(x,65+i%3,1.3,"#B7844B")).join(""),
    crown: flatCream
      + '<ellipse cx="70" cy="38" rx="38" ry="9" fill="#85A84E" opacity=".22"/>'
      + flatBanana(49,33,-12) + flatBanana(70,31,0) + flatBanana(91,34,12)
      + flatBanana(58,43,-7) + flatBanana(82,43,8)
      + teaDust("#638B36",120),
    sideMochi,
    topMochi: ""
  };

  // Loaded fruit specials and açaí follow the current TV menu artwork.
  // Keep these final overrides together so the sale names do not drift from it.
  const specialSparkle = (x, y, s = 4) =>
    `<path d="M${x} ${y-s} Q${x+1} ${y-1} ${x+s} ${y} Q${x+1} ${y+1} ${x} ${y+s} Q${x-1} ${y+1} ${x-s} ${y} Q${x-1} ${y-1} ${x} ${y-s}Z" fill="#F8D06A" stroke="#B87F27" stroke-width="1.1"/>`;
  const cheesecakeBite = (x, y, rotation) =>
    `<g data-topping="cheesecake" transform="translate(${x} ${y}) rotate(${rotation})"><path d="M-8 -6 L6 -8 L9 5 L-6 8Z" fill="#FFF2D6" stroke="${INK}" stroke-width="2.1" stroke-linejoin="round"/><path d="M-6 3 L8 1 L9 5 L-6 8Z" fill="#C68B49" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-5 -3 L4 -5" stroke="#FFFDF4" stroke-width="2.5" stroke-linecap="round"/></g>`;
  CAPS["Mango Special"] = {
    ...CAPS["Mango Special"],
    bits: CAPS["Mango"].bits
      + coconutJelly(37,49,6.2,-18) + coconutJelly(56,64,6,12) + coconutJelly(94,45,5.7,18)
      + poppingBoba(83,61,6.1,"#FF9A28") + poppingBoba(99,64,6,"#FFAA34")
      + poppingBoba(109,52,5.6,"#F78C20") + poppingBoba(94,75,5.8,"#FF9A28")
      + coconut(29,66,-20,"#D7A35E") + coconut(46,74,20,"#E5BF78")
      + coconut(69,48,-20,"#D7A35E") + coconut(80,76,15,"#E5BF78") + coconut(108,72,-30,"#D7A35E"),
    crown: `<g data-special-finish="mango-loaded">${specialSparkle(17,36,4)}${specialSparkle(122,24,4.5)}${iceCream(70,24,"#FFFDF6","#D9C6A7",22)}${coconut(58,16,-28,"#D7A35E")}${coconut(77,12,18,"#E5BF78")}${coconut(83,28,-26,"#D7A35E")}${coconut(63,34,15,"#E5BF78")}</g>`,
    topMochi: mochi(43,33,7,-14) + mochi(98,35,7,14) + mochi(30,57,6.5,-8)
  };
  CAPS["Strawberry Special"] = {
    ...CAPS["Strawberry Special"],
    bits: slice(34,47,-25) + slice(51,36,-12) + slice(94,37,18) + slice(109,55,22)
      + slice(44,67,-17) + slice(85,64,12) + slice(69,50,0)
      + cheesecakeBite(54,60,-15) + cheesecakeBite(78,73,12) + cheesecakeBite(101,70,-10)
      + biscuitCrumb(30,73,-18) + biscuitCrumb(66,74,20) + biscuitCrumb(93,54,-18)
      + biscuitCrumb(110,70,18) + biscuitCrumb(42,47,-10),
    crown: `<g data-special-finish="strawberry-loaded">${specialSparkle(17,36,4)}${specialSparkle(122,24,4.5)}${iceCream(70,24,"#FFF6E8","#D4B48A",22)}${biscuitCrumb(59,17,-15)}${biscuitCrumb(78,13,20)}${biscuitCrumb(82,31,-12)}${dot(64,30,1.6,"#9E6534")}${dot(70,37,1.4,"#9E6534")}</g>`,
    topMochi: mochi(43,31,7,-16) + mochi(100,35,7,12) + mochi(31,59,6.5,-12)
  };

  const acaiBerry = (x,y,r=5.4) => `<g data-topping="blueberry">${ballT(x,y,r,"#434688")}<path d="M${x-2} ${y-1} L${x} ${y+1} L${x+2} ${y-1}" fill="none" stroke="#9A9BC6" stroke-width="1.4" stroke-linecap="round"/></g>`;
  const acaiBanana = (x,y,angle) => `<g data-topping="banana" transform="translate(${x} ${y}) rotate(${angle})"><ellipse rx="9" ry="11" fill="#FFF0B8" stroke="${INK}" stroke-width="2.3"/><ellipse rx="5.7" ry="7.5" fill="none" stroke="#E5CA76" stroke-width="1.2"/><path d="M-2 -2 L0 1 L2 -1 M0 1 L0 4" fill="none" stroke="#9E7745" stroke-width="1.2" stroke-linecap="round"/></g>`;
  const acaiCrunch = [[28,62,-20],[41,58,15],[53,67,-15],[68,63,18],[82,69,-12],[96,57,18],[109,66,-10]].map(([x,y,a],i) => `<g data-topping="granola-coconut">${cubeT(x,y,3.2,i % 2 ? "#D6A15D" : "#BD813B",a)}${cubeT(x+4,y-4,2,"#E0B978",-a)}${coconut(x+5,y+1,a,"#D9B573")}</g>`).join("");
  CAPS["Acai"] = {
    baseFill: "#76447C", coat: '<rect x="0" y="0" width="140" height="90" fill="#76447C"/>', noScoop: true, topMochi: "", sideMochi: "",
    bits: `<g data-fruit-layout="strawberries-left-bananas-right-blueberries-middle">${slice(54,30,-14)}${slice(39,46,-20)}${slice(55,53,-8)}${slice(31,65,-18)}${slice(48,69,-8)}${acaiBanana(87,32,18)}${acaiBanana(100,47,22)}${acaiBanana(85,55,12)}${acaiBanana(108,64,20)}${acaiBanana(94,72,12)}${acaiBerry(69,24,5)}${acaiBerry(76,32)}${acaiBerry(66,40)}${acaiBerry(76,48)}${acaiBerry(66,56)}${acaiBerry(73,65)}${acaiBerry(67,73,5)}${acaiCrunch}</g>`,
    crown: `<g data-special-finish="acai-loaded">${specialSparkle(17,34,4)}${specialSparkle(124,27,4.5)}${slice(50,28,-18)}${slice(39,39,-24)}${acaiBanana(87,26,24)}${acaiBanana(99,37,28)}${acaiBerry(69,18,5.7)}${acaiBerry(62,27,5.6)}${acaiBerry(77,27,5.8)}${coconut(42,56,-24,"#E2BB7B")}${coconut(92,62,20,"#D9B573")}<g data-topping="honey-drips">${honeyDrip(32,58,94)}${honeyDrip(83,68,108)}${honeyDrip(108,50,76)}</g></g>`
  };
  CAPS["Açaí"] = CAPS["Acai"];

  const halfHalfTopMochi = mochi(53,20,7,-14) + mochi(87,21,7,14);
  CAPS["Mango & Strawberry"] = { topMochi: halfHalfTopMochi, sideMochi: "" };
  HALO["Mango & Strawberry"] = "#FFF0CC";

  function halfHalfBowl(label) {
    const m = uid(), b = uid();
    const mango = cubeT(38,53,8,"#FFA51F",-10) + cubeT(52,37,8,"#FFB930",6) + cubeT(56,66,8,"#FFB930",4) + cubeT(68,51,8,"#FFA51F",-12) + coconut(31,49,-24) + coconut(45,62,8) + coconut(57,28,-18);
    const berries = slice(82,35,8) + slice(102,50,20) + slice(91,66,12) + slice(72,57,2) + slice(105,67,12);
    return `<svg class="art-svg half-half-art" viewBox="0 0 140 162" role="img" aria-label="${label}"><defs><clipPath id="${m}"><path d="${MOUND}"/></clipPath><clipPath id="${b}"><path d="${BOWL}"/></clipPath></defs><path d="${MOUND}" fill="#FFFFFF" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><g clip-path="url(#${m})"><path d="M13 24 H70 V87 H13 Z" fill="#FFF0CC"/><path d="M70 24 H127 V87 H70 Z" fill="#FFE3E8"/><path d="M18 77 C38 67 53 72 70 77 C88 70 106 67 122 77" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity=".92"/>${mango}${berries}</g><path d="${MOUND}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><path d="${BOWL}" fill="#E6DFD2" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><g clip-path="url(#${b})"><path d="M36 104 Q46 132 58 146" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".6"/><path d="M104 104 Q96 130 86 145" fill="none" stroke="${INK}" stroke-width="4" opacity=".10"/></g><path d="${SPILL}" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M23 89 Q37 94 50 89 Q63 84 70 90 Q78 84 91 89 Q105 94 117 88 L116 102 Q102 107 90 101 Q78 96 70 102 Q61 96 49 101 Q36 107 23 101 Z" fill="#FFF8E9" stroke="#F2D8A8" stroke-width="2"/><path d="M29 91 Q37 100 43 96 M57 94 Q64 101 70 96 M84 96 Q91 101 99 94" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/><path d="M27 85 Q32 99 30 112" fill="none" stroke="#FFA51F" stroke-width="5" stroke-linecap="round"/><path d="M111 85 Q106 99 109 112" fill="none" stroke="#E8465A" stroke-width="5" stroke-linecap="round"/><g data-layer="top-mochi">${halfHalfTopMochi}</g></svg>`;
  }

  /* ---------------- vessels ---------------- */

  // The flared tin bowl, snow piled above the rim.
  // October 2026: textured cream finishes matched to the TV illustrations.
  const softCreamShape = 'M8 54 C10 44 10 33 19 26 C27 14 44 10 57 11 C76 10 87 17 94 26 C104 36 100 42 105 55 C108 63 101 65 96 62 C91 59 90 58 87 62 C84 65 90 76 84 76 C76 80 74 72 76 64 C75 56 71 58 65 61 C60 68 59 69 55 68 C49 68 49 61 45 62 C39 61 43 76 37 76 C28 80 28 71 28 65 C28 56 22 61 18 60 C12 62 6 60 8 54Z';
  function texturedBanana(x,y,rotation) {
    let fibers='';
    for(let i=0;i<25;i++){const a=i*Math.PI*2/25;fibers+=`<path d="M${Math.cos(a)*2} ${Math.sin(a)*2.5} Q${Math.cos(a+.1)*4.8} ${Math.sin(a+.1)*6.5} ${Math.cos(a)*7} ${Math.sin(a)*9}"/>`;}
    return `<g data-topping="banana" transform="translate(${x} ${y}) rotate(${rotation})"><ellipse rx="8.5" ry="11" fill="#FFF0BA" stroke="${INK}" stroke-width="1.35"/><ellipse rx="6.7" ry="9" fill="#FFF7D8"/><g fill="none" stroke="#B9954F" stroke-width=".45" opacity=".45">${fibers}</g><path d="M0 0 L0 -3 M0 0 L-2.8 2 M0 0 L2.8 2" stroke="#AD8344" stroke-width=".65"/><g fill="#916C3A"><ellipse cy="-2" rx=".5" ry=".7"/><ellipse cx="-1.6" cy="1.4" rx=".5" ry=".7"/><ellipse cx="1.6" cy="1.4" rx=".5" ry=".7"/></g></g>`;
  }
  function texturedCream(matcha) {
    const grad=uid(),clip=uid();let seed=matcha?113:71;
    const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let powder='';for(let i=0;i<2500;i++){const x=12+rand()*91,y=11+rand()*43,d=((x-57)/46)**2+((y-29)/22)**2;if(d>1||rand()>1-d*.55)continue;powder+=`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(.12+rand()**3*.44).toFixed(2)}" opacity="${(.28+rand()*.44).toFixed(2)}"/>`;}
    const folds=[[20,29,62],[30,40,65],[16,51,67]].map(([x,y,w])=>`<path d="M${x} ${y} C${x+w*.25} ${y+9} ${x+w*.7} ${y-11} ${x+w} ${y-3}"/>`).join('');
    return `<g data-topping="textured-cream" transform="translate(4 20) scale(1.15)"><defs><linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${matcha?'#84A249':'#A1734D'}"/><stop offset=".58" stop-color="${matcha?'#B5C57A':'#CDA87E'}"/><stop offset="1" stop-color="#FFF9E9"/></linearGradient><clipPath id="${clip}"><path d="${softCreamShape}"/></clipPath></defs><path d="${softCreamShape}" fill="#FFF9E9"/><g clip-path="url(#${clip})"><rect x="5" y="11" width="104" height="48" fill="url(#${grad})"/><g fill="none" stroke="${matcha?'#52702C':'#785030'}" stroke-width="4.2" opacity=".13" stroke-linecap="round">${folds}</g><g transform="translate(-.5 -2)" fill="none" stroke="#FF FCE9" stroke-width="2.5" opacity=".38" stroke-linecap="round">${folds}</g><g data-topping="tea-powder" fill="${matcha?'#58762B':'#80532F'}">${powder}</g></g><path d="${softCreamShape}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>${matcha?texturedBanana(32,20,-22)+texturedBanana(55,13,7)+texturedBanana(78,22,22)+texturedBanana(54,34,-11):hojichaLadyfinger(24,48,-8)+hojichaLadyfinger(53,50,6)+hojichaLadyfinger(84,48,11)}</g>`.replace('#FF FCE9','#FFFCE9');
  }
  ['Hojicha Tiramisu','Matcha Banana Cream'].forEach((name,i)=>{
    CAPS[name]={mound:'M13 84 Q15 62 26 50 Q40 30 70 32 Q99 30 113 51 Q125 66 127 84Z',drip:i?'#6D8E3D':'#A36D3D',bits:'',crown:()=>texturedCream(!!i),sideMochi,topMochi:''};
  });
  const nutAlmond=(x,y,r=0)=>`<g data-topping="almond" transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -6 Q8 0 0 7 Q-8 0 0 -6Z" fill="#D9AB70" stroke="${INK}" stroke-width="1.5"/><path d="M0 -4 Q-1 0 0 5" fill="none" stroke="#A66D39" stroke-width=".8"/></g>`;
  const walnut=(x,y)=>`<g data-topping="walnut" transform="translate(${x} ${y})"><path d="M-6 0 Q-8 -5 -3 -5 Q0 -9 3 -5 Q8 -5 6 0 Q8 5 3 5 Q0 8 -3 5 Q-8 5 -6 0Z" fill="#B88452" stroke="${INK}" stroke-width="1.5"/><path d="M0 -5 Q-3 0 0 5 M-5 -2 L-2 0 -4 3 M4 -3 L2 0 5 2" fill="none" stroke="#70472D" stroke-width="1"/></g>`;
  const brownie=(x,y,r=0)=>`<g data-topping="brownie" transform="translate(${x} ${y}) rotate(${r})"><rect x="-6" y="-5" width="12" height="10" rx="1.5" fill="#58372B" stroke="${INK}" stroke-width="1.7"/><path d="M-4 -2 L-1 -3 M1 1 L4 2 M-3 3 L-1 2" stroke="#A47653" stroke-width="1.5"/></g>`;
  const bananaHalf=(x,flip)=>`<g data-topping="banana-half" transform="translate(${x} 34) scale(${flip} 1)"><path d="M0 -9 C-10 10 -10 34 8 53 Q16 59 18 53 C5 35 4 12 8 -5 Q5 -13 0 -9Z" fill="#FFE7A0" stroke="${INK}" stroke-width="2.3"/><path d="M3 -3 Q-3 26 13 51" fill="none" stroke="#CBA858" stroke-width="1.2"/><path d="M-1 6 l11 4 M-3 18 l11 4 M-1 31 l11 4 M4 43 l11 3" fill="none" stroke="#B77632" stroke-width="3" stroke-linecap="round"/></g>`;
  const cherryTop=()=>`<g data-topping="cherry"><path d="M72 13 Q68 3 79 2" fill="none" stroke="#667735" stroke-width="1.8"/><circle cx="71" cy="15" r="5.5" fill="#D73D53" stroke="${INK}" stroke-width="1.7"/><path d="M68 12 l1 -1" stroke="#FFBCC6" stroke-width="1.8" stroke-linecap="round"/></g>`;
  CAPS['Banana Split']={drip:'#B77B36',bits:walnut(58,62)+nutAlmond(72,65,-25)+walnut(83,72)+nutAlmond(52,77,20),crown:()=>bananaHalf(26,1)+bananaHalf(114,-1)
    +iceCream(49,35,'#FFF6E8','#D4B48A',21)+iceCream(91,37,'#8B5942','#603A2A',21)
    +'<path d="M34 29 Q43 24 53 29 L60 34" fill="none" stroke="#D9A537" stroke-width="3" stroke-linecap="round"/>'
    +[[39,23],[47,22],[55,26],[44,30],[54,32]].map(([x,y])=>cubeT(x,y,2.7,'#F6D464',18)).join('')
    +'<path d="M75 29 Q84 24 92 30 T109 31 M82 34 Q91 30 101 36 L100 45" fill="none" stroke="#44291F" stroke-width="3.4" stroke-linecap="round"/>'
    +walnut(87,27)+nutAlmond(102,31,32)+cherryTop()
    +[[40,39,'#E85A79'],[58,39,'#70ABCB'],[80,43,'#F5C64D'],[98,46,'#D264A5'],[66,51,'#8CAF49']].map(([x,y,c])=>`<path d="M${x} ${y} l3 2" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`).join('')};
  HALO['Banana Split']='#FFF0CF';
  CAPS['Neapolitan']={drip:'#6A3C2B',bits:butterWaffle(51,66,-16)+butterWaffle(88,67,18),crown:()=>iceCream(37,42,'#F4A1B4','#D06B86',21)+iceCream(70,28,'#8B5942','#603A2A',21)+iceCream(104,43,'#FFF6E8','#D4B48A',21)
    +slice(23,58,-25)+slice(44,62,22)
    +'<path d="M54 20 Q63 16 70 22 T85 22 M59 27 Q68 23 79 30 L78 39" fill="none" stroke="#44291F" stroke-width="3.2" stroke-linecap="round"/>'
    +brownie(61,19,-15)+brownie(81,51,15)+brownie(67,59,-12)
    +nutAlmond(96,32,-25)+nutAlmond(108,29,20)+nutAlmond(111,42,30)};
  HALO['Neapolitan']='#F8E2DE';

  function bowl(flavor, label = flavor) {
    if (flavor === "Mango Strawberry" || flavor === "Mango & Strawberry") return halfHalfBowl(label);
    const cfg = CAPS[flavor] || {};
    const m = uid(), b = uid(), mound = cfg.mound || MOUND;
    return `<svg class="art-svg" viewBox="0 0 140 162" role="img" aria-label="${/bingsu$/i.test(label) ? label : label + ' bingsu'}">
      <defs>
        <clipPath id="${m}"><path d="${mound}"/></clipPath>
        <clipPath id="${b}"><path d="${BOWL}"/></clipPath>
      </defs>
      <path d="${mound}" fill="#FFFFFF" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${m})">
        ${cfg.coat || ""}
        ${cfg.drip ? snowDrip(cfg.drip) : ""}
        ${cfg.bits || ""}
      </g>
      <path d="${mound}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="${BOWL}" fill="#E6DFD2" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${b})">
        <path d="M36 104 Q46 132 58 146" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.6"/>
        <path d="M104 104 Q96 130 86 145" fill="none" stroke="${INK}" stroke-width="4" opacity="0.10"/>
      </g>
      <path d="${SPILL}" fill="${cfg.baseFill || "#FFFFFF"}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${cfg.drip ? vesselDrip(b, cfg.drip) : ""}
      ${typeof cfg.crown === "function" ? cfg.crown() : cfg.crown || ""}
      <g data-layer="top-mochi">${cfg.topMochi || ""}</g>
      <g data-layer="side-mochi">${cfg.sideMochi || ""}</g>
    </svg>`;
  }

  // Same topping caps as the bowl, sitting in a clear plastic cup
  // that flares wider at the rim. Snow shows through the walls.
  // Scoop on top.
  function cup(flavor) {
    const art = CUP_AS[flavor] || flavor;
    const cfg = CAPS[art] || {};
    const scoop = SCOOP[flavor] || SCOOP[art] || { fill: "#FFF6E8", ridge: "#D4B48A" };
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
      <path d="${CUP_BODY}" fill="#FFFFFF"/>
      <g clip-path="url(#${b})">
        ${cfg.drip ? `<path d="M24 128 L116 148 L116 158 L24 158 Z" fill="${cfg.drip}" opacity="0.22"/>` : ""}
        ${cfg.drip ? vesselDrip(b, cfg.drip) : ""}
      </g>
      <path d="${CUP_BODY}" fill="#A9DCF5" fill-opacity="0.28" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <g clip-path="url(#${b})">
        <path d="M40 92 L50 152" fill="none" stroke="#FFFFFF" stroke-width="6" opacity="0.85"/>
        <path d="M100 92 L92 152" fill="none" stroke="${INK}" stroke-width="3.2" opacity="0.08"/>
      </g>
      <path d="M22 72 L118 72 L116 80 L24 80 Z" fill="#E8F6FC" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="${CUP_SPILL}" fill="${cfg.baseFill || "#FFFFFF"}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${typeof cfg.crown === "function" ? cfg.crown() : cfg.crown || ""}
      ${cfg.noScoop ? "" : iceCream(70, 8, scoop.fill, scoop.ridge)}
      <g data-layer="top-mochi">${cfg.topMochi || ""}</g>
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
