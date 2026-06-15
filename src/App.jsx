import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

/* ─────────── COLOR SCHEME: CHILI SPICE ─────────── */
const C = {
  dark:        "#38000A",
  mid:         "#9B1313",
  accent:      "#CD1C18",
  light:       "#FFF5F5",
  pink:        "#FFA896",
  pinkLight:   "#FFD6CC",
  pinkDim:     "rgba(255,168,150,0.18)",
  pinkBorder:  "rgba(205,28,24,0.28)",
  glass:       "rgba(56,0,10,0.82)",
  glassBorder: "rgba(205,28,24,0.22)",
  text:        "#38000A",
  textMid:     "rgba(56,0,10,0.70)",
  textSoft:    "rgba(56,0,10,0.45)",
  bg:          "#FFA896",
};

const NAV_ITEMS = ["Home", "About", "Skills", "Projects", "Experience", "Contact"];

const SKILLS = [
  { name: "HTML5",        level: 95, color: "#CD1C18" },
  { name: "CSS3",         level: 90, color: "#9B1313" },
  { name: "JavaScript",   level: 85, color: "#CD1C18" },
  { name: "React",        level: 82, color: "#9B1313" },
  { name: "Tailwind CSS", level: 92, color: "#CD1C18" },
  { name: "Bootstrap",    level: 85, color: "#9B1313" },
  { name: "DOM / jQuery", level: 80, color: "#CD1C18" },
];

const PROJECTS = [
  {
    title: "Food Cart",
    desc: "Online food ordering platform with category filtering, cart management & smooth checkout interactions",
    tags: ["React", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&fit=crop",
    link: "https://foodcart-mu.vercel.app/",
  },
  {
    title: "Hospital Dashboard",
    desc: "Full-featured analytics dashboard with real-time charts, user management panels & KPI widgets",
    tags: ["React", "Tailwind CSS", "Recharts"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3jMwomUEirQ0i-9awahySwtPAasJsE0RGgA&s",
    link: "https://dashboardd-plum.vercel.app/",
  },
  {
    title: "Weather App",
    desc: "Real-time weather dashboard powered by live API — location search, 7-day forecast & dynamic backgrounds",
    tags: ["React", "REST API", "Tailwind"],
    image: "data:image/jpeg;base64,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",
    link: "https://weather-5nje.vercel.app/",
  },
  {
    title: "E-Commerce Store",
    desc: "Modern online shopping experience with product filters, smart cart, wishlist & seamless checkout flow",
    tags: ["React", "Zustand", "Tailwind"],
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&fit=crop",
    link: "https://ecommerceee-pi.vercel.app/",
  },
  {
    title: "Job Portal",
    desc: "Full-featured job board with role-based listings, smart search filters, and one-click application flow",
    tags: ["React", "Tailwind CSS", "REST API"],
    image: "data:image/jpeg;base64,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",
    link: "https://job-rjn5.vercel.app/",
  },
  {
    title: "AI Resume Maker",
    desc: "AI-powered resume builder that generates professional resumes from your input with live preview & PDF export",
    tags: ["React", "AI API", "Tailwind"],
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80&fit=crop",
    link: "https://airesumemaker-xi.vercel.app/",
  },
];

/* ─────────── 3D SCENE ─────────── */
function FloatingOrb({ position, color, speed = 1 }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    mesh.current.rotation.x += 0.003;
    mesh.current.rotation.z += 0.002;
  });
  return (
    <mesh ref={mesh} position={position}>
      <Sphere args={[0.38, 32, 32]}>
        <MeshDistortMaterial color={color} distort={0.4} speed={2.5} roughness={0} metalness={0.6} transparent opacity={0.5} />
      </Sphere>
    </mesh>
  );
}

function HeroRing({ radius, thickness, rx, ry, color, emissive }) {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * rx;
    mesh.current.rotation.y = state.clock.elapsedTime * ry;
  });
  return (
    <mesh ref={mesh}>
      <Torus args={[radius, thickness, 16, 120]}>
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.0} transparent opacity={0.65} />
      </Torus>
    </mesh>
  );
}

