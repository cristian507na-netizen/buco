'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})

const css = `
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
:root {
  --off-white: #F8F7F5;
  --gray-light: #E8E6E1;
  --gray-mid: #9B9690;
  --gray-dark: #4A4845;
  --black: #1A1917;
  --blue: #2563EB;
  --blue-light: #60A5FA;
}
.lp-root {
  font-family: var(--font-dm), 'DM Sans', sans-serif;
  background: var(--off-white);
  color: var(--black);
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* ===== NAVBAR ===== */
.lp-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 48px;
  transition: background 0.5s, backdrop-filter 0.5s, box-shadow 0.5s;
}
.lp-nav.scrolled {
  background: rgba(248,247,245,0.88);
  backdrop-filter: blur(24px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}
.nav-logo {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--black);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-logo-badge {
  font-family: var(--font-dm), 'DM Sans', sans-serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--blue);
  border: 1px solid rgba(37,99,235,0.35);
  background: rgba(37,99,235,0.07);
  padding: 3px 8px;
  border-radius: 4px;
}
.nav-buttons { display: flex; gap: 10px; align-items: center; }

@keyframes shimmer2 {
  0% { background-position: 200% 0%; }
  100% { background-position: -200% 0%; }
}
.shimmer-btn {
  display: inline-flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.18);
  background: linear-gradient(110deg, rgba(255,255,255,0.55) 25%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.55) 75%);
  background-size: 400% 100%;
  animation: shimmer2 3s infinite linear;
  padding: 0 22px;
  font-family: var(--font-dm), 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--black);
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  backdrop-filter: blur(12px);
}
.shimmer-btn:hover {
  border-color: rgba(0,0,0,0.3);
  box-shadow: 0 2px 14px rgba(0,0,0,0.12);
}
.shimmer-btn.primary {
  background: linear-gradient(110deg, #1D4ED8 25%, #3B82F6 50%, #1D4ED8 75%);
  background: var(--blue);
  border: none;
  color: white;
  font-weight: 600;
}
.shimmer-btn.primary:hover {
  box-shadow: 0 2px 20px rgba(37,99,235,0.35);
}

/* ===== NAVBAR ===== */
.lp-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 56px;
  z-index: 100;
  transition: all 0.3s ease;
  background: rgba(248,247,245,0.01);
  backdrop-filter: blur(0px);
}
.lp-nav.scrolled {
  background: rgba(248,247,245,0.85);
  backdrop-filter: blur(12px);
  padding: 16px 56px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.03);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-logo {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-weight: 800;
  font-size: 24px;
  color: var(--black);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-logo-badge {
  font-size: 10px;
  background: var(--blue);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-dm), 'DM Sans', sans-serif;
  letter-spacing: 1px;
}
.nav-buttons { display: flex; gap: 12px; align-items: center; }

/* ===== HERO ===== */
.lp-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
  background: #F8F7F5;
  display: flex;
  align-items: center;
}
.hero-visuals {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}
#fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* Light rays - more subtle & premium */
.light-ray {
  position: absolute;
  top: -10%;
  left: -5%;
  width: 450px;
  height: 120vh;
  background: linear-gradient(172deg,
    rgba(255,255,255,0) 0%,
    rgba(255,250,230,0.18) 30%,
    rgba(255,255,255,0) 100%
  );
  transform: rotate(18deg);
  z-index: 3;
  pointer-events: none;
  mix-blend-mode: screen;
  filter: blur(40px);
  animation: rayPulse 10s ease-in-out infinite;
}
.light-ray-2 {
  position: absolute;
  top: -5%;
  right: 15%;
  width: 300px;
  height: 100vh;
  background: linear-gradient(168deg,
    rgba(255,255,255,0) 0%,
    rgba(200,220,255,0.1) 40%,
    rgba(255,255,255,0) 100%
  );
  transform: rotate(-12deg);
  z-index: 3;
  pointer-events: none;
  mix-blend-mode: screen;
  filter: blur(50px);
  animation: rayPulse 12s 2s ease-in-out infinite;
}
@keyframes rayPulse {
  0%,100% { opacity: 0.3; transform: rotate(18deg) scaleX(1); }
  50% { opacity: 0.7; transform: rotate(19deg) scaleX(1.1); }
}

/* Halos - layered for "magical" glow around original logo */
.b-halo {
  position: absolute;
  left: 21%;
  top: 42.5%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 3;
  mix-blend-mode: screen;
  filter: blur(20px);
  animation: haloPulse 4s ease-in-out infinite;
}
.b-halo-2 {
  position: absolute;
  left: 21%;
  top: 42.5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 75%);
  transform: translate(-50%, -50%);
  z-index: 3;
  mix-blend-mode: overlay;
  filter: blur(40px);
  animation: haloPulse 6s 1s ease-in-out infinite;
}
.b-floor-glow {
  position: absolute;
  left: 21%;
  top: 73%;
  width: 400px;
  height: 120px;
  background: radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 3;
  mix-blend-mode: screen;
  filter: blur(15px);
  animation: haloPulse 5s 1.5s ease-in-out infinite;
}
@keyframes haloPulse {
  0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
}

/* Better Overlay — immersive right-side fade */
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: linear-gradient(
    to right,
    rgba(248,247,245,0) 0%,
    rgba(248,247,245,0.2) 30%,
    rgba(248,247,245,0.85) 60%,
    #F8F7F5 85%
  );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 15;
  margin-left: auto;
  width: 45%;
  padding: 0 84px 0 24px;
  animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes heroFadeIn {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.12);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: var(--blue);
  margin-bottom: 28px;
  letter-spacing: 0.5px;
}
.hero-tag-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--blue);
  animation: dotPulse 2s infinite;
}
@keyframes dotPulse {
  0%,100% { opacity:1; transform:scale(1); box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
  50% { opacity:0.7; transform:scale(0.8); box-shadow: 0 0 0 6px rgba(37,99,235,0); }
}
.hero-title {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: clamp(38px, 4vw, 64px);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -1px; /* Relaxed from -2px */
  color: var(--black);
  margin-bottom: 20px;
}
.hero-title em {
  font-style: italic;
  color: var(--blue);
}
.hero-desc {
  font-size: clamp(14px, 1.3vw, 17px);
  line-height: 1.75;
  color: var(--gray-dark);
  max-width: 400px;
  margin-bottom: 36px;
}
.hero-desc strong { color: var(--black); font-weight: 600; }
.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-black {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--black);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn-black:hover {
  background: #2a2826;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: transparent;
  color: var(--black);
  border: 1.5px solid rgba(0,0,0,0.18);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}
.btn-outline:hover { border-color: var(--black); transform: translateY(-2px); }
.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  animation: scrollBounce 2.2s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%,100% { transform: translateX(-50%) translateY(0); opacity:0.35; }
  50% { transform: translateX(-50%) translateY(7px); opacity:0.6; }
}
.scroll-hint span {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gray-dark);
}
.scroll-arrow {
  width: 18px; height: 18px;
  border-right: 1.5px solid var(--gray-dark);
  border-bottom: 1.5px solid var(--gray-dark);
  transform: rotate(45deg);
  margin-top: -6px;
}

/* ===== SOBRE NOSOTROS ===== */
.lp-about {
  background: var(--off-white);
  padding: 130px 0 110px;
  position: relative;
  overflow: hidden;
}
.about-bg-text {
  position: absolute;
  top: 30px; left: -10px;
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: clamp(90px, 16vw, 200px);
  font-weight: 900;
  color: rgba(0,0,0,0.025);
  white-space: nowrap;
  pointer-events: none;
  letter-spacing: -6px;
  line-height: 1;
  user-select: none;
}
.about-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 56px;
}
.about-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 88px;
  align-items: start;
  margin-bottom: 80px;
}
.about-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--blue);
  margin-bottom: 18px;
}
.about-title {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: clamp(30px, 3.2vw, 50px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: var(--black);
  margin-bottom: 24px;
}
.about-title em { font-style: italic; color: var(--blue); }
.about-desc {
  font-size: 16px;
  line-height: 1.78;
  color: var(--gray-dark);
  margin-bottom: 18px;
}
.about-right { padding-top: 48px; }
.about-stat {
  border-top: 1px solid var(--gray-light);
  padding: 22px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.about-stat:last-child { border-bottom: 1px solid var(--gray-light); }
.stat-num {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: 44px;
  font-weight: 900;
  color: var(--black);
  letter-spacing: -2px;
  line-height: 1;
}
.stat-label {
  font-size: 13px;
  color: var(--gray-mid);
  max-width: 155px;
  text-align: right;
  line-height: 1.45;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  border-top: 1px solid var(--gray-light);
  border-left: 1px solid var(--gray-light);
}
.feature-cell {
  border-right: 1px solid var(--gray-light);
  border-bottom: 1px solid var(--gray-light);
  padding: 38px 32px;
  transition: background 0.25s;
  cursor: default;
}
.feature-cell:hover { background: rgba(37,99,235,0.028); }
.feature-num {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: 12px;
  color: var(--gray-mid);
  margin-bottom: 14px;
  display: block;
}
.feature-title {
  font-family: var(--font-playfair), 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--black);
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}
.feature-desc {
  font-size: 14px;
  color: var(--gray-mid);
  line-height: 1.65;
}

/* ===== FOOTER ===== */
.lp-footer {
  background: var(--black);
  padding: 44px 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-legal {
  font-size: 11px;
  color: rgba(255,255,255,0.22);
  max-width: 580px;
  line-height: 1.65;
}
.footer-brand {
  font-size: 12px;
  color: rgba(255,255,255,0.18);
  letter-spacing: 0.5px;
}
.footer-brand strong { color: rgba(255,255,255,0.42); font-weight: 600; }

/* Mobile fade element — hidden on desktop */
.mobile-img-fade { display: none; }

/* Mobile hero floating cards — hidden on desktop */
.mobile-hero-cards {
  display: none;
}

@media (max-width: 768px) {
  .mobile-hero-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    pointer-events: none;
  }
  .mhc-card {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.9);
    border-radius: 16px;
    padding: 10px 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.10);
    width: 148px;
    animation: mhcFloat 6s ease-in-out infinite;
  }
  .mhc-card:nth-child(2) { animation-delay: 1s; }
  .mhc-card:nth-child(3) { animation-delay: 2s; animation-duration: 7s; }
  @keyframes mhcFloat {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  .mhc-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #9B9690;
    margin-bottom: 4px;
    font-family: var(--font-dm), 'DM Sans', sans-serif;
  }
  .mhc-value {
    font-size: 17px;
    font-weight: 800;
    color: #1A1917;
    font-family: var(--font-playfair), 'Playfair Display', serif;
    line-height: 1;
  }
  .mhc-value.blue { color: #2563EB; }
  .mhc-value.green { color: #059669; }
  .mhc-sub {
    font-size: 9px;
    font-weight: 500;
    color: #9B9690;
    margin-top: 3px;
    font-family: var(--font-dm), 'DM Sans', sans-serif;
  }
  .mhc-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mhc-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .mhc-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
    color: #059669;
    background: rgba(5,150,105,0.1);
    border-radius: 20px;
    padding: 2px 7px;
    margin-top: 5px;
    font-family: var(--font-dm), 'DM Sans', sans-serif;
  }
}

/* Animate on scroll */
.anim-el {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.anim-el.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 900px) {
  .lp-nav { padding: 16px 24px; }
  .hero-content { width: 60%; padding: 0 44px 0 20px; }
}

@media (max-width: 768px) {
  .lp-nav {
    padding: 16px 20px;
    background: rgba(248,247,245,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    gap: 16px; /* Ensure logo/buttons don't touch */
  }
  .shimmer-btn { height: 34px; padding: 0 10px; font-size: 11px; }
  .nav-buttons { gap: 6px; }

  .lp-hero {
    height: auto;
    min-height: auto;
    flex-direction: column;
    display: flex;
    padding-top: 64px; /* Space for fixed nav */
    background: #F8F7F5;
  }
  .hero-visuals {
    position: relative;
    width: 100%;
    height: 480px; /* Taller image area on mobile */
    z-index: 10;
    overflow: hidden;
  }
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 8% top; /* Adjusted to 8% to move visuals away from the edge in the right direction */
  }
  #fx-canvas, .light-ray, .light-ray-2, .b-halo, .b-halo-2, .b-floor-glow, .hero-overlay {
    display: block;
    pointer-events: none;
  }
  /* Re-align effects for the mobile view height */
  .b-halo, .b-halo-2 { left: 8%; top: 32%; }
  .b-floor-glow { left: 8%; top: 62%; width: 260px; }
  
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(248,247,245,0) 0%,
      rgba(248,247,245,0.4) 60%,
      rgba(248,247,245,1) 95%,
      #F8F7F5 100%
    );
  }
  .hero-content {
    position: relative;
    width: 100%;
    margin-left: 0;
    padding: 24px 20px 60px;
    text-align: center;
    background: #F8F7F5;
    z-index: 20;
    animation: heroInMobile 1s 0.2s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes heroInMobile {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .hero-title {
    font-size: clamp(30px, 9vw, 40px);
    line-height: 1.15;
    margin-bottom: 20px;
    letter-spacing: -0.5px; /* Less aggressive than -1.5px */
  }
  .hero-desc {
    font-size: 15px;
    max-width: 100%;
    margin: 0 auto 36px;
    line-height: 1.6;
    color: var(--gray-dark);
  }
  .hero-cta {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  .btn-black, .btn-outline {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
  }
  
  .scroll-hint { display: none; }
  
  /* ── About & Features ── */
  .about-top { grid-template-columns: 1fr; gap: 40px; }
  .features-grid { grid-template-columns: 1fr; gap: 24px; }
  .about-inner { padding: 0 24px; }
  .lp-about { padding: 80px 0 60px; }
  
  /* ── Footer ── */
  .lp-footer { flex-direction: column; gap: 28px; text-align: center; padding: 48px 24px; }
  .footer-legal { max-width: 100%; order: 2; font-size: 11px; }
  .footer-brand { order: 1; }
}
`

