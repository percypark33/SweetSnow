/* ============================================================
   SWEET SNOW — MENU · 2026 AUGUST (shared)
   ------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Both the website (sweetsnow.org) and the TV menu boards read
   this one file, so changing a price here updates all of them.

   Cup Bingsu was removed 2026-08-18 — it is saved in
   cup-bingsu-saved.js for when it goes on sale.

   After editing, to make fresh TV images:
     cd ~/sweet-snow/menus/tv-2026 && ./export.sh

   Rules:
     - Keep the quote marks "" around every piece of text.
     - Keep the commas at the end of each line.
     - To remove an item, delete its whole { ... } block.
     - Anything after //  is a private note; it never shows.
   ============================================================ */

window.MENU = {

  brand: {
    name: "Sweet Snow",
    tagline: "Korean Shaved Ice",
    ko: "스윗스노우",
    blurb: "Real milk shaved into soft snow — creamy, never watery.",
    venue: "Inside QT Golden Market Place",
    street: "9772 Garden Grove Blvd",
    city: "Garden Grove, CA 92844",
    instagram: "sweetsnow_oc",
    url: "sweetsnow.org"
  },

  /* ---- PREMIUM BINGSU ------------------------------------- */
  bingsu: {
    title: "Premium Bingsu", ko: "눈꽃빙수",
    blurb: "Real milk shaved into soft snow — creamy, never watery.",
    price: "13.50",
    priceNote: "one size · made to share",
    qualityNote: "Every bingsu is made with premium ingredients.",
    mixNote: "+$2 half & half fruit mix (mango · strawberry · watermelon)",

    /* badge: SIGNATURE (black) · SEASONAL (yellow) · SPECIAL (pink)
       · COMING SOON (cream)
       price: only on cards that differ from the base price   */
    flavors: [
      { name: "Mango", ko: "망고", badge: "SIGNATURE",
        ing: "fresh mango · homemade syrup · condensed milk · mochi" },
      { name: "Strawberry", ko: "딸기", badge: "SIGNATURE",
        ing: "fresh strawberry · homemade syrup · condensed milk · mochi" },
      { name: "Oreo", ko: "오레오", badge: "SIGNATURE",
        ing: "Oreo · cocoa powder · mochi · chocolate drizzle" },
      { name: "Injeolmi", ko: "인절미", badge: "SIGNATURE",
        ing: "roasted soybean · red bean · condensed milk · mochi" },
      { name: "Black Sesame", ko: "흑임자", badge: "SIGNATURE",
        ing: "black sesame · almonds · red bean · condensed milk · mochi" },
      { name: "Watermelon", ko: "수박", badge: "SEASONAL",
        ing: "watermelon balls · homemade syrup · condensed milk · mochi", price: "14.50" },
      { name: "Lychee", ko: "리치", badge: "SPECIAL",
        ing: "sliced lychee · lychee jelly · lychee popping boba · yogurt ice cream · homemade syrup · condensed milk · mochi", price: "16.50" },
      { name: "Dubai Chocolate", ko: "두바이 초콜릿", badge: "COMING SOON",
        ing: "crushed pistachios · roasted kataifi · chocolate shell · pistachio paste · chocolate ice cream · chocolate syrup · cacao powder",
        price: "17.50" }
    ],
    comingSoon: { title: "Coming Soon", ko: "출시 예정" }
  },

  /* ---- TOPPINGS -------------------------------------------
     Whole-dollar tiers. Add an item to whichever tier it costs.
     `opts` is the flavor list under an item — write it as a list
     in [ ] and each choice gets its own red line.               */
  toppings: {
    note: "Add to any size · stack as many as you want",
    fruitNote: "Fresh fruit may vary by season, and may run out.",
    tiers: [
      { price: "1", items: [
        { en: "Extra Injeolmi Powder", ko: "콩가루" },
        { en: "Extra Condensed Milk",  ko: "연유" },
        { en: "Extra Mochi",           ko: "떡" },
        { en: "Red Beans",             ko: "팥" },
        { en: "Crushed Almonds",       ko: "아몬드" },
        { en: "Granola",               ko: "그래놀라" },
        { en: "Cacao Powder",          ko: "카카오 파우더" },
        { en: "Oreo Crumbs",           ko: "오레오" },
        { en: "Honey Drizzle",         ko: "꿀" },
        { en: "Lychee Jelly",          ko: "리치 젤리" },
        { en: "Cereal", ko: "시리얼",
          opts: ["Fruity Pebbles", "Corn Flakes"] },
        { en: "Popping Boba", ko: "팝핑보바",
          opts: ["Strawberry", "Mango"] }
      ]},
      { price: "2", items: [
        { en: "Vanilla Ice Cream Scoop", ko: "바닐라 아이스크림" },
        { en: "Brownie Bites",           ko: "브라우니" },
        { en: "Cheesecake Cubes",        ko: "치즈케이크" }
      ]},
      { price: "3", items: [
        { en: "Fresh Fruit", ko: "생과일",
          opts: ["Mango", "Strawberry", "Watermelon (seasonal)"] }
      ]}
    ]
  },

  /* ---- HOT & FRESH SIDES ---------------------------------- */
  taiyaki: {
    title: "Taiyaki", ko: "붕어빵",
    price: "3.00",
    fillings: "Nutella · Red Bean · Custard · Sweet Potato & Cheese · Cheese",
    fillingsKo: "누텔라 · 팥 · 슈크림 · 치즈고구마 · 치즈",
    note: "Orders start at two pieces",
    deals: [
      { qty: "2 pieces", price: "5.00" },
      { qty: "5 pieces", price: "12.00" }
    ],
    dealNote: "mix any fillings"
  },

  taiyakiIce: {
    title: "Taiyaki Ice Cream", ko: "붕어빵 아이스크림",
    price: "5.00",
    note: "flavor of your choice · 1 taiyaki + 1 ice cream scoop"
  },

  dubaiTaiyaki: {
    title: "Dubai Taiyaki", ko: "두바이 붕어빵",
    price: "5.00",
    note: "Dubai chocolate filling · cacao powder"
  },

  cookie: {
    title: "Dubai Chewy Cookie", ko: "두바이쫀득쿠키",
    price: "7.30",
    sub: "Marshmallows · real pistachios · premium cacao · kataifi · white chocolate",
    warn: "Contains nuts. Not for nut allergies."
  },

  drinks: {
    title: "Drinks", ko: "음료", status: "coming soon",
    list: "Rice Punch Slushy · Injeolmi Shake"
  },

  /* ---- THE VOTE (website only) ----------------------------
     Options customers pick. Edit these freely — every answer
     lands in Netlify Forms under "menu-request".               */
  survey: {
    categories: [
      "Drinks", "Hot food", "More bingsu flavors",
      "Baked goods", "Something seasonal", "Vegan options"
    ],
    flavors: [
      "Taro", "Matcha", "Ube", "Coffee", "Peach", "Honeydew",
      "Coconut", "Tiramisu", "Thai tea", "Brown sugar", "Lychee", "Banana"
    ]
  },

  /* ---- HOURS -----------------------------------------------
     `hours` is what people read. `schedule` is the same thing in
     24-hour time so the site can say whether we're open right
     now — keep the two in step.                                */
  hours: [
    { days: "Closed Mondays", time: "" },
    { days: "Tue – Thu", time: "12:00 – 9:30" },
    { days: "Fri – Sun", time: "12:00 – 10:30" }
  ],

  /* 0 = Sunday … 6 = Saturday · null = closed all day */
  schedule: {
    0: { open: "12:00", close: "22:30" },
    1: null,
    2: { open: "12:00", close: "21:30" },
    3: { open: "12:00", close: "21:30" },
    4: { open: "12:00", close: "21:30" },
    5: { open: "12:00", close: "22:30" },
    6: { open: "12:00", close: "22:30" }
  },

  footer: {
    left: "Real fruit · Cut fresh daily · Made to order",
    disclaimer: "Menu and prices may change at any time — thank you for understanding!",
    right: "sweetsnow.org"
  }
};
