/* ============================================================
   SWEET SNOW — CUP BINGSU (saved for later)
   ------------------------------------------------------------
   Removed from the menu on 2026-08-18. Kept here so nothing is
   lost when cup bingsu goes on sale again.

   TO PUT IT BACK:
   1. Open  menu-2026-august.js  (the live menu file).
   2. Copy the whole  cupBingsu: { ... },  block below and paste
      it into window.MENU, right after the bingsu section.
   3. In index.html, restore the "CUP BINGSU" section markup and
      in app.js the renderCups() code — both are in git history
      (removed 2026-08-18), so `git log -p` shows them exactly.
   4. Re-run  menus/tv-2026/export.sh  if the cups should also
      appear on the TVs (they were never on the TVs before).

   This file is not loaded by any page — it is storage only.
   ============================================================ */

window.MENU_CUP_SAVED = {

  /* ---- CUP BINGSU ----------------------------------------- */
  cupBingsu: {
    title: "Cup Bingsu", ko: "컵빙수",
    price: "9.50",
    note: "one size · comes with ice cream scoop",
    sizeNote: "Serves one person.",
    flavors: [
      { name: "Mango", ko: "망고", ing: "fresh mango · condensed milk · mochi · mango ice cream" },
      { name: "Strawberry", ko: "딸기", ing: "fresh strawberry · condensed milk · mochi · strawberry ice cream" },
      { name: "Oreo", ko: "오레오", ing: "Oreo · cocoa powder · mochi · chocolate drizzle · chocolate ice cream" },
      { name: "Injeolmi", ko: "인절미", ing: "roasted soybean · red bean · condensed milk · mochi · injeolmi ice cream" },
      { name: "Black Sesame", ko: "흑임자", ing: "black sesame · almonds · red bean · condensed milk · vanilla ice cream" }
    ]
  }

};