export default function WelcomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const navbar = document.getElementById('lp-navbar')
    const onScroll = () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll)

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      const href = target.getAttribute('href')
      if (href?.startsWith('#')) {
        e.preventDefault()
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    anchors.forEach(a => a.addEventListener('click', handleAnchorClick))

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    const dpr = window.devicePixelRatio || 1
    let animId = 0

    function resize() {
      W = canvas!.offsetWidth
      H = canvas!.offsetHeight
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0; r = 0
      baseAlpha = 0; alpha = 0; life = 0; maxLife = 0
      constructor() { this.reset(true) }
      reset(initial = false) {
        // Dynamic center to match CSS logo position
        const isMobile = W < 768
        const cx = W * (isMobile ? 0.28 : 0.272)
        const cy = H * (isMobile ? 0.32 : 0.425)
        const spread = isMobile ? 50 : 70
        
        this.x = cx + (Math.random() - 0.5) * spread
        this.y = cy + (Math.random() - 0.5) * spread * 0.6
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = -(Math.random() * 0.8 + 0.3)
        this.r = Math.random() * (isMobile ? 1.8 : 2.4) + 0.5
        this.baseAlpha = Math.random() * 0.4 + 0.1
        this.maxLife = Math.random() * 180 + 100
        this.life = initial ? Math.floor(Math.random() * this.maxLife) : 0
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.vx *= 0.999; this.life++
        if (this.life > this.maxLife) this.reset()
        const t = this.life / this.maxLife
        this.alpha = this.baseAlpha * Math.sin(t * Math.PI)
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(37,99,235,${this.alpha.toFixed(3)})`
        ctx.fill()
      }
    }

    class Orb {
      t: number; ax: number; ay: number
      constructor(
        public x: number, public y: number, public r: number,
        public color: string, public speed: number
      ) {
        this.t = Math.random() * Math.PI * 2
        this.ax = (Math.random() - 0.5) * 40
        this.ay = (Math.random() - 0.5) * 30
      }
      update() { 
        this.t += this.speed 
        const isMobile = W < 768
        // Keep orbs near logo
        this.x = W * (isMobile ? 0.28 : 0.272)
        this.y = H * (isMobile ? 0.35 : 0.425)
      }
      draw() {
        const x = this.x + Math.sin(this.t) * this.ax
        const y = this.y + Math.cos(this.t * 0.8) * this.ay
        const grad = ctx.createRadialGradient(x, y, 0, x, y, this.r)
        grad.addColorStop(0, this.color.replace('A)', '0.12)'))
        grad.addColorStop(0.5, this.color.replace('A)', '0.04)'))
        grad.addColorStop(1, this.color.replace('A)', '0)'))
        ctx.beginPath(); ctx.arc(x, y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()
      }
    }

    class Sparkle {
      x = 0; y = 0; size = 0; alpha = 0; maxAlpha = 0
      life = 0; maxLife = 0; phase = 'in'
      constructor() { this.reset(true) }
      reset(initial = false) {
        const isMobile = W < 768
        const cx = W * (isMobile ? 0.28 : 0.272)
        const cy = H * (isMobile ? 0.32 : 0.425)
        this.x = cx + (Math.random() - 0.5) * 130
        this.y = cy + (Math.random() - 0.5) * 90
        this.size = Math.random() * 3 + 1
        this.alpha = 0; this.maxAlpha = Math.random() * 0.65 + 0.2
        this.maxLife = Math.random() * 90 + 40
        this.life = initial ? Math.floor(Math.random() * this.maxLife) : 0
        this.phase = 'in'
      }
      update() {
        this.life++
        if (this.phase === 'in') {
          this.alpha = (this.life / (this.maxLife * 0.4)) * this.maxAlpha
          if (this.life > this.maxLife * 0.4) this.phase = 'out'
        } else {
          this.alpha -= this.maxAlpha / (this.maxLife * 0.6)
          if (this.alpha <= 0) this.reset()
        }
      }
      draw() {
        if (this.alpha <= 0) return
        const s = this.size
        ctx.save(); ctx.translate(this.x, this.y)
        ctx.globalAlpha = this.alpha
        ctx.strokeStyle = 'rgba(100,160,255,1)'; ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(0, -s * 2); ctx.lineTo(0, s * 2)
        ctx.moveTo(-s * 2, 0); ctx.lineTo(s * 2, 0)
        ctx.moveTo(-s, -s); ctx.lineTo(s, s)
        ctx.moveTo(s, -s); ctx.lineTo(-s, s)
        ctx.stroke(); ctx.restore()
      }
    }

    const isM = W < 768
    const cxM = W * (isM ? 0.28 : 0.272)
    const cyM = H * (isM ? 0.32 : 0.425)
    
    const particles = Array.from({ length: 65 }, () => new Particle())
    const orbs = [
      new Orb(cxM, cyM, 170, 'rgba(37,99,235,A)', 0.007),
      new Orb(cxM, cyM, 95, 'rgba(96,165,250,A)', 0.011),
      new Orb(cxM, cyM + H * 0.2, 80, 'rgba(37,99,235,A)', 0.005),
    ]
    const sparkles = Array.from({ length: 26 }, () => new Sparkle())

    function animate() {
      ctx.clearRect(0, 0, W, H)
      orbs.forEach(o => { o.update(); o.draw() })
      particles.forEach(p => { p.update(); p.draw() })
      sparkles.forEach(s => { s.update(); s.draw() })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      resize()
      const isM2 = W < 768
      const cxM2 = W * (isM2 ? 0.28 : 0.272)
      const cyM2 = H * (isM2 ? 0.32 : 0.425)
      orbs[0].x = cxM2; orbs[0].y = cyM2
      orbs[1].x = cxM2; orbs[1].y = cyM2
      orbs[2].x = cxM2; orbs[2].y = cyM2 + H * 0.2
    }
    window.addEventListener('resize', onResize)

    const animEls = document.querySelectorAll('.anim-el')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    animEls.forEach(el => obs.observe(el))

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      anchors.forEach(a => a.removeEventListener('click', handleAnchorClick))
      ro.disconnect()
      obs.disconnect()
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className={`lp-root ${playfair.variable} ${dmSans.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="lp-nav" id="lp-navbar">
        <a href="#" className="nav-logo">
          Buco <span className="nav-logo-badge">BETA</span>
        </a>
        <div className="nav-buttons">
          <a href="#about" className="shimmer-btn">Sobre nosotros</a>
          <Link href="/login" className="shimmer-btn">Iniciar sesión</Link>
          <Link href="/signup" className="shimmer-btn primary">Registrarse</Link>
        </div>
      </nav>

      <section className="lp-hero" id="hero">
        <div className="hero-visuals">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/BCD50CE8-1CD5-4BD3-BE42-C5F30964F27C.PNG" alt="Buco Finance" className="hero-image" />
          <canvas ref={canvasRef} id="fx-canvas" />
          <div className="light-ray" />
          <div className="light-ray-2" />
          <div className="b-halo" />
          <div className="b-halo-2" />
          <div className="b-floor-glow" />
          <div className="hero-overlay" />

          {/* Floating cards — visible on mobile only */}
          <div className="mobile-hero-cards">
            {/* Balance card */}
            <div className="mhc-card">
              <div className="mhc-label">Balance total</div>
              <div className="mhc-value blue">$2,847</div>
              <div className="mhc-badge">↑ +12% este mes</div>
            </div>
            {/* WhatsApp registro card */}
            <div className="mhc-card">
              <div className="mhc-label">Último registro</div>
              <div className="mhc-row" style={{marginBottom:'3px'}}>
                <div className="mhc-dot" style={{background:'#25D366'}} />
                <div style={{fontSize:'10px',fontWeight:700,color:'#1A1917',fontFamily:'var(--font-dm)'}}>WhatsApp</div>
              </div>
              <div style={{fontSize:'11px',fontWeight:600,color:'#4A4845',fontFamily:'var(--font-dm)',lineHeight:1.3}}>
                "gasté 45 almuerzo"
              </div>
              <div className="mhc-sub">Hace 2 minutos · Efectivo</div>
            </div>
            {/* Meta card */}
            <div className="mhc-card">
              <div className="mhc-label">Meta viaje ✈️</div>
              <div className="mhc-value green">68%</div>
              <div style={{
                marginTop:'5px',
                height:'4px',
                borderRadius:'99px',
                background:'rgba(5,150,105,0.15)',
                overflow:'hidden'
              }}>
                <div style={{width:'68%',height:'100%',background:'#059669',borderRadius:'99px'}} />
              </div>
              <div className="mhc-sub">$680 de $1,000</div>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Acceso anticipado disponible
          </div>
          <h1 className="hero-title">
            Tu dinero,<br />
            <em>inteligentemente</em><br />
            organizado.
          </h1>
          <p className="hero-desc">
            Gastos, metas, tarjetas y un <strong>asistente IA</strong> que conoce tus
            finanzas en tiempo real. Registra desde WhatsApp con una sola línea de texto.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn-black">Empezar gratis →</Link>
            <a href="#about" className="btn-outline">Saber más</a>
          </div>
        </div>

        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      <section className="lp-about" id="about">
        <div className="about-bg-text">BUCO</div>
        <div className="about-inner">
          <div className="about-top">
            <div className="about-left anim-el">
              <p className="about-label">Sobre Buco Finance</p>
              <h2 className="about-title">
                Toma el control<br />
                de tus <em>finanzas</em><br />
                hoy mismo.
              </h2>
              <p className="about-desc">
                Buco nació de una necesidad simple: las personas quieren saber en qué gastan
                su dinero, pero registrarlo es tedioso. Por eso creamos una herramienta que
                se adapta a ti, no al revés.
              </p>
              <p className="about-desc">
                Con inteligencia artificial integrada, conexión a WhatsApp y reportes
                automáticos, Buco convierte la organización financiera en algo natural y sin
                fricción.
              </p>
            </div>
            <div className="about-right anim-el" style={{ transitionDelay: '0.1s' }}>
              <div className="about-stat">
                <span className="stat-num">IA</span>
                <span className="stat-label">Asistente financiero que conoce tus datos reales</span>
              </div>
              <div className="about-stat">
                <span className="stat-num">+10</span>
                <span className="stat-label">Categorías con clasificación automática</span>
              </div>
              <div className="about-stat">
                <span className="stat-num">24/7</span>
                <span className="stat-label">Alertas y recordatorios automáticos de pagos</span>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.05s' }}>
              <span className="feature-num">01</span>
              <h3 className="feature-title">Conexiones rápidas</h3>
              <p className="feature-desc">Escribe "3 dólares taxi" en WhatsApp y Buco lo registra automáticamente como transporte. Sin abrir la app.</p>
            </div>
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.1s' }}>
              <span className="feature-num">02</span>
              <h3 className="feature-title">Asistente IA</h3>
              <p className="feature-desc">Pregúntale cuánto has gastado, cómo van tus metas o en qué puedes ahorrar. Respuestas con tus datos reales.</p>
            </div>
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.15s' }}>
              <span className="feature-num">03</span>
              <h3 className="feature-title">Tarjetas y cuentas</h3>
              <p className="feature-desc">Controla crédito, pagos mínimos y fechas de corte. Alertas 5 días antes para que nunca se te pase.</p>
            </div>
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.2s' }}>
              <span className="feature-num">04</span>
              <h3 className="feature-title">Metas de ahorro</h3>
              <p className="feature-desc">Define objetivos, abona poco a poco y visualiza tu progreso. Buco calcula cuánto necesitas ahorrar cada mes.</p>
            </div>
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.25s' }}>
              <span className="feature-num">05</span>
              <h3 className="feature-title">Reportes inteligentes</h3>
              <p className="feature-desc">Análisis de patrones de gasto por categoría y período. Descubre dónde puedes mejorar con un solo vistazo.</p>
            </div>
            <div className="feature-cell anim-el" style={{ transitionDelay: '0.3s' }}>
              <span className="feature-num">06</span>
              <h3 className="feature-title">Alertas automáticas</h3>
              <p className="feature-desc">Notificaciones cuando te acercas al límite de presupuesto, vence un pago o completas una meta de ahorro.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <p className="footer-legal">
          ⚠️ Buco Finance es una herramienta de anotación y organización de finanzas personales.
          No constituye asesoramiento financiero, de inversión, ni servicios bancarios regulados.
          Los datos son de carácter informativo y de uso personal exclusivo del usuario.
        </p>
        <span className="footer-brand">
          © 2026 Buco Finance · Made by <strong>Hinds Systems</strong>
        </span>
      </footer>
    </div>
  )
}
