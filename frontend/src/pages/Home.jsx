import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "../assets/images/Hero-bg.svg";
import { useAuth } from "../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --rose:   #8E4444;
    --cream:  #F9F7F2;
    --deep:   #3D2B2B;
    --green:  #31a354;
    --border: #E8E2D9;
    --muted:  rgba(61,43,43,0.6);
  }

  body { margin: 0; background: var(--cream); font-family: system-ui, sans-serif; }

  /* ── HERO ──────────────────────────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
  }
  .hero-bg {
    position: absolute; inset: 0; z-index: 0;
    width: 100%; height: 100%; object-fit: cover;
  }
  .hero-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(to right, rgba(61,43,43,0.75) 15%, rgba(61,43,43,0) 85%);
    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%);
    mask-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%);
    backdrop-filter: blur(25px);
  }
  .hero-content {
    position: relative; z-index: 2;
    max-width: 1280px; margin: 0 auto;
    padding: 0 2rem; width: 100%;
  }
  .hero-text { max-width: 640px; }

  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    color: var(--cream); margin: 0 0 0.5rem;
    line-height: 1.15;
  }
  .hero-h2 {
    font-size: clamp(2.8rem, 7vw, 4.5rem);
    margin: 0 0 1.5rem; line-height: 1.1;
  }
  .hero-accent {
    color: #b68383;
    font-family: 'Pacifico', cursive;
    font-weight: 400;
    text-shadow: 0 4px 15px rgba(0,0,0,0.4);
  }
  .hero-sub {
    color: rgba(249,247,242,0.9);
    font-size: 1.1rem;
    font-weight: 300;
    letter-spacing: 0.04em;
    margin-bottom: 2.5rem;
  }
  .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }

  .btn-primary {
    padding: 1rem 2.5rem;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    background: var(--rose); color: var(--cream);
    border: none; cursor: pointer; text-decoration: none;
    border-radius: 10px;
    transition: all 0.4s cubic-bezier(0.165,0.84,0.44,1);
    box-shadow: 0 4px 6px -1px rgba(142,68,68,0.3);
    display: inline-block;
  }
  .btn-primary:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 25px rgba(142,68,68,0.4);
    filter: brightness(1.1);
  }
  .btn-outline {
    padding: 1rem 2.5rem;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    background: transparent;
    border: 1px solid var(--cream); color: var(--cream);
    cursor: pointer; text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
  }
  .btn-outline:hover { background: var(--cream); color: var(--deep); }

  /* QUICK SEARCH */
  .quick-search {
    margin-top: 3rem;
    padding: 1.25rem 1.5rem;
    background: rgba(249,247,242,0.10);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(249,247,242,0.2);
    display: inline-block;
    width: 100%;
    max-width: 480px;
  }
  .qs-label {
    color: var(--cream); font-size: 9px;
    font-weight: 700; letter-spacing: 0.3em;
    text-transform: uppercase; opacity: 0.8;
    margin-bottom: 0.75rem; display: block;
  }
  .qs-row { display: flex; flex-direction: column; gap: 0.25rem; }
  @media (min-width: 480px) { .qs-row { flex-direction: row; } }

  .qs-select {
    background: var(--cream); color: var(--deep);
    padding: 0.75rem 1rem; font-size: 11px;
    font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; outline: none;
    border: none; width: 100%;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233D2B2B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1em;
    cursor: pointer;
  }
  .qs-btn {
    background: var(--rose); color: var(--cream);
    padding: 0.75rem 1.5rem; border: none;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer; width: 100%;
    transition: background 0.3s ease;
    white-space: nowrap;
  }
  .qs-btn:hover { background: var(--deep); }
  .qs-hint { color: rgba(249,247,242,0.5); font-size: 9px; margin-top: 0.5rem; font-style: italic; }
  .qs-reserve-btn {
    margin-top: 0.75rem;
    width: 100%;
    max-width: 480px;
    background: rgba(49,163,84,0.15);
    border: 1px solid rgba(49,163,84,0.5);
    color: #a8f0b8;
    padding: 0.7rem 1rem;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    display: block;
    font-family: system-ui, sans-serif;
  }
  .qs-reserve-btn:hover {
    background: rgba(49,163,84,0.3);
    border-color: rgba(49,163,84,0.8);
    color: #fff;
  }

  /* SCROLL */
  .hero-scroll {
    position: absolute; bottom: 2.5rem; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
    color: var(--rose); animation: bounce 1.5s infinite; z-index: 2;
  }
  .hero-scroll span:first-child { font-size: 9px; letter-spacing: 0.3em; }
  .hero-scroll span:last-child  { font-size: 1.1rem; }
  @keyframes bounce {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(8px); }
  }

  /* ── SECTION SHARED ────────────────────────────────────────────────────── */
  .section-inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }

  .section-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; margin-bottom: 3rem;
    border-bottom: 1px solid rgba(61,43,43,0.10); padding-bottom: 1.5rem;
  }
  .section-eyebrow {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.4em; text-transform: uppercase; margin-bottom: 0.5rem;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 400; color: var(--deep); margin: 0;
  }
  .section-link {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none; transition: all 0.3s ease;
    white-space: nowrap;
  }

  /* ── EMERGENCY CARDS ───────────────────────────────────────────────────── */
  .emergency-section { padding: 5rem 0; background: var(--cream); }

  .request-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 768px) { .request-grid { grid-template-columns: repeat(3,1fr); } }

  .request-card {
    background: #fff; border: 1px solid var(--border);
    padding: 2rem; position: relative; overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .request-card:hover {
    transform: translateY(-5px);
    border-color: var(--rose);
    box-shadow: 0 12px 30px rgba(142,68,68,0.15);
  }
  .urgent-card {
    border-color: #B91C1C;
    animation: urgentPulse 2.5s infinite;
  }
  @keyframes urgentPulse {
    0%   { box-shadow: 0 0 0 0 rgba(185,28,28,0.4); }
    70%  { box-shadow: 0 0 0 12px rgba(185,28,28,0); }
    100% { box-shadow: 0 0 0 0 rgba(185,28,28,0); }
  }
  .urgent-badge {
    position: absolute; top: 0; right: 0;
    background: #dc2626; color: #fff;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    padding: 0.25rem 0.75rem;
  }
  .blood-circle {
    width: 3rem; height: 3rem; border-radius: 50%;
    background: rgba(142,68,68,0.10);
    display: flex; align-items: center; justify-content: center;
    color: var(--rose); font-weight: 700; font-size: 1rem;
    flex-shrink: 0;
  }
  .card-hospital { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--deep); }
  .card-time     { font-size: 9px; text-transform: uppercase; color: var(--muted); }
  .card-desc     { font-size: 0.875rem; line-height: 1.6; color: rgba(61,43,43,0.8); margin: 1.25rem 0; }
  .card-footer   { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1.25rem; }
  .card-id       { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; color: rgba(61,43,43,0.35); }
  .card-contact  {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--rose); background: none;
    border: none; cursor: pointer; transition: opacity 0.2s;
  }
  .card-contact:hover { opacity: 0.7; }

  .live-alert {
    color: #B91C1C;
    animation: livePulse 1.8s infinite;
  }
  @keyframes livePulse {
    0%   { text-shadow: 0 0 0 rgba(185,28,28,0.5); }
    50%  { text-shadow: 0 0 12px rgba(185,28,28,0.7); }
    100% { text-shadow: 0 0 0 rgba(185,28,28,0.5); }
  }

  /* ── TOP DONORS ────────────────────────────────────────────────────────── */
  .donors-section { padding: 5rem 0; background: #fff; }

  .donors-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 640px)  { .donors-grid { grid-template-columns: repeat(2,1fr); } }
  @media (min-width: 1024px) { .donors-grid { grid-template-columns: repeat(4,1fr); } }

  .donor-card {
    text-align: center; padding: 2rem 1.5rem;
    border: 1px solid var(--border);
    background: rgba(249,247,242,0.3);
    position: relative;
    transition: transform 0.4s cubic-bezier(0.165,0.84,0.44,1), box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease;
  }
  .donor-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(61,43,43,0.08);
    background: #fff;
    border-color: var(--deep);
  }
  .donor-blood-badge {
    position: absolute; top: 1rem; left: 1rem;
    width: 2.5rem; height: 2.5rem; border-radius: 50%;
    border: 1px solid rgba(142,68,68,0.2);
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 10px; color: var(--rose);
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  /* Avatar initials */
  .donor-avatar-wrap { margin-bottom: 1.5rem; position: relative; display: inline-block; }
  .donor-avatar {
    width: 6rem; height: 6rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 600;
    color: #fff; margin: 0 auto;
  }
  .donor-tier-badge {
    position: absolute; bottom: -0.5rem; right: -0.25rem;
    font-size: 7px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 7px; border-radius: 4px;
    border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  }
  .donor-name  { font-weight: 700; font-size: 1.05rem; color: var(--deep); margin-bottom: 0.25rem; }
  .donor-count { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--green); margin-bottom: 1rem; }
  .donor-btn {
    width: 100%; padding: 0.75rem;
    border: 1px solid var(--deep); background: transparent;
    color: var(--deep); font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;
  }
  .donor-card:hover .donor-btn { background: #045b1f; color: #fff; border-color: #045b1f; }

  /* Shine on tier badge */
  .donor-tier-badge {
    background-image: linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
    background-size: 200% auto;
    animation: shine 3s linear infinite;
  }
  @keyframes shine { to { background-position: 200% center; } }

  /* ── STATS ─────────────────────────────────────────────────────────────── */
  .stats-section { padding: 4rem 0; background: #ade1e5; }
  .stats-grid {
    display: grid; grid-template-columns: 1fr;
    gap: 3rem; text-align: center;
  }
  @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(3,1fr); } }

  .stat-item { position: relative; }
  .stat-item:not(:last-child)::after {
    content: '';
    display: none;
  }
  @media (min-width: 768px) {
    .stat-item:not(:last-child)::after {
      display: block;
      position: absolute; right: 0; top: 25%; bottom: 25%;
      width: 1px; background: rgba(249,247,242,0.15);
    }
  }
  .stat-number {
    display: block; font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    color: #545454; margin-bottom: 0.5rem;
    font-feature-settings: "tnum";
    transition: transform 0.3s ease;
  }
  .stat-number:hover { transform: translateY(-5px); }
  .stat-label {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: #545454; opacity: 0.6;
  }

  /* ── HOW IT WORKS ──────────────────────────────────────────────────────── */
  .hiw-section { padding: 6rem 0; }
  .hiw-header  { text-align: center; margin-bottom: 5rem; }
  .hiw-sub {
    margin-top: 1rem;
    font-size: 0.875rem; color: var(--muted);
    max-width: 480px; margin-left: auto; margin-right: auto;
    line-height: 1.7;
  }

  .hiw-grid {
    display: grid; grid-template-columns: 1fr;
    gap: 4rem; position: relative;
  }
  @media (min-width: 768px) { .hiw-grid { grid-template-columns: repeat(3,1fr); gap: 4rem 2rem; } }

  .process-step {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; position: relative;
    transition: transform 0.4s ease;
  }
  .process-step:hover { transform: translateY(-6px); }

  .step-circle {
    width: 5rem; height: 5rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 2rem; position: relative; z-index: 1;
    transition: border-color 0.5s ease;
  }
  .step-circle.outline {
    background: #fff; border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .process-step:hover .step-circle.outline { border-color: var(--green); }
  .step-circle.filled {
    background: var(--green); border: 1px solid var(--green);
    box-shadow: 0 8px 20px rgba(49,163,84,0.25);
  }
  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; color: var(--deep);
  }
  .step-circle.filled .step-num { color: #fff; }

  .step-connector {
    display: none;
  }
  @media (min-width: 768px) {
    .step-connector {
      display: block;
      position: absolute; top: 2.4rem;
      left: 60%; width: 80%; height: 1px;
      background: rgba(61,43,43,0.10);
      z-index: 0;
    }
  }

  .step-title {
    font-weight: 700; font-size: 11px;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--deep); margin-bottom: 1rem;
  }
  .step-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.7; }

  .hiw-cta { margin-top: 5rem; text-align: center; }
  .btn-green {
    padding: 1rem 3rem;
    background: transparent; border: 1px solid var(--green);
    color: var(--green); font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    cursor: pointer; text-decoration: none; display: inline-block;
    transition: all 0.3s ease;
  }
  .btn-green:hover { background: var(--green); color: #fff; }

  /* ── FOOTER ────────────────────────────────────────────────────────────── */
  .footer {
    background: var(--deep); color: rgba(249,247,242,0.8);
    padding: 5rem 0; border-top: 1px solid rgba(255,255,255,0.05);
  }
  .footer-grid {
    display: grid; grid-template-columns: 1fr;
    gap: 3rem; margin-bottom: 4rem;
  }
  @media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(4,1fr); } }

  .footer-brand { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fff; margin-bottom: 1.5rem; }
  .footer-tagline { font-size: 0.875rem; line-height: 1.7; opacity: 0.6; margin-bottom: 1.5rem; }
  .footer-socials { display: flex; gap: 1rem; }
  .footer-social {
    width: 2rem; height: 2rem; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: rgba(249,247,242,0.7);
    text-decoration: none;
    transition: all 0.3s ease;
  }
  .footer-social:hover { background: var(--rose); border-color: var(--rose); color: #fff; }

  .footer-heading {
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.3em; text-transform: uppercase;
    color: #fff; margin-bottom: 2rem;
  }
  .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
  .footer-links a { font-size: 0.875rem; color: rgba(249,247,242,0.7); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--rose); }

  .footer-newsletter-text { font-size: 11px; opacity: 0.6; margin-bottom: 1rem; }
  .footer-input-wrap { position: relative; }
  .footer-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    padding: 0.75rem 4rem 0.75rem 1rem;
    font-size: 0.875rem; color: #fff; outline: none;
    transition: border-color 0.3s;
  }
  .footer-input:focus { border-color: var(--rose); }
  .footer-input::placeholder { color: rgba(249,247,242,0.3); }
  .footer-join {
    position: absolute; right: 0.75rem; top: 50%;
    transform: translateY(-50%);
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    color: var(--rose); background: none; border: none; cursor: pointer;
    transition: letter-spacing 0.3s;
  }
  .footer-join:hover { letter-spacing: 0.1em; }

  .footer-bottom {
    padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; flex-direction: column; gap: 2rem;
  }
  @media (min-width: 768px) { .footer-bottom { flex-direction: row; justify-content: space-between; align-items: flex-end; } }

  .footer-copy { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; }

  /* ── AUTH GATE MODAL ────────────────────────────────────────────────────── */
  .auth-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(61,43,43,0.55);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .auth-modal {
    background: var(--cream); max-width: 420px; width: 100%;
    padding: 2.5rem 2rem; position: relative;
    border-top: 4px solid var(--rose);
    box-shadow: 0 24px 60px rgba(61,43,43,0.25);
    animation: slideUp 0.25s cubic-bezier(0.165,0.84,0.44,1);
  }
  @keyframes slideUp {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .auth-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: none; border: none; font-size: 1.25rem;
    cursor: pointer; color: var(--muted);
    line-height: 1; padding: 0.25rem;
  }
  .auth-modal-icon {
    width: 3.5rem; height: 3.5rem; border-radius: 50%;
    background: rgba(142,68,68,0.10);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin: 0 auto 1.25rem;
  }
  .auth-modal h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; color: var(--deep);
    text-align: center; margin: 0 0 0.75rem;
  }
  .auth-modal p {
    font-size: 0.9rem; color: var(--muted);
    text-align: center; line-height: 1.6; margin: 0 0 1.75rem;
  }
  .auth-modal-btns {
    display: flex; gap: 0.75rem; flex-direction: column;
  }
  .auth-modal-btns .btn-primary { text-align: center; width: 100%; }
  .auth-modal-btns .btn-outline-dark {
    padding: 0.85rem; text-align: center; width: 100%;
    font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; text-decoration: none;
    border: 1px solid var(--deep); color: var(--deep);
    display: block; transition: all 0.3s ease;
  }
  .auth-modal-btns .btn-outline-dark:hover { background: var(--deep); color: var(--cream); }

  /* ── RESERVE BUTTON ─────────────────────────────────────────────────────── */
  .btn-reserve {
    padding: 1rem 2.5rem;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    background: var(--green); color: #fff;
    border: none; cursor: pointer; text-decoration: none;
    border-radius: 10px;
    transition: all 0.4s cubic-bezier(0.165,0.84,0.44,1);
    box-shadow: 0 4px 6px -1px rgba(49,163,84,0.3);
    display: inline-block;
  }
  .btn-reserve:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 25px rgba(49,163,84,0.4);
    filter: brightness(1.1);
  }

  .footer-emergency-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.3em;
    text-transform: uppercase; color: var(--green); margin-bottom: 1rem;
  }
  .footer-emergency-info { font-size: 0.875rem; color: rgba(249,247,242,0.6); margin-bottom: 0.5rem; }
  .footer-emergency-info strong { color: #fff; letter-spacing: 0.05em; }
  .footer-emergency-addr { font-size: 11px; color: rgba(249,247,242,0.4); font-style: italic; }
`;

/* ─── Animated Counter ────────────────────────────────────────────────────── */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const increment = Math.ceil(target / 100);
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, 20);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-number">
      {count.toLocaleString()}
    </span>
  );
}

/* ─── Avatar color from name ──────────────────────────────────────────────── */
const AVATAR_COLORS = ["#8E4444", "#6a97aa", "#31a354", "#D4AF37", "#7b5ea7", "#c45c26"];
function avatarColor(name) {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function donorTier(count) {
  if (count >= 20) return { tier: "Platinum", tierColor: "#E5E4E2", tierText: "#3D2B2B" };
  if (count >= 10) return { tier: "Gold", tierColor: "#D4AF37", tierText: "#fff" };
  if (count >= 5) return { tier: "Silver", tierColor: "#C0C0C0", tierText: "#fff" };
  return { tier: "Bronze", tierColor: "#CD7F32", tierText: "#fff" };
}


function AuthGateModal({ reason, onClose }) {
  const messages = {
    donate: {
      icon: "🩸",
      title: "Donors Only",
      body: "You need to be a registered donor to donate blood or view blood requests. Join LifeLine to save lives!",
    },
    reserve: {
      icon: "🏥",
      title: "Login Required",
      body: "Hospital slot reservations are only available to registered donors. Sign up to book your donation slot.",
    },
    request: {
      icon: "🔒",
      title: "Login Required",
      body: "Blood requests contain sensitive contact information and are only visible to registered users. Please log in or sign up to continue.",
    },
  };
  const m = messages[reason] || messages.request;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        <div className="auth-modal-icon">{m.icon}</div>
        <h3>{m.title}</h3>
        <p>{m.body}</p>
        <div className="auth-modal-btns">
          <Link to="/signup" className="btn-primary" style={{ textAlign: "center" }}>
            Create Free Account
          </Link>
          <Link to="/login" className="auth-modal-btns btn-outline-dark">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Home Component ──────────────────────────────────────────────────────── */
export default function Home() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Real data from API ──────────────────────────────────────────────────
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [stats, setStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

    Promise.all([
      fetch(`${BASE}/api/blood-requests/emergency`).then(r => r.json()),
      fetch(`${BASE}/api/donations/top-donors`).then(r => r.json()),
      fetch(`${BASE}/api/blood-requests/stats`).then(r => r.json()),
    ])
      .then(([emergency, donors, liveStats]) => {
        setEmergencyRequests(Array.isArray(emergency) ? emergency.slice(0, 3) : []);
        setTopDonors(Array.isArray(donors) ? donors.slice(0, 4) : []);
        setStats(liveStats);
      })
      .catch(err => console.error("Home data fetch failed:", err))
      .finally(() => setDataLoading(false));
  }, []);

  const handleSearch = () => {
    if (bloodGroup) navigate(`/donors?blood=${bloodGroup}`);
  };

  // Gate: donor-only actions (donate, reserve)
  const handleDonorAction = (path) => {
    if (user?.role === "donor") navigate(path);
    else setModal(path === "/reserve" ? "reserve" : "donate");
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── AUTH GATE MODAL ──────────────────────────────────────────────── */}
      {modal && <AuthGateModal reason={modal} onClose={() => setModal(null)} />}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <img src={heroBg} alt="Hero background" className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-h1">Donate Blood.</h1>
            <h2 className="hero-h2">
              <span className="hero-accent">Save a Life Today.</span>
            </h2>
            <p className="hero-sub">
              Connecting donors and patients in Dhaka with real-time tracking and emergency alerts.
            </p>

            <div className="hero-btns">
              {/* Request Blood — public, no login needed */}
              <Link to="/request" className="btn-primary">Request Blood</Link>

              {/* Donate Now — donor only; others see modal */}
              <button
                className="btn-reserve"
                onClick={() => handleDonorAction("/blood-list")}
              >
                Donate Now
              </button>
            </div>

            {/* Quick Search */}
            <div className="quick-search">
              <span className="qs-label">Quick Donor Search</span>
              <div className="qs-row">
                <select
                  className="qs-select"
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                >
                  <option value="" disabled>Select Blood Group</option>
                  {BLOOD_GROUPS.map(g => (
                    <option key={g} value={g}>{g} — {g.includes("+") ? "Positive" : "Negative"}</option>
                  ))}
                </select>
                <button className="qs-btn" onClick={handleSearch}>Find Donors</button>
              </div>
              <p className="qs-hint">
                {stats
                  ? `*${stats.totalDonors} active donor${stats.totalDonors !== 1 ? "s" : ""} registered`
                  : "*Loading donor count…"}
              </p>
            </div>

            {/* Reserve Slot — sits below the search box, donor-only */}
            <button
              className="qs-reserve-btn"
              onClick={() => handleDonorAction("/reserve")}
            >
              Reserve a Hospital Slot
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── EMERGENCY REQUESTS ────────────────────────────────────────────── */}
      <section className="emergency-section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <p className="section-eyebrow live-alert">● Live Alerts</p>
              <h3 className="section-title">Emergency Requests</h3>
            </div>
            <Link to="/emergency" className="section-link" style={{ color: "var(--rose)" }}>
              View All Cases →
            </Link>
          </div>

          <div className="request-grid">
            {dataLoading ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading emergency requests…</p>
            ) : emergencyRequests.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No active emergency requests right now.</p>
            ) : (
              emergencyRequests.map((req) => (
                <div key={req._id} className={`request-card ${req.isEmergency ? "urgent-card" : ""}`}>
                  {req.isEmergency && <div className="urgent-badge">Urgent</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div className="blood-circle">{req.bloodGroup}</div>
                    <div>
                      <div className="card-hospital">{req.hospital}</div>
                      <div className="card-time">Posted {timeAgo(req.createdAt)}</div>
                    </div>
                  </div>
                  <p className="card-desc">{req.location} · {req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""} needed</p>
                  <div className="card-footer">
                    <span className="card-id">#{req._id.slice(-6).toUpperCase()}</span>
                    {user ? (
                      <button className="card-contact">
                        {req.receiverId?.phone || "Contact Poster"}
                      </button>
                    ) : (
                      <button className="card-contact" onClick={() => setModal("request")}>
                        🔒 Login to Contact
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── TOP DONORS ────────────────────────────────────────────────────── */}
      <section className="donors-section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <p className="section-eyebrow" style={{ color: "var(--green)" }}>Our Lifesavers</p>
              <h3 className="section-title">Top Donors</h3>
            </div>
            <Link to="/donors" className="section-link" style={{ color: "rgba(61,43,43,0.6)" }}>
              See All Donors →
            </Link>
          </div>

          <div className="donors-grid">
            {dataLoading ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading top donors…</p>
            ) : topDonors.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No donation records yet — be the first!</p>
            ) : (
              topDonors.map((d) => {
                const name = d.donor?.name || "Anonymous";
                const blood = d.donor?.bloodGroup || "—";
                const count = d.donationCount ?? 0;
                const { tier, tierColor, tierText } = donorTier(count);
                return (
                  <div key={d.donor?._id || name} className="donor-card">
                    <div className="donor-blood-badge">{blood}</div>

                    <div className="donor-avatar-wrap">
                      <div
                        className="donor-avatar"
                        style={{ background: avatarColor(name) }}
                      >
                        {initials(name)}
                      </div>
                      <div
                        className="donor-tier-badge"
                        style={{ background: tierColor, color: tierText }}
                      >
                        {tier}
                      </div>
                    </div>

                    <div className="donor-name">{name}</div>
                    <div className="donor-count">{count} Donation{count !== 1 ? "s" : ""}</div>
                    <Link
                      to={`/donors/${d.donor?._id}`}
                      className="donor-btn"
                      style={{ display: "block", textAlign: "center", textDecoration: "none" }}
                    >
                      View Profile
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ────────────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="section-inner">
          <div className="stats-grid">
            {stats ? (
              <>
                <div className="stat-item">
                  <AnimatedCounter target={stats.totalDonors} />
                  <span className="stat-label">Registered Donors</span>
                </div>
                <div className="stat-item">
                  <AnimatedCounter target={stats.totalRequests} />
                  <span className="stat-label">Total Requests</span>
                </div>
                <div className="stat-item">
                  <AnimatedCounter target={stats.fulfilledRequests} />
                  <span className="stat-label">Successful Transfers</span>
                </div>
              </>
            ) : (
              [
                { label: "Registered Donors" },
                { label: "Total Requests" },
                { label: "Successful Transfers" },
              ].map(({ label }) => (
                <div key={label} className="stat-item">
                  <span className="stat-number" style={{ opacity: 0.3 }}>—</span>
                  <span className="stat-label">{label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="hiw-section">
        <div className="section-inner">
          <div className="hiw-header">
            <p className="section-eyebrow" style={{ color: "var(--green)" }}>The Process</p>
            <h3 className="section-title">How It Works</h3>
            <p className="hiw-sub">
              Saving a life is simpler than you think. We've streamlined the journey
              from registration to the final drop.
            </p>
          </div>

          <div className="hiw-grid">
            {/* Step 1 */}
            <div className="process-step">
              <div className="step-circle outline">
                <span className="step-num">01</span>
              </div>
              <div className="step-connector" />
              <div className="step-title">Register</div>
              <p className="step-desc">
                Create your profile with your blood group and location.
                Your data is encrypted and secure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="process-step">
              <div className="step-circle outline">
                <span className="step-num">02</span>
              </div>
              <div className="step-connector" />
              <div className="step-title">Connect</div>
              <p className="step-desc">
                Receive real-time alerts when someone nearby needs your
                specific blood type.
              </p>
            </div>

            {/* Step 3 */}
            <div className="process-step">
              <div className="step-circle filled">
                <span className="step-num">03</span>
              </div>
              <div className="step-title">Save Life</div>
              <p className="step-desc">
                Head to the hospital, donate, and complete the transaction
                through our verified system.
              </p>
            </div>
          </div>

          <div className="hiw-cta">
            <Link to="/learn-more" className="btn-green">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="section-inner">
          <div className="footer-grid">

            {/* Brand */}
            <div>
              <div className="footer-brand">LifeLine</div>
              <p className="footer-tagline">
                Connecting heroes with those in need. A transparent, fast, and
                reliable platform for life-saving blood donations.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social">fb</a>
                <a href="#" className="footer-social">ig</a>
                <a href="#" className="footer-social">tw</a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="footer-heading">Navigation</div>
              <ul className="footer-links">
                <li><Link to="/donors">Find Donors</Link></li>
                <li><Link to="/emergency">Emergency Requests</Link></li>
                <li><Link to="/learn-more">How it Works</Link></li>
                <li><Link to="/donors">Leaderboard</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <div className="footer-heading">Newsletter</div>
              <p className="footer-newsletter-text">
                Get live alerts for emergency cases in your area.
              </p>
              <div className="footer-input-wrap">
                <input
                  type="email"
                  className="footer-input"
                  placeholder="Email Address"
                />
                <button className="footer-join">Join</button>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 LifeLine. All rights reserved.</p>
            <div style={{ textAlign: "right" }}>
              <div className="footer-emergency-label">Emergency Contact</div>
              <p className="footer-emergency-info">
                Hotline: <strong>+880 1234 567890</strong>
              </p>
              <p className="footer-emergency-info">
                Email: <strong>support@lifeline.com</strong>
              </p>
              <p className="footer-emergency-addr">123 Green Street, Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}