function CoreSphere() {
  const mesh = useRef();
  const { mouse } = useThree();
  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.y = mouse.x * 0.5;
    mesh.current.rotation.x = mouse.y * 0.3;
  });
  return (
    <mesh ref={mesh}>
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial color={C.accent} distort={0.5} speed={3} roughness={0} metalness={0.5} emissive={C.dark} emissiveIntensity={0.2} />
      </Sphere>
    </mesh>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} color={C.accent} intensity={3} />
      <pointLight position={[-5, -5, -5]} color={C.pink} intensity={1.5} />
      <pointLight position={[0, 3, 3]} color="#ffffff" intensity={0.8} />
      <CoreSphere />
      <HeroRing radius={2.4} thickness={0.02} rx={0.3} ry={0.2} color={C.accent} emissive={C.accent} />
      <HeroRing radius={3.5} thickness={0.015} rx={-0.2} ry={0.15} color={C.pink} emissive={C.mid} />
      <FloatingOrb position={[3, 1, -2]} color={C.accent} speed={0.9} />
      <FloatingOrb position={[-3, -1, -3]} color={C.pink} speed={1.1} />
      <FloatingOrb position={[2.5, -2, -1]} color={C.mid} speed={0.7} />
    </>
  );
}

/* ─────────── SCROLL TO TOP ─────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.12, boxShadow: `0 0 32px rgba(205,28,24,0.5)` }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 9000,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accent}, ${C.mid})`,
            border: `2px solid rgba(255,168,150,0.4)`,
            boxShadow: `0 4px 24px rgba(205,28,24,0.35)`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "1.2rem",
          }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─────────── CURSOR ─────────── */
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    let raf, mx = 0, my = 0, rx = 0, ry = 0;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx - 18}px,${ry - 18}px)`;
      raf = requestAnimationFrame(tick);
    };
    const over = (e) => { if (e.target.closest("button,a,[data-hov]")) setHov(true); };
    const out = () => setHov(false);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{ width: 10, height: 10, background: C.accent, boxShadow: `0 0 14px ${C.accent}` }} />
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          width: hov ? 52 : 36, height: hov ? 52 : 36,
          border: `1.5px solid ${hov ? C.accent : C.accent + "66"}`,
          transition: "width .25s ease,height .25s ease,border-color .25s ease",
        }} />
    </>
  );
}

/* ─────────── NAVBAR ─────────── */
function Navbar({ active }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 999, width: "92%", maxWidth: 900 }}
    >
      <div style={{
        padding: "12px 24px",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(255,245,245,0.97)" : "rgba(255,245,245,0.88)",
        backdropFilter: "blur(28px)",
        border: `1px solid rgba(205,28,24,0.22)`,
        boxShadow: scrolled ? `0 8px 40px rgba(205,28,24,0.12)` : "0 2px 16px rgba(56,0,10,0.1)",
        transition: "all 0.4s ease",
      }}>
        <motion.div whileHover={{ scale: 1.05 }}
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: C.accent, cursor: "pointer", letterSpacing: "0.05em", fontWeight: 700 }}
          onClick={() => go("home")}>
          Aiman<span style={{ color: C.dark }}>.</span>
        </motion.div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
          {NAV_ITEMS.map((item) => (
            <motion.button key={item} data-hov whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => go(item.toLowerCase())}
              style={{
                padding: "7px 16px",
                borderRadius: 12,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 600,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                color: active === item.toLowerCase() ? C.accent : C.textMid,
                background: active === item.toLowerCase() ? "rgba(205,28,24,0.08)" : "transparent",
                border: active === item.toLowerCase() ? `1px solid rgba(205,28,24,0.28)` : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
              {item}
            </motion.button>
          ))}
        </div>

        {/* Hamburger */}
        <button className="show-mobile" onClick={() => setOpen(!open)}
          style={{ padding: 8, background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <motion.div key={i} style={{ width: 22, height: 2, borderRadius: 2, background: C.accent }}
              animate={{
                rotate: open && i === 0 ? 45 : open && i === 2 ? -45 : 0,
                y: open && i === 0 ? 7 : open && i === 2 ? -7 : 0,
                opacity: open && i === 1 ? 0 : 1,
              }} transition={{ duration: 0.25 }} />
          ))}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.94 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: 8, borderRadius: 20, padding: 12,
              background: "rgba(255,245,245,0.97)", backdropFilter: "blur(28px)",
              border: `1px solid rgba(205,28,24,0.22)`,
            }}>
            {NAV_ITEMS.map((item) => (
              <button key={item} onClick={() => go(item.toLowerCase())}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 16px", borderRadius: 12,
                  fontFamily: "'Lato', sans-serif", fontWeight: 600,
                  color: C.textMid, background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.9rem", marginBottom: 4,
                }}>
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─────────── TYPEWRITER ─────────── */
function TypeWriter({ texts, speed = 70 }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = texts[idx];
    const t = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) { setDisplay(cur.slice(0, ci + 1)); setCi((c) => c + 1); }
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (ci > 0) { setDisplay(cur.slice(0, ci - 1)); setCi((c) => c - 1); }
        else { setDel(false); setIdx((i) => (i + 1) % texts.length); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [ci, del, idx, texts, speed]);

  return (
    <span>
      {display}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
        style={{ color: C.accent }}>|</motion.span>
    </span>
  );
}

/* ─────────── SECTION ─────────── */
function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ position: "relative", minHeight: "100vh", padding: "96px 16px 64px", ...style }}>
      {children}
    </section>
  );
}

/* ─────────── GLASS CARD ─────────── */
function GCard({ children, className = "", style = {}, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4, transition: { duration: 0.3 } } : {}}
      style={{
        borderRadius: 20,
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid rgba(205,28,24,0.15)`,
        boxShadow: "0 4px 28px rgba(56,0,10,0.10)",
        ...style,
      }}>
      {children}
    </motion.div>
  );
}

