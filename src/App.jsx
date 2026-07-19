import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, Star, Phone, Instagram, MapPin, ShieldCheck, X, MessageCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient.js";

const BRAND_NAME = "Fikr Foods";
const WHATSAPP_NUMBER = "919250797667"; 
const FSSAI_NUMBER = "21945678901834"; 
const INSTAGRAM_HANDLE = "@fikrfoods"; 
const PHONE_DISPLAY = "+91 92507 97667"; 
const ADDRESS = "Lucknow, Uttar Pradesh, India"; 

const MAX_QTY = 20;

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#f2f2f2'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='#999' text-anchor='middle' dominant-baseline='middle'>Product Image</text></svg>`
  );

const PRODUCTS = [
  { id: "chickenSamosa", name: "Chicken Samosa", description: "Frozen and filled with juicy chicken", price: 12, veg: false, image: 'img/chickenSamosa.png' },
  { id: "shamikebab", name: "Shami Kebabs", description: "Frozen Chicken Shami Kebab", price: 10, veg: false, image: 'img/shamiKebab.png' },
  { id: "seekhKebab", name: "Seekh Kebab", description: "Frozen Seekh Kebab", price: 20, veg: false, image: 'img/seekhKebab.png' },
  { id: "chickenStick", name: "Chicken Stick", description: "Frozen Chicken Stick", price: 20, veg: false, image: 'img/chickenSticks.png' },
  { id: "russianCutlet", name: "Russian Cutlet", description: "Frozen Russian Cutlet which contains chicken, mashed potatos and veggies", price: 10, veg: false, image: 'img/russianCutlets.png' },
  { id: "doughnut", name: "Doughnut", description: "Freshly made Chocolate Doughnuts", price: 20, veg: false, image: 'img/doughnuts.png' },
  // { id: "", name: "Punjabi Aloo Tikki", description: "Mashed potato patties with roasted cumin, green chilli and coriander. 8 pcs.", price: 99, veg: true, image: PLACEHOLDER_IMG },
  // { id: "galouti", name: "Lucknowi Galouti Kebab", description: "Melt-in-mouth minced mutton kebabs slow-cooked with 24 spices. Pack of 8.", price: 349, veg: false, image: PLACEHOLDER_IMG },
];

