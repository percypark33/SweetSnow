/* ============================================================
   SWEET SNOW — MENU · 2026 AUGUST (shared)
   ------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Both the website (sweetsnow.org) and the TV menu boards read
   this one file, so changing a price here updates all of them.

   The older five-flavor cup list is archived in
   cup-bingsu-saved.js. Live cups live in cupBingsu below.

   After editing, to make fresh TV images:
     cd ~/sweet-snow/menus/tv-2026 && ./export.sh

   Rules:
     - Keep the quote marks "" around every piece of text.
     - Keep the commas at the end of each line.
     - To remove an item, delete its whole { ... } block.
     - Anything after //  is a private note; it never shows.
   ============================================================ */

window.MENU = {

  // Sweetness is a taste rating, not a sugar-content measurement.
  // Add each menu name and its confirmed rating here (for example: Mango: 2).
  // Missing ratings display as "Not rated yet"; never assume a rating.
  sweetness: {
    levels: [1, 2, 3],
    ratings: {
      "Mango": 3,
      "Strawberry": 2,
      "Cookies and Cream": 3,
      "Cereal Killer": 3,
      "Matcha Banana Cream": 3,
      "Matcha Strawberry": 3,
      "Dubai Chocolate": 3,
      "Melon": 2,
      "Lychee Heaven": 2,
      "Watermelon": 2,
      "Blueberry Yogurt Cheesecake": 2,
      "Açaí": 2,
      "Strawnana Pie": 2,
      "Injeolmi": 1,
      "Black Sesame": 1
    }
  },

  brand: {
    name: "Sweet Snow",
    tagline: "Korean Shaved Ice",
    blurb: "Real milk shaved into soft snow — creamy, never watery.",
    venue: "Inside QT Golden Market Place",
    street: "9772 Garden Grove Blvd",
    city: "Garden Grove, CA 92844",
    instagram: "sweetsnow_oc",
    url: "sweetsnow.org"
  },

  /* ---- SHAVED MILK + SHAVED ICE --------------------------- */
  bingsu: {
    title: "Premium Bingsu",
    blurb: "Real milk shaved into soft snow — creamy, never watery.",
    price: "14.50",
    priceNote: "one size · serves 2–3 people",
    qualityNote: "Made with quality ingredients.",
    mixNote: "",
    mixSeasonNote: "",
    cupSoon: "",
    marketNote: "Prices can change at any time based on market prices. Thank you.",
    specialNote: "We try to use healthier, organic ingredients. Special menus may be gone anytime without notice.",

    /* Milk-snow base: $14.50, with syrup, condensed milk and main topping.
       Specials add toppings and a cream OR ice cream finish, priced $16.50–$18.50.
       Never combine cream and an ice cream scoop on the same recipe.
       Classic Pat Bingsu uses shaved ice and has its own $13.50 price. */
    classicOrder: ["Mango","Strawberry","Mango & Strawberry","Injeolmi","Black Sesame","Matcha Strawberry","Cookies and Cream","Blueberry Yogurt Cheesecake"],
    specialOrder: ["Mango Special","Strawberry Special","Cereal Killer","Strawnana Pie","Hojicha Tiramisu","Matcha Banana Cream","Lychee Heaven","Açaí"],
    flavors: [
      {
        "name": "Mango",
        "badge": "CLASSIC",
        "ing": "mango · house-made syrup · mochi",
        "price": "14.50",
        "red": false,
        "staffPicks": [
          "Cheesecake bites",
          "Strawberry popping boba",
          "Mango popping boba",
          "Yogurt ice cream"
        ]
      },
      {
        "name": "Mango Special",
        "badge": "SPECIAL",
        "specialOf": "Mango",
        "price": "18.50",
        "ing": "Mango bingsu + toasted coconut flakes · mango popping boba · coconut jelly · yogurt vanilla ice cream",
        "specialNote": "Loaded with toppings of our choice for a discounted price."
      },
      {
        "name": "Strawberry",
        "inventoryName": "Strawberry Cheesecake",
        "artName": "Strawberry",
        "badge": "CLASSIC",
        "ing": "strawberry · house-made syrup · mochi",
        "price": "14.50",
        "staffPicks": [
          "Cheesecake bites",
          "Strawberry popping boba",
          "Mango popping boba",
          "Yogurt ice cream"
        ]
      },
      {
        "name": "Strawberry Special",
        "badge": "SPECIAL",
        "specialOf": "Strawberry",
        "price": "18.50",
        "ing": "Strawberry bingsu + cheesecake bites · Biscoff crumbs · vanilla ice cream",
        "specialNote": "Loaded with toppings of our choice for a discounted price."
      },
      {
        "name": "Mango & Strawberry",
        "subtitle": "Half-and-half",
        "artName": "Mango & Strawberry",
        "badge": "CLASSIC",
        "price": "15.50",
        "ing": "mango · strawberry · house-made syrup · mochi"
      },
      {
        "name": "Injeolmi",
        "badge": "CLASSIC",
        "ing": "roasted soybean powder · red bean · crushed almonds · mochi",
        "price": "14.50",
        "staffPicks": [
          "watermelon",
          "Red bean ice cream",
          "Corn flakes",
          "Honey"
        ]
      },
      {
        "name": "Black Sesame",
        "badge": "CLASSIC",
        "ing": "black sesame · red bean · crushed almonds · mochi",
        "price": "14.50",
        "staffPicks": [
          "Vanilla ice cream",
          "Honey"
        ]
      },
      {
        "name": "Melon",
        "badge": "SEASONAL",
        "hidden": true,
        "ing": "fresh melon balls · house-made syrup · mochi",
        "price": "14.50",
        "staffPicks": [
          "Yogurt ice cream",
          "Cheesecake bites"
        ]
      },
      {
        "name": "Strawnana Pie",
        "recipeNote": "Syrup contains condensed milk.",
        "inventoryName": "Strawnana",
        "badge": "SPECIAL",
        "ing": "strawberry · banana · cookie crumbs · house-made syrup · house-made banana cream · whipped cream",
        "price": "18.50"
      },
      {
        "name": "Blueberry Yogurt Cheesecake",
        "inventoryName": "Blueberry Yogurt",
        "badge": "CLASSIC",
        "ing": "blueberry · house-made yogurt syrup · cheesecake bites · yogurt ice cream",
        "price": "17.50"
      },
      {
        "name": "Cookies and Cream",
        "brandLabel": "Oreo™",
        "inventoryName": "Oreo Tiramisu",
        "artName": "Oreo Tiramisu",
        "badge": "CLASSIC",
        "ing": "Oreo™ crumbs · house-made cream · premium cacao powder · mochi on the side",
        "price": "16.50"
      },
      {
        "name": "Cereal Killer",
        "badge": "SPECIAL",
        "ing": "three cereals of our choice · organic freeze-dried strawberry · mochi",
        "price": "16.50"
      },
      {
        "name": "Hojicha Tiramisu",
        "mochiPlacement": "side",
        "recipeNote": "Syrup contains condensed milk.",
        "badge": "SPECIAL",
        "ing": "house-made Japanese hojicha syrup · ladyfinger bites · house-made cream · organic hojicha powder · mochi",
        "price": "16.50"
      },
      {
        "name": "Matcha Strawberry",
        "badge": "CLASSIC",
        "ing": "strawberry · organic matcha syrup · Biscoff crumbs · mochi · premium green tea ice cream",
        "price": "16.50",
        "brandLabel": "Biscoff™"
      },
      {
        "name": "Matcha Banana Cream",
        "mochiPlacement": "side",
        "recipeNote": "Syrup contains condensed milk.",
        "badge": "SPECIAL",
        "brandLabel": "Biscoff™",
        "ing": "house-made Japanese matcha syrup · banana · house-made banana cream · Biscoff crumbs · organic matcha powder",
        "price": "16.50"
      },
      {
        "name": "Lychee Heaven",
        "badge": "SPECIAL",
        "ing": "lychee · lychee popping boba · toasted coconut flakes · coconut jelly · mochi · yogurt ice cream",
        "price": "18.50"
      },
      {
        "name": "Açaí",
        "inventoryName": "Acai",
        "badge": "SPECIAL",
        "ing": "açaí · banana · strawberry · blueberry · granola · honey · toasted coconut flakes",
        "price": "18.50"
      },
      {
        "name": "Classic Pat Bingsu",
        "badge": "COMING SOON",
        "hidden": true,
        "base": "shaved ice",
        "price": "13.50",
        "ing": "shaved ice · cornflakes · red beans · fruit cocktail · mochi · injeolmi powder"
      },
      {
        "name": "Dubai Chocolate",
        "badge": "COMING SOON",
        "hidden": true,
        "ing": "real pistachio paste · roasted kataifi · chocolate shell · crushed pistachios · chocolate drizzle · premium cacao powder · pistachio ice cream",
        "price": "18.50"
      },
      {
        "name": "Vietnamese Coffee",
        "badge": "COMING SOON",
        "hidden": true,
        "price": null,
        "ing": "house-made coffee syrup · Biscoff crumbs"
      },
      {
        "name": "S'mores",
        "badge": "COMING SOON",
        "hidden": true,
        "price": null,
        "ing": "graham cracker crumbs · chocolate drizzle · torched marshmallows · graham crackers · dehydrated marshmallows · cacao powder · vanilla ice cream"
      },
      {
        "name": "Green Grape Aloe",
        "badge": "COMING SOON",
        "hidden": true,
        "price": null,
        "ing": "Fruity Pebbles · house-made syrup · halved green grape · aloe jelly · yogurt ice cream · lime zest"
      },
      {
        "name": "Cookie Monster",
        "badge": "COMING SOON",
        "hidden": true,
        "price": null,
        "ing": "Golden Oreo cookie crumbs · chocolate drizzle · cream puffs · butter waffles · cookie dough bits · chocolate chips · cacao powder"
      },
      {
        "name": "Banana Split",
        "badge": "COMING SOON",
        "price": null,
        "ing": "two long banana halves along the rim · caramel drizzle · walnuts and almonds in the middle · vanilla ice cream with crushed pineapple and syrup · chocolate ice cream with chocolate sauce and extra nuts · cherry · sprinkles"
      },
      {
        "name": "Neapolitan",
        "badge": "COMING SOON",
        "price": null,
        "ing": "butter waffles in the middle · strawberry, chocolate and vanilla ice cream · strawberries beside the strawberry scoop · brownies and chocolate sauce beside and over the chocolate scoop · almonds on the vanilla scoop"
      }
    ],
    comingSoon: { title: "Coming Soon" },

    // Classic Pat Bingsu is listed with the Coming Soon bowls above.
    iceTitle: "Shaved Ice",
    iceBlurb: "Traditional Korean shaved ice.",
    ice: []
  },

  /* Hot & Fresh stays numbered 9–12 even though the milk list grew.
     The two TVs each start their own count. Cups number 1–3 in
     their own section. */
  hotStart: 9,

  /* ---- CUP BINGSU -----------------------------------------
     Single serve. Ice cream is in the price. */
  cupBingsu: {
    enabled: false,
    soon: true,
    title: "Cup Bingsu",
    blurb: "Single serve.",
    price: "8.50",
    priceNote: "one size · ice cream where listed",
    flavors: [
      { name: "Bingsu de Fruta", soon: true,
        price: "10.00",
        ing: "mango · watermelon · pineapple · melon · lime · Tajín · chamoy drizzle" },
      { name: "Red Bean Injeolmi",
        price: "8.50",
        ing: "red beans · injeolmi powder · injeolmi mochi · red bean base · crushed almonds · red bean ice cream" },
      { name: "Strawberry Oreo Tiramisu",
        price: "8.50",
        ing: "fresh strawberry · Oreo crumbs · house-made strawberry cream · house-made syrup · strawberry base · Dutch cacao powder · vanilla ice cream" },
      { name: "Coconut Mango Yogurt",
        price: "9.50",
        ing: "fresh mango · toasted coconut flakes · yogurt · mango popping boba · house-made syrup · coconut mango base · vanilla yogurt ice cream" }
    ]
  },

  /* ---- TOPPINGS -------------------------------------------
     Add an item to whichever tier it costs.
     `opts` is the flavor list under an item — write it as a list
     in [ ] and each choice gets its own red line.
     `note` is a quieter line under that (coming-soon, etc.).     */
  toppings: {
    "note": "Add to any size · stack as many as you want",
    "freeNote": "Sprinkles are free.",
    "servingNote": "All toppings served on the side, except sprinkles and honey drizzle.",
    "tiers": [
      {
        "price": "1",
        "items": [
          {
            "en": "Popping Boba",
            "opts": [
              "Strawberry",
              "Mango",
              "Lychee"
            ]
          },
          {
            "en": "Cereal",
            "opts": [
              "Fruity Pebbles",
              "Fruit Loops",
              "Corn Flakes",
              "Cinnamon Toast Crunch"
            ]
          },
          {
            "en": "Condensed Milk"
          },
          {
            "en": "Honey Drizzle"
          },
          {
            "en": "Crushed Almonds"
          },
          {
            "en": "Granola"
          },
          {
            "en": "Oreo Crumbs"
          },
          {
            "en": "Toasted Coconut Flakes"
          },
          {
            "en": "Coconut Flakes"
          },
          {
            "en": "Coconut Jelly"
          },
          {
            "en": "Tajín"
          },
          {
            "en": "Nutella"
          }
        ]
      },
      {
        "price": "1.50",
        "items": [
          {
            "en": "Injeolmi Powder"
          },
          {
            "en": "Mochi"
          },
          {
            "en": "Red Beans"
          },
          {
            "en": "Biscoff Crumbs"
          }
        ]
      },
      {
        "price": "2",
        "items": [
          {
            "en": "Premium Ice Cream Scoop",
            "opts": [
              "Vanilla",
              "Yogurt",
              "Red Bean"
            ]
          },
          {
            "en": "Cheesecake Bites"
          },
          {
            "en": "Brownie Bites"
          },
          {
            "en": "Crushed Pistachios"
          },
          {
            "en": "Cookie Dough Bites"
          },
          {
            "en": "Organic Cacao Nibs"
          },
          {
            "en": "Organic Freeze-Dried Strawberry"
          }
        ]
      }
    ]
  },

  creamTop: { title: "Add house-made cream top", price: "3" },

  /* Extra fruit sits under the bowls (website + left TV),
     not with the topping boxes. */
  extraFruit: {
    "title": "Extra fruit",
    "note": "Goes in the middle layer",
    "items": [
      {
        "en": "Strawberry",
        "price": "3"
      },
      {
        "en": "Blueberry",
        "price": "2"
      },
      {
        "en": "Mango",
        "price": "3"
      }
    ]
  },

  /* ---- HOT & FRESH SIDES ---------------------------------- */
  taiyaki: {
    title: "Taiyaki",
    price: "3.00",
    fillings: "Nutella · Red Bean · Custard · Sweet Potato & Cheese · Cheese",
    note: "",
    deals: [
      { qty: "1 piece", price: "3.00" },
      { qty: "5 pieces", price: "12.00" }
    ],
    dealNote: "mix any fillings"
  },

  taiyakiIce: {
    enabled: false,
    title: "Taiyaki Ice Cream",
    price: "5.00",
    note: "flavor of your choice · 1 taiyaki + 1 ice cream scoop · sprinkles · corn flakes"
  },

  dubaiTaiyaki: {
    title: "Dubai Taiyaki",
    price: "5.00",
    note: "Dubai chocolate filling · cacao powder"
  },

  cookie: {
    title: "Dubai Chewy Cookie",
    price: "8.00",
    sub: "real pistachios · kataifi · marshmallows · premium cacao · white chocolate",
    warn: "Contains nuts. Not for nut allergies."
  },

  drinks: {
    title: "Drinks", status: "coming soon",
    list: "Rice Punch Slushy · Injeolmi Shake"
  },

  /* ---- THE VOTE (website only) ----------------------------
     The coming-soon ballot is built from flavors with the
     COMING SOON badge. No separate list to keep in step.       */

  /* ---- HOURS -----------------------------------------------
     `hours` is what people read. `schedule` is the same thing in
     24-hour time so the site can say whether we're open right
     now — keep the two in step.                                */
  hours: [
    { days: "Mon – Thu", time: "5:00 – 10:00" },
    { days: "Fri – Sun", time: "1:00 – 10:00" }
  ],

  /* 0 = Sunday … 6 = Saturday · null = closed all day */
  schedule: {
    0: { open: "13:00", close: "22:00" },
    1: { open: "17:00", close: "22:00" },
    2: { open: "17:00", close: "22:00" },
    3: { open: "17:00", close: "22:00" },
    4: { open: "17:00", close: "22:00" },
    5: { open: "13:00", close: "22:00" },
    6: { open: "13:00", close: "22:00" }
  },

  footer: {
    left: "Real fruit · Cut fresh daily · Made to order",
    disclaimer: "Menu and prices may change at any time — thank you for understanding!",
    right: "sweetsnow.org"
  }
};