/* ─────────── SECTION HEADER ─────────── */
function SectionHeader({ eyebrow, title, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: "center", marginBottom: 64 }}>
      <span style={{
        fontFamily: "'Lato', sans-serif", fontSize: "0.72rem", letterSpacing: "0.35em",
        textTransform: "uppercase", color: C.accent, display: "block", marginBottom: 12, fontWeight: 700,
      }}>{eyebrow}</span>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 700,
        fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "0.02em",
        background: `linear-gradient(135deg, ${C.dark}, ${C.accent})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{title}</h2>
      {sub && <p style={{ marginTop: 12, fontSize: "0.9rem", color: C.textSoft, fontFamily: "'Lato', sans-serif" }}>{sub}</p>}
    </motion.div>
  );
}

/* ─────────── HERO ─────────── */
function Hero() {
  const { scrollY } = useScroll();
  const rawY = useTransform(scrollY, [0, 600], [0, -140]);
  const rawOp = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useSpring(rawY, { stiffness: 80, damping: 20 });
  const op = useSpring(rawOp, { stiffness: 80, damping: 20 });

  return (
    <Section id="home" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* 3D BG */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <HeroScene />
        </Canvas>
      </div>

      {/* Soft overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(255,168,150,0.45)", pointerEvents: "none" }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(205,28,24,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(205,28,24,0.06) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,168,150,0.3) 0%, transparent 70%)",
      }} />

      <motion.div style={{ y, opacity: op, position: "relative", zIndex: 10, textAlign: "center", maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 50, marginBottom: 32,
            background: "rgba(255,245,245,0.55)", border: `1px solid rgba(205,28,24,0.3)`,
            backdropFilter: "blur(14px)",
          }}>
          <motion.span animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, display: "block" }} />
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.3em", color: C.accent }}>
            FRONTEND DEVELOPER · PAKISTAN
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1 initial={{ opacity: 0, y: 55 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, marginBottom: 16,
            fontSize: "clamp(3rem, 10vw, 7rem)" }}>
          <span style={{ display: "block", color: C.dark }}>Aiman</span>
          <span style={{
            display: "block",
            background: `linear-gradient(120deg, ${C.accent} 0%, ${C.mid} 50%, ${C.dark} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Shafiq</span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.7 }}
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1rem, 3vw, 1.8rem)", color: C.textMid, marginBottom: 20, fontStyle: "italic" }}>
          <TypeWriter texts={["Frontend Developer", "React Specialist", "UI/UX Enthusiast", "Creative Coder"]} />
        </motion.div>

        {/* Tagline */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.85 }}
          style={{ color: C.textSoft, maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.8, fontSize: "0.95rem", fontFamily: "'Lato', sans-serif" }}>
          Crafting pixel-perfect, high-performance web experiences that leave an impression.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.75 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          {[
            { label: "View My Work", primary: true, target: "projects" },
            { label: "Get In Touch", primary: false, target: "contact" },
          ].map((btn) => (
            <motion.button key={btn.label} data-hov
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.94 }}
              onClick={() => document.getElementById(btn.target)?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "14px 28px", borderRadius: 14, fontFamily: "'Lato', sans-serif",
                fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", cursor: "pointer",
                background: btn.primary ? `linear-gradient(135deg, ${C.accent}, ${C.mid})` : "rgba(255,245,245,0.7)",
                color: btn.primary ? "#fff" : C.accent,
                border: btn.primary ? "none" : `1.5px solid ${C.accent}`,
                boxShadow: btn.primary ? `0 0 36px rgba(205,28,24,0.35)` : "none",
              }}>
              {btn.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tech pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.6 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {["React", "JavaScript", "HTML5", "Tailwind", "Bootstrap", "DOM"].map((t, i) => (
            <motion.span key={t}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: "0.65rem", fontFamily: "'Lato', sans-serif",
                fontWeight: 700, letterSpacing: "0.1em",
                background: "rgba(255,255,255,0.55)", border: `1px solid rgba(205,28,24,0.25)`,
                color: C.textMid, backdropFilter: "blur(10px)",
              }}>
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.3em", color: C.textSoft }}>SCROLL</span>
        <motion.div animate={{ y: [0, 9, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }}
          style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${C.accent}, transparent)` }} />
      </motion.div>
    </Section>
  );
}

/* ─────────── ABOUT ─────────── */
function About() {
  const stats = [
    { label: "Projects Deployed", value: "5+" },
    { label: "Technologies", value: "8" },
    { label: "Training", value: "6Mo" },
    { label: "Semester", value: "4th" },
  ];

  return (
    <Section id="about">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="About Me" title="Who Am I?" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, alignItems: "start" }}>
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -55 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}>
            <GCard style={{ padding: 32 }}>
              <div style={{ position: "relative", marginBottom: 24, display: "inline-block" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `linear-gradient(135deg, rgba(205,28,24,0.15), rgba(255,168,150,0.25))`,
                  border: `2px solid rgba(205,28,24,0.28)`, color: C.accent,
                  fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem",
                }}>AS</div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: -8, borderRadius: 24, border: `1px dashed rgba(205,28,24,0.35)` }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem", color: C.dark, marginBottom: 4 }}>
                Aiman Shafiq
              </h3>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.72rem", letterSpacing: "0.15em", marginBottom: 20 }}>
                FRONTEND WEB DEVELOPER · PAKISTAN
              </p>
              <p style={{ lineHeight: 1.9, fontSize: "0.9rem", color: C.textMid, marginBottom: 24, fontFamily: "'Lato', sans-serif" }}>
                Passionate Frontend Developer with strong hands-on knowledge of HTML, CSS, JavaScript, DOM, Bootstrap, Tailwind, and React. Dedicated to creating responsive, visually stunning and high-performance web experiences.
              </p>
              {[
                { label: "EDUCATION", value: "BSIT (Affiliated) — 4th Semester" },
                { label: "TRAINING", value: "Corvit Systems — Front-End Dev (6 Months)" },
                { label: "LOCATION", value: "Pakistan Mint, Pakistan 🇵🇰" },
                { label: "EMAIL", value: "aimanmalik3447@gmail.com" },
                { label: "PHONE", value: "+92 319 1080021" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 800, color: C.accent, fontSize: "0.6rem", letterSpacing: "0.15em", flexShrink: 0, marginTop: 2 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: C.textSoft, fontFamily: "'Lato', sans-serif" }}>{item.value}</span>
                </div>
              ))}
            </GCard>
          </motion.div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: i * 0.1 }}>
                  <GCard style={{ padding: 20, textAlign: "center" }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "2rem", marginBottom: 4,
                      background: `linear-gradient(135deg, ${C.accent}, ${C.mid})`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>{s.value}</div>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.textSoft, fontSize: "0.62rem", letterSpacing: "0.12em" }}>
                      {s.label.toUpperCase()}
                    </div>
                  </GCard>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, x: 55 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.95, delay: 0.28 }}>
              <GCard style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", background: "rgba(205,28,24,0.08)", border: `1px solid rgba(205,28,24,0.2)` }}>🎓</div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.dark, fontSize: "1rem" }}>Corvit Systems</div>
                    <div style={{ fontFamily: "'Lato', sans-serif", color: C.textSoft, fontSize: "0.72rem" }}>Front-End Development Training · 6 Months</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["HTML5", "CSS3", "JavaScript", "Bootstrap", "Tailwind", "React", "DOM", "jQuery"].map((t) => (
                    <span key={t} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: "0.62rem",
                      fontFamily: "'Lato', sans-serif", fontWeight: 700, letterSpacing: "0.08em",
                      background: "rgba(205,28,24,0.07)", border: `1px solid rgba(205,28,24,0.25)`, color: C.accent,
                    }}>{t}</span>
                  ))}
                </div>
              </GCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 55 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.95, delay: 0.38 }}>
              <GCard style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", background: "rgba(205,28,24,0.06)", border: `1px solid rgba(205,28,24,0.18)` }}>📚</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.dark, fontSize: "1rem" }}>Academic Background</div>
                </div>
                {["BSIT (Affiliated) — Ongoing", "F.Sc (Pre-Engineering) — 2024, Govt. Women College Bagbanpura", "Matriculation — 2022"].map((e) => (
                  <div key={e} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: "0.85rem", color: C.textMid, fontFamily: "'Lato', sans-serif" }}>{e}</span>
                  </div>
                ))}
              </GCard>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── SKILLS ─────────── */
function Skills() {
  return (
    <Section id="skills">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionHeader eyebrow="Skills" title="Tech Arsenal" sub="Technologies I wield to build exceptional digital experiences" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {SKILLS.map((skill, i) => (
            <motion.div key={skill.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -35 : 35 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.09 }}
              style={{
                padding: 20, borderRadius: 16,
                background: "rgba(255,255,255,0.55)", border: "1px solid rgba(205,28,24,0.14)", backdropFilter: "blur(14px)",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.dark, fontSize: "0.95rem" }}>
                  {skill.name}
                </span>
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.8rem" }}>
                  {skill.level}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(205,28,24,0.08)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: i * 0.1, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.mid})`, boxShadow: `0 0 10px rgba(205,28,24,0.4)` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─────────── PROJECTS ─────────── */
function ProjectCard({ project, index }) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 65 }}
      whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.85, delay: index * 0.1 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      data-hov style={{ cursor: "pointer" }}
    >
      <motion.div animate={{ y: hov ? -8 : 0 }} transition={{ duration: 0.35 }}
        style={{
          borderRadius: 20, overflow: "hidden",
          background: "rgba(255,255,255,0.6)",
          border: `1px solid ${hov ? C.accent + "55" : "rgba(205,28,24,0.14)"}`,
          backdropFilter: "blur(20px)",
          boxShadow: hov ? `0 20px 60px rgba(205,28,24,0.18)` : "0 2px 18px rgba(56,0,10,0.08)",
          transition: "all 0.38s cubic-bezier(.16,1,.3,1)",
        }}>
        {/* Image */}
        <div style={{ height: 176, overflow: "hidden", position: "relative" }}>
          <motion.img
            src={project.image}
            alt={project.title}
            animate={{ scale: hov ? 1.08 : 1 }}
            transition={{ duration: 0.55 }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.background = "#FFD6CC"; e.target.style.display = "none"; e.target.parentElement.style.background = "#FFD6CC"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: hov
              ? "linear-gradient(to top, rgba(56,0,10,0.6) 0%, rgba(56,0,10,0.05) 60%)"
              : "linear-gradient(to top, rgba(56,0,10,0.5) 0%, rgba(56,0,10,0.15) 100%)",
            transition: "all 0.35s ease",
          }} />
          <motion.div animate={{ scaleX: hov ? 1 : 0, opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, originX: 0,
              background: `linear-gradient(90deg, ${C.accent}, transparent)` }} />
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.05rem", marginBottom: 8,
            color: hov ? C.accent : C.dark, transition: "color 0.3s",
          }}>{project.title}</h3>
          <p style={{ fontSize: "0.82rem", color: C.textSoft, lineHeight: 1.7, marginBottom: 16, fontFamily: "'Lato', sans-serif" }}>{project.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{
                padding: "3px 10px", borderRadius: 6, fontSize: "0.6rem",
                fontFamily: "'Lato', sans-serif", fontWeight: 700, letterSpacing: "0.08em",
                background: "rgba(205,28,24,0.07)", border: `1px solid rgba(205,28,24,0.22)`, color: C.accent,
              }}>{tag}</span>
            ))}
          </div>
          <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            animate={{ opacity: hov ? 1 : 0.55, x: hov ? 4 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: C.accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            VIEW PROJECT →
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Projects() {
  return (
    <Section id="projects">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Projects" title="My Work" sub="Hand-crafted projects that showcase real skills" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {PROJECTS.map((project, i) => <ProjectCard key={project.title} project={project} index={i} />)}
        </div>
      </div>
    </Section>
  );
}

/* ─────────── EXPERIENCE ─────────── */
function Experience() {
  const bullets = [
    "Developed responsive websites from scratch using HTML, CSS, JavaScript, DOM, Bootstrap, Tailwind, React",
    "Built reusable React component architectures with clean state management",
    "Implemented UI/UX improvements for better accessibility and user experience",
    "Gained hands-on experience in debugging, testing & cross-browser compatibility",
    "Collaborated with a team to deliver real-world web projects on time",
  ];

  return (
    <Section id="experience">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionHeader eyebrow="Experience" title="My Journey" />
        <div style={{ position: "relative" }}>
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 1, transformOrigin: "top",
              background: `linear-gradient(to bottom, ${C.accent}, transparent)` }} />

          <motion.div initial={{ opacity: 0, x: -45 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.95 }} style={{ paddingLeft: 64, position: "relative", marginBottom: 24 }}>
            <motion.div animate={{ scale: [1, 1.5, 1], boxShadow: [`0 0 18px ${C.accent}55`, `0 0 32px ${C.accent}88`, `0 0 18px ${C.accent}55`] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: "absolute", left: 16, top: 20, width: 16, height: 16, borderRadius: "50%", transform: "translateX(-50%)", background: C.accent }} />
            <GCard style={{ padding: 24 }} hover={false}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.dark, fontSize: "1.1rem", marginBottom: 4 }}>
                    Front-End Development Training
                  </h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                      Corvit Systems
                    </span>
                    <span style={{ color: C.textSoft }}>·</span>
                    <span style={{ fontSize: "0.8rem", color: C.textSoft, fontFamily: "'Lato', sans-serif" }}>6 Months</span>
                  </div>
                </div>
                <span style={{
                  padding: "4px 14px", borderRadius: 50, fontFamily: "'Lato', sans-serif", fontWeight: 700,
                  fontSize: "0.62rem", letterSpacing: "0.12em",
                  background: "rgba(205,28,24,0.08)", border: `1px solid rgba(205,28,24,0.22)`, color: C.accent,
                }}>COMPLETED</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bullets.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 8, boxShadow: `0 0 7px ${C.accent}` }} />
                    <span style={{ fontSize: "0.88rem", color: C.textMid, fontFamily: "'Lato', sans-serif", lineHeight: 1.7 }}>{b}</span>
                  </motion.div>
                ))}
              </div>
            </GCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -45 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.95, delay: 0.2 }} style={{ paddingLeft: 64, position: "relative" }}>
            <div style={{ position: "absolute", left: 16, top: 20, width: 16, height: 16, borderRadius: "50%", transform: "translateX(-50%)", background: C.pink, boxShadow: `0 0 16px rgba(255,168,150,0.5)` }} />
            <GCard style={{ padding: 24 }} hover={false}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.dark, fontSize: "1.1rem", marginBottom: 4 }}>
                BSIT (Affiliated)
              </h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.accent, fontSize: "0.75rem" }}>Currently Enrolled</span>
                <span style={{ color: C.textSoft }}>·</span>
                <span style={{ fontSize: "0.8rem", color: C.textSoft, fontFamily: "'Lato', sans-serif" }}>4th Semester · Ongoing</span>
              </div>
            </GCard>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── CONTACT ─────────── */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const inputStyle = (name) => ({
    background: focused === name ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
    border: `1px solid ${focused === name ? C.accent : "rgba(205,28,24,0.20)"}`,
    borderRadius: 12, padding: "12px 16px",
    color: C.dark, fontSize: "0.88rem", outline: "none", width: "100%",
    transition: "all 0.3s ease",
    boxShadow: focused === name ? `0 0 22px rgba(205,28,24,0.10)` : "none",
    fontFamily: "'Lato', sans-serif",
  });

  const contacts = [
    { icon: "📞", label: "PHONE", value: "+92 319 1080021" },
    { icon: "✉️", label: "EMAIL", value: "aimanmalik3447@gmail.com" },
    { icon: "📍", label: "LOCATION", value: "Pakistan Mint, Pakistan" },
  ];

  return (
    <Section id="contact">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader eyebrow="Contact" title="Get In Touch" sub="Let's build something extraordinary together" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {contacts.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, x: -35 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.12 }}>
                <GCard style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", background: "rgba(205,28,24,0.08)", border: `1px solid rgba(205,28,24,0.2)`, flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 800, color: C.accent, fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: "0.9rem", color: C.dark, fontFamily: "'Lato', sans-serif" }}>{c.value}</div>
                  </div>
                </GCard>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, x: 45 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.95 }}>
            <GCard style={{ padding: 28 }} hover={false}>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.78 }} transition={{ duration: 0.45 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center", gap: 16 }}>
                    <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6 }} style={{ fontSize: "3rem" }}>✅</motion.div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: C.accent }}>Message Sent!</div>
                    <p style={{ fontSize: "0.9rem", color: C.textSoft, fontFamily: "'Lato', sans-serif" }}>I'll get back to you shortly.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      {["name", "email"].map((f) => (
                        <input key={f} name={f} value={form[f]} onChange={handle}
                          onFocus={() => setFocused(f)} onBlur={() => setFocused(null)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                          style={inputStyle(f)} />
                      ))}
                    </div>
                    <input name="subject" value={form.subject} onChange={handle}
                      onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                      placeholder="Subject" style={{ ...inputStyle("subject"), marginBottom: 12, display: "block" }} />
                    <textarea name="message" value={form.message} onChange={handle}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                      placeholder="Your message..." rows={4}
                      style={{ ...inputStyle("message"), resize: "none", marginBottom: 20, display: "block" }} />
                    <motion.button data-hov
                      whileHover={{ scale: 1.03, boxShadow: `0 0 40px rgba(205,28,24,0.35)` }}
                      whileTap={{ scale: 0.96 }} onClick={submit}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 12,
                        fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.18em",
                        background: `linear-gradient(135deg, ${C.accent}, ${C.mid})`,
                        color: "#fff", border: "none", cursor: "pointer",
                        boxShadow: `0 0 28px rgba(205,28,24,0.2)`,
                      }}>
                      SEND MESSAGE →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GCard>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer style={{ position: "relative", padding: "40px 16px", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.accent}55, transparent)` }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", marginBottom: 8,
        background: `linear-gradient(135deg, ${C.accent}, ${C.dark})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Aiman Shafiq
      </div>
      <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.textSoft, fontSize: "0.72rem", letterSpacing: "0.2em" }}>
        © 2025 · CRAFTED WITH ♥ IN PAKISTAN
      </p>
    </footer>
  );
}