const SEED_REVIEWS = [
  { id: "seed-1", name: "Ananya Sharma", rating: 5, text: "The chicken momos are unreal — cook in 6 minutes, taste like a proper Delhi street stall. Ordering weekly now.", created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: "seed-2", name: "Rohit Verma", rating: 4, text: "Paneer tikka is my go-to weekend snack. Marinade is spot on. Wish the pack had one or two more pieces though.", created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "seed-3", name: "Sneha Kapoor", rating: 5, text: "Delivery was quick and everything was rock solid frozen. The galouti kebabs melted in my mouth. Highly recommend!", created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
];

const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

// ============================================================================
// Small shared components
// ============================================================================
function LogoPlaceholder({dark = false}) {
  return (
    <img src='img\Fiक्र.png' alt={`${BRAND_NAME} logo`} style={{ width: '150px', height: '70px' }} className="object-contain" />
  );
}

function LogoPlaceholderfooter({dark = false}) {
  return (
    <img src='img\Fiक्रfooter.png' alt={`${BRAND_NAME} logo`} style={{ width: '150px', height: '70px' }} className="object-contain" />
  );
}

function VegIcon({ veg }) {
  const color = veg ? "#0a8a2f" : "#7a2b17";
  return (
    <span
      title={veg ? "Vegetarian" : "Non-Vegetarian"}
      aria-label={veg ? "Vegetarian" : "Non-Vegetarian"}
      style={{ borderColor: color }}
      className="inline-grid h-4 w-4 place-items-center rounded-[3px] border-2 bg-white shrink-0"
    >
      <span style={{ backgroundColor: color }} className="h-1.5 w-1.5 rounded-full" />
    </span>
  );
}

function ProductImage({ src, alt }) {
  const [broken, setBroken] = useState(false);
  return (
    <img
      src={broken ? PLACEHOLDER_IMG : src}
      onError={() => setBroken(true)}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );
}

function Stars({ value, onChange, size = 20, readOnly = false }) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={readOnly ? "cursor-default" : "cursor-pointer active:scale-90 transition-transform"}
          style={{ lineHeight: 0 }}
        >
          <Star size={size} fill={n <= value ? "#000000" : "none"} stroke="#000000" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function QuantitySelector({ value, onChange }) {
  if (value === 0) {
    return (
      <button
        onClick={() => onChange(1)}
        style={{ backgroundColor: "#C1272D" }}
        className="rounded-full px-5 py-2 text-sm font-semibold text-white active:scale-95 transition-transform"
      >
        Add to cart
      </button>
    );
  }
  return (
    <div style={{ backgroundColor: "#C1272D" }} className="inline-flex items-center gap-1 rounded-full text-white">
      <button
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
        className="w-9 h-9 grid place-items-center rounded-full hover:opacity-80"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label="Increase quantity"
        className="w-9 h-9 grid place-items-center rounded-full hover:opacity-80 disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

// ============================================================================
// Header
// ============================================================================
function Header({ activeSection, scrollToId }) {
  const links = [
    { id: "menu", label: "Menu" },
    { id: "reviews", label: "Reviews" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-5 pb-3">
        <div className="flex flex-col items-center gap-2">
          <LogoPlaceholder size={64} />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{BRAND_NAME}</h1>
          <nav className="mt-2 inline-flex items-center gap-1 rounded-full bg-black p-1.5 text-white shadow-lg">
            {links.map((l) => {
              const active = activeSection === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => scrollToId(l.id)}
                  className="relative rounded-full px-4 sm:px-5 py-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  {l.label}
                  {active && (
                    <span
                      style={{ backgroundColor: "#C1272D" }}
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Menu
// ============================================================================
function MenuSection({ cart, setQty }) {
  return (
    <section id="menu" className="scroll-mt-52 pt-6 sm:pt-10 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Menu</h2>
        <p className="mt-1 text-sm text-black/60">Frozen, ready in minutes. Scroll to explore.</p>
      </div>

      <div className="flex flex-col gap-5">
        {PRODUCTS.map((p) => (
          <article
            key={p.id}
            style={{ minHeight: "min(60vh, 420px)" }}
            className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-black/5">
              <ProductImage src={p.image} alt={p.name} />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-start gap-2">
                <VegIcon veg={p.veg} />
                <h3 className="text-lg sm:text-xl font-bold leading-tight">{p.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-black/70">{p.description}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-xl font-extrabold tabular-nums">{formatINR(p.price)}</span>
                <QuantitySelector value={cart[p.id] ?? 0} onChange={(n) => setQty(p.id, n)} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// Cart footer popup
// ============================================================================
function CartFooter({ count, total, onPlaceOrder }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 sm:px-6 pb-3 sm:pb-5" style={{ pointerEvents: "none" }}>
      <div
        style={{ backgroundColor: "#C1272D", pointerEvents: "auto" }}
        className="mx-auto max-w-2xl flex items-center justify-between gap-3 rounded-3xl px-5 py-4 text-white shadow-2xl"
      >
        <div className="min-w-0 leading-tight">
          <div className="text-xs font-medium opacity-90">
            {count} item{count === 1 ? "" : "s"}
          </div>
          <div className="truncate text-lg font-extrabold tabular-nums">{formatINR(total)}</div>
        </div>
        <button
          onClick={onPlaceOrder}
          style={{ color: "#C1272D" }}
          className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold active:scale-95 transition-transform"
        >
          Place Order →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Order review modal
// ============================================================================
function OrderModal({ cart, onClose }) {
  const [submitting, setSubmitting] = useState(false);

  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter(Boolean);

  const total = items.reduce((sum, { p, qty }) => sum + p.price * qty, 0);

  const handlePlace = () => {
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    const lines = [
      "Name: ",
      ...items.map(({ p, qty }) => `${qty}x ${p.name} - ₹${p.price * qty}`),
      `Total: ₹${total}`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => setSubmitting(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="text-lg font-extrabold">Your Order</h3>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full hover:bg-black/5 text-xl">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-black/60">Your cart is empty. Add some items to get started.</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-3">
                {items.map(({ p, qty }) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 shrink-0 overflow-hidden rounded-xl bg-black/5">
                      <ProductImage src={p.image} alt={p.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <VegIcon veg={p.veg} />
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                      </div>
                      <p className="text-xs text-black/60">{qty} × {formatINR(p.price)}</p>
                    </div>
                    <div className="shrink-0 text-sm font-bold tabular-nums">{formatINR(p.price * qty)}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-black/10 px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-lg font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">{formatINR(total)}</span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-black/60">
                This will open WhatsApp with your order pre-filled — hit send, and also share your live location so we can deliver.
              </p>
              <button
                onClick={handlePlace}
                disabled={submitting}
                className="w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white active:scale-[0.99] transition-opacity disabled:opacity-60"
              >
                {submitting ? "Opening WhatsApp…" : "Place Order via WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Reviews
// ============================================================================
function ReviewsSection() {
  const [reviews, setReviews] = useState(isSupabaseConfigured ? [] : SEED_REVIEWS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState(null);

  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, rating, text, created_at")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setLoadError("Couldn't load reviews. Please refresh.");
      else setReviews(data ?? []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canPost = text.trim().length > 0 && rating > 0;

  const handleSubmitReview = async () => {
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText || rating === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      // No backend configured — keep it in memory only for this session (won't persist for other visitors).
      const localReview = {
        id: `local-${Date.now()}`,
        name: trimmedName,
        rating,
        text: trimmedText,
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [localReview, ...prev]);
      setText("");
      setRating(0);
      setName("");
      setNameModalOpen(false);
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({ name: trimmedName, rating, text: trimmedText })
      .select("id, name, rating, text, created_at")
      .single();

    setSubmitting(false);
    if (error || !data) {
      setSubmitError("Couldn't post your review. Please try again.");
      return;
    }
    setReviews((prev) => [data, ...prev]);
    setText("");
    setRating(0);
    setName("");
    setNameModalOpen(false);
  };

  return (
    <section id="reviews" className="scroll-mt-52 border-t border-black/10 pt-10 pb-10">
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Reviews</h2>
        <p className="mt-1 text-sm text-black/60">What our customers are saying.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-xs text-black/60">
          Reviews are running in demo mode (not saved between visits). Connect Supabase — see{" "}
          <code className="font-mono">src/lib/supabaseClient.js</code> — to make reviews persist for everyone.
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-black/10 bg-white p-5">
        <label className="mb-2 block text-sm font-semibold">Write a review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={4}
          placeholder="Tell others what you loved…"
          className="w-full resize-none rounded-2xl border border-black/15 bg-white p-3 text-sm outline-none focus:border-black"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-black/50">
          <span>Max 500 characters</span>
          <span className="tabular-nums">{text.length}/500</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-black/60">Your rating</p>
            <Stars value={rating} onChange={setRating} />
          </div>
          <button
            disabled={!canPost}
            onClick={() => setNameModalOpen(true)}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white active:scale-95 transition-opacity disabled:opacity-40"
          >
            Post
          </button>
        </div>
        {!canPost && text.length > 0 && rating === 0 && (
          <p className="mt-2 text-xs text-black/40">Select a star rating to post your review.</p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-black/50">Loading reviews…</p>
      ) : loadError ? (
        <p className="text-sm text-black/60">{loadError}</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-black/60">Be the first to leave a review.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-black text-xs font-bold text-white">
                    {r.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-xs text-black/50">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Stars value={r.rating} readOnly size={16} />
              </div>
              <p className="text-sm leading-relaxed text-black/80 break-words">{r.text}</p>
            </li>
          ))}
        </ul>
      )}

      {nameModalOpen && (
        <NameModal
          name={name}
          setName={setName}
          submitting={submitting}
          error={submitError}
          onCancel={() => {
            if (!submitting) {
              setNameModalOpen(false);
              setSubmitError(null);
            }
          }}
          onSubmit={handleSubmitReview}
        />
      )}
    </section>
  );
}

function NameModal({ name, setName, submitting, error, onCancel, onSubmit }) {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const canSubmit = name.trim().length > 0 && !submitting;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-lg font-extrabold">Almost done</h3>
        <p className="mb-4 text-sm text-black/60">What's your name?</p>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 80))}
          placeholder="Your name"
          className="w-full rounded-2xl border border-black/15 bg-white p-3 text-sm outline-none focus:border-black"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) onSubmit();
          }}
        />
        {error && <p className="mt-2 text-xs font-medium" style={{ color: "#C1272D" }}>{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="rounded-full px-5 py-2 text-sm font-semibold text-black/70 hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {submitting ? "Posting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Contact
// ============================================================================
function ContactSection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;
  const igLink = `https://instagram.com/${INSTAGRAM_HANDLE.replace(/^@/, "")}`;
  return (
    <section id="contact" className="scroll-mt-52 bg-black text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-16 text-center">
        <LogoPlaceholderfooter size={72} dark />
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact us</h2>
        <p className="max-w-md text-sm text-white/70">Questions, bulk orders, or feedback? We'd love to hear from you.</p>

        <div className="mt-4 flex flex-col items-center gap-3 text-sm">
          <p className="max-w-xs text-white/80 flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{ADDRESS}</span>
          </p>
          <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-semibold hover:underline flex items-center gap-2">
            <Phone size={16} />
            {PHONE_DISPLAY}
          </a>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black active:scale-95 transition-transform flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
          <a
            href={igLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Instagram size={16} />
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6 text-xs text-white/50 flex flex-col items-center gap-1">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={14} />
            FSSAI Lic. No. {FSSAI_NUMBER}
          </p>
          <p className="mt-4">© {new Date().getFullYear()} {BRAND_NAME}</p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Root App
// ============================================================================
export default function App() {
  const [cart, setCart] = useState({});
  const [activeSection, setActiveSection] = useState("menu");
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const setQty = (id, next) => {
    const clamped = Math.max(0, Math.min(MAX_QTY, next));
    setCart((prev) => {
      const copy = { ...prev };
      if (clamped === 0) delete copy[id];
      else copy[id] = clamped;
      return copy;
    });
  };

  const totalItems = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);
  const totalPrice = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const p = PRODUCTS.find((x) => x.id === id);
        return sum + (p ? p.price * qty : 0);
      }, 0),
    [cart]
  );

  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy to highlight the active nav link
  useEffect(() => {
    const ids = ["menu", "reviews", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black" style={{ paddingBottom: totalItems > 0 ? "6rem" : 0 }}>
      <Header activeSection={activeSection} scrollToId={scrollToId} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <MenuSection cart={cart} setQty={setQty} />
        <ReviewsSection />
      </main>

      <ContactSection />

      {totalItems > 0 && (
        <CartFooter count={totalItems} total={totalPrice} onPlaceOrder={() => setOrderModalOpen(true)} />
      )}

      {orderModalOpen && <OrderModal cart={cart} onClose={() => setOrderModalOpen(false)} />}
    </div>
  );
}
