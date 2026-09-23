// Logs a coarse, anonymous visit (city / region / country and which page) so the
// leads page can show a live visitor feed. No IP address is ever stored, no cookies
// are set, and one visit is recorded per browser session rather than per page view.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const KEY = "tracula_visit_logged";

async function place() {
  // Free, keyless lookup. If it fails for any reason we still log the visit.
  try {
    const res = await fetch("https://ipwho.is/?fields=city,region,country,success", { cache: "no-store" });
    const d = await res.json();
    if (d && d.success !== false) {
      return {
        city: String(d.city || "").slice(0, 80),
        region: String(d.region || "").slice(0, 80),
        country: String(d.country || "").slice(0, 80)
      };
    }
  } catch (err) {
    /* falls through to unknown */
  }
  return { city: "", region: "", country: "" };
}

(async () => {
  try {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
  } catch (err) {
    /* private browsing: log the visit anyway */
  }
  try {
    const db = getFirestore(initializeApp(firebaseConfig));
    const where = await place();
    await addDoc(collection(db, "visits"), {
      city: where.city,
      region: where.region,
      country: where.country,
      page: location.pathname.slice(0, 200),
      referrer: (document.referrer || "").slice(0, 200),
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("visit not logged", err);
  }
})();