/* ─────────── PARTICLES ─────────── */
function Particles() {
  const particles = useState(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      color: i % 3 === 0 ? C.accent : i % 3 === 1 ? C.pink : C.mid,
      duration: 4 + Math.random() * 5,
      delay: Math.random() * 7,
    }))
  )[0];

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <motion.div key={p.id} style={{
          position: "absolute", borderRadius: "50%",
          width: p.size, height: p.size,
          left: p.left, top: p.top,
          background: p.color, opacity: 0.2,
        }}
          animate={{ y: [0, -(90 + Math.random() * 100)], opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

/* ─────────── SECTION TRACKER ─────────── */
function useSectionTracker() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.35 }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.toLowerCase());
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return active;
}

/* ─────────── APP ─────────── */
export default function App() {
  const active = useSectionTracker();

  return (
    <div style={{
      background: C.bg,
      backgroundImage: `linear-gradient(135deg, #FFA896 0%, #FFD6CC 40%, #FFF5F5 70%, #FFA896 100%)`,
      minHeight: "100vh", color: C.text, cursor: "none", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #FFA896; }
        ::-webkit-scrollbar-thumb { background: rgba(205,28,24,0.45); border-radius: 2px; }
        ::selection { background: rgba(205,28,24,0.18); color: #38000A; }
        input::placeholder, textarea::placeholder { color: rgba(56,0,10,0.3); }
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          section { padding-top: 5rem !important; padding-left: 1rem !important; padding-right: 1rem !important; }
        }
      `}</style>

      <Cursor />
      <Particles />
      <Navbar active={active} />
      <ScrollToTop />

      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}