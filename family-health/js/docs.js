/*
 * Family Health Guide — health records (PDFs, photos of lab reports, notes).
 *
 * Files are kept in the browser's IndexedDB on this device; localStorage is
 * too small for them. Every call returns a Promise.
 */
(function (root) {
  'use strict';

  var DB_NAME = 'family-health-guide-docs';
  var STORE = 'docs';
  var MAX_BYTES = 25 * 1024 * 1024;

  var KINDS = [
    ['lab', 'Lab / blood test report'], ['visit', 'Doctor visit note'], ['prescription', 'Prescription'], ['imaging', 'Scan / imaging report'],
    ['vaccine', 'Vaccine record'], ['allergy', 'Allergy test or action plan'], ['insurance', 'Insurance card'], ['other', 'Other']
  ];

  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!root.indexedDB) { reject(new Error('This browser can\'t store files. Try Safari or Chrome.')); return; }
      var req = root.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var store = req.result.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('memberId', 'memberId');
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(STORE, mode);
        var result = fn(t.objectStore(STORE));
        t.oncomplete = function () { resolve(result && result.result !== undefined ? result.result : result); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }

  function add(memberId, file, meta) {
    if (file.size > MAX_BYTES) return Promise.reject(new Error('That file is over 25 MB. Try a smaller scan or a PDF.'));
    var doc = {
      id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      memberId: memberId,
      title: (meta && meta.title) || file.name,
      kind: (meta && meta.kind) || 'other',
      date: (meta && meta.date) || new Date().toISOString().slice(0, 10),
      note: (meta && meta.note) || '',
      fileName: file.name, type: file.type || 'application/octet-stream', size: file.size,
      addedAt: new Date().toISOString(),
      blob: file
    };
    return tx('readwrite', function (s) { s.put(doc); }).then(function () { return doc; });
  }

  function listFor(memberId) {
    return tx('readonly', function (s) { return s.index('memberId').getAll(memberId); }).then(function (docs) {
      return (docs || []).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    });
  }

  function all() { return tx('readonly', function (s) { return s.getAll(); }); }
  function get(id) { return tx('readonly', function (s) { return s.get(id); }); }
  function remove(id) { return tx('readwrite', function (s) { s.delete(id); }); }
  function removeFor(memberId) {
    return listFor(memberId).then(function (docs) { return Promise.all(docs.map(function (d) { return remove(d.id); })); });
  }

  // For backups: files become data URLs so they fit in one JSON file.
  function toDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
      r.readAsDataURL(blob);
    });
  }

  function exportAll() {
    return all().then(function (docs) {
      return Promise.all((docs || []).map(function (d) {
        return toDataURL(d.blob).then(function (url) {
          var copy = Object.assign({}, d, { data: url });
          delete copy.blob;
          return copy;
        });
      }));
    });
  }

  function importAll(list) {
    return Promise.all((list || []).map(function (d) {
      return fetch(d.data).then(function (r) { return r.blob(); }).then(function (blob) {
        var doc = Object.assign({}, d, { blob: blob });
        delete doc.data;
        return tx('readwrite', function (s) { s.put(doc); });
      });
    }));
  }

  function clear() { return tx('readwrite', function (s) { s.clear(); }); }

  function prettySize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  root.FHDocs = { KINDS: KINDS, add: add, listFor: listFor, all: all, get: get, remove: remove, removeFor: removeFor, exportAll: exportAll, importAll: importAll, clear: clear, prettySize: prettySize };
})(this);
