/*
 * Family Health Guide — where to buy and which product to pick.
 *
 *  - Nearby grocery stores: OpenStreetMap (Nominatim to find a ZIP/city,
 *    Overpass for shops). Free, no account, no API key.
 *  - Products: Open Food Facts, an open database of packaged foods with
 *    Nutri-Score, NOVA processing level and allergen labels.
 *  - Reviews: there is no free, reliable API for taste reviews, so the app
 *    links out to review searches and keeps the family's own ratings.
 *
 * Network calls only happen when the user asks (Find stores / Compare).
 * Nothing about the family's health is ever sent — only a location and a
 * food name.
 */
(function (root) {
  'use strict';

  var SHOP_TAGS = 'supermarket|grocery|greengrocer|health_food|butcher|seafood|deli|farm';

  // Open Food Facts allergen tags → our allergen keys.
  var OFF_ALLERGENS = {
    'en:peanuts': 'peanut', 'en:nuts': 'treenut', 'en:milk': 'milk', 'en:eggs': 'egg', 'en:gluten': 'wheat',
    'en:soybeans': 'soy', 'en:fish': 'fish', 'en:crustaceans': 'shellfish', 'en:molluscs': 'shellfish', 'en:sesame-seeds': 'sesame'
  };

  function distanceKm(a, b) {
    var R = 6371, toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function getJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('The service answered ' + r.status + '. Try again in a minute.');
      return r.json();
    });
  }

  function currentLocation() {
    return new Promise(function (resolve, reject) {
      if (!root.navigator || !navigator.geolocation) { reject(new Error('Location isn\'t available here — type a ZIP code or city instead.')); return; }
      navigator.geolocation.getCurrentPosition(function (p) {
        resolve({ lat: p.coords.latitude, lon: p.coords.longitude, label: 'your current location' });
      }, function () { reject(new Error('Location permission was denied — type a ZIP code or city instead.')); }, { timeout: 10000, maximumAge: 600000 });
    });
  }

  function geocode(query) {
    return getJSON('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query), { headers: { 'Accept-Language': 'en' } })
      .then(function (res) {
        if (!res.length) throw new Error('Couldn\'t find "' + query + '". Try a ZIP code or "City, State".');
        return { lat: Number(res[0].lat), lon: Number(res[0].lon), label: res[0].display_name.split(',').slice(0, 3).join(',') };
      });
  }

  function storesQuery(loc, radiusM) {
    var r = radiusM || 5000;
    return '[out:json][timeout:25];(' +
      'node["shop"~"' + SHOP_TAGS + '"](around:' + r + ',' + loc.lat + ',' + loc.lon + ');' +
      'way["shop"~"' + SHOP_TAGS + '"](around:' + r + ',' + loc.lat + ',' + loc.lon + ');' +
      ');out center 60;';
  }

  function parseStores(json, loc) {
    var seen = {};
    return (json.elements || []).map(function (e) {
      var t = e.tags || {};
      var lat = e.lat !== undefined ? e.lat : e.center && e.center.lat;
      var lon = e.lon !== undefined ? e.lon : e.center && e.center.lon;
      if (lat === undefined || !t.name) return null;
      var addr = [[t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '), t['addr:city']].filter(Boolean).join(', ');
      return {
        name: t.name, kind: t.shop, lat: lat, lon: lon, address: addr, hours: t.opening_hours || '',
        organic: t.organic === 'yes' || t.organic === 'only' || t.shop === 'health_food',
        km: distanceKm(loc, { lat: lat, lon: lon })
      };
    }).filter(function (s) {
      if (!s) return false;
      var key = s.name + '|' + Math.round(s.lat * 1000) + '|' + Math.round(s.lon * 1000);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).sort(function (a, b) { return a.km - b.km; }).slice(0, 12);
  }

  function nearbyStores(loc, radiusM) {
    return fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(storesQuery(loc, radiusM)), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(function (r) {
        if (!r.ok) throw new Error('The map service is busy (' + r.status + '). Try again in a minute.');
        return r.json();
      })
      .then(function (json) { return parseStores(json, loc); });
  }

  function productQuery(term) {
    return 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n' +
      '&fields=code,product_name,brands,nutriscore_grade,nova_group,allergens_tags,image_small_url,quantity,ingredients_text,nutriments' +
      '&search_terms=' + encodeURIComponent(term);
  }

  var GRADE_RANK = { a: 1, b: 2, c: 3, d: 4, e: 5 };

  function parseProducts(json, memberAllergies) {
    return (json.products || []).filter(function (p) { return p.product_name; }).map(function (p) {
      var allergens = (p.allergens_tags || []).map(function (t) { return OFF_ALLERGENS[t]; }).filter(Boolean);
      var conflicts = allergens.filter(function (a) { return memberAllergies.indexOf(a) !== -1; });
      var n = p.nutriments || {};
      return {
        code: p.code, name: p.product_name, brand: (p.brands || '').split(',')[0], quantity: p.quantity || '',
        nutriscore: (p.nutriscore_grade || '').toLowerCase(), nova: p.nova_group || null, image: p.image_small_url || '',
        allergens: allergens, conflicts: conflicts,
        sugar: n['sugars_100g'], salt: n['salt_100g'], protein: n['proteins_100g'], fiber: n['fiber_100g'],
        url: 'https://world.openfoodfacts.org/product/' + p.code
      };
    }).sort(function (a, b) {
      // Safe for this person first, then healthier Nutri-Score, then less processed.
      return (a.conflicts.length - b.conflicts.length) ||
        ((GRADE_RANK[a.nutriscore] || 9) - (GRADE_RANK[b.nutriscore] || 9)) ||
        ((a.nova || 9) - (b.nova || 9));
    }).slice(0, 12);
  }

  function products(term, memberAllergies) {
    return getJSON(productQuery(term)).then(function (json) { return parseProducts(json, memberAllergies || []); });
  }

  function mapLinks(store) {
    var q = encodeURIComponent(store.name + (store.address ? ', ' + store.address : ''));
    return {
      apple: 'https://maps.apple.com/?q=' + encodeURIComponent(store.name) + '&ll=' + store.lat + ',' + store.lon,
      google: 'https://www.google.com/maps/search/?api=1&query=' + q
    };
  }

  // Where to check stock and price online for an ingredient.
  function retailerLinks(term) {
    var q = encodeURIComponent(term);
    return [
      ['Instacart', 'https://www.instacart.com/store/s?k=' + q],
      ['Walmart', 'https://www.walmart.com/search?q=' + q],
      ['Target', 'https://www.target.com/s?searchTerm=' + q],
      ['Whole Foods', 'https://www.wholefoodsmarket.com/search?text=' + q],
      ['Kroger', 'https://www.kroger.com/search?query=' + q]
    ];
  }

  function reviewLinks(term) {
    var q = encodeURIComponent(term);
    return [
      ['Taste tests', 'https://www.google.com/search?q=' + encodeURIComponent('best ' + term + ' taste test')],
      ['Reddit opinions', 'https://www.reddit.com/search/?q=' + encodeURIComponent('best ' + term + ' brand')],
      ['Consumer Reports', 'https://www.consumerreports.org/search/?query=' + q]
    ];
  }

  var Shop = {
    OFF_ALLERGENS: OFF_ALLERGENS, distanceKm: distanceKm, currentLocation: currentLocation, geocode: geocode,
    storesQuery: storesQuery, parseStores: parseStores, nearbyStores: nearbyStores,
    productQuery: productQuery, parseProducts: parseProducts, products: products,
    mapLinks: mapLinks, retailerLinks: retailerLinks, reviewLinks: reviewLinks
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Shop;
  else root.FHShop = Shop;
})(this);
