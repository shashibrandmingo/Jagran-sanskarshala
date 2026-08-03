"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaEnvelope,
} from "react-icons/fa";

const SOCIAL_LINKS = [
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/jagransanskarshala/",
    label: "Instagram",
  },
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/jagransanskarshala",
    label: "Facebook",
  },
  // { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
];

export default function Footer() {
  const { t } = useLanguage();
  const f = t.footer;
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative"
      style={{
        background: "linear-gradient(180deg, var(--primary) 0%, #a8100f 100%)",
      }}
    >
      {/* Subtle top divider glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-6 sm:pr-14 lg:pr-16">
          {/* ── Left: Social icons ── */}
          <div className="flex items-center gap-3 order-1">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/15 transition-default hover:bg-white hover:ring-white hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Icon className="w-4 h-4 text-white transition-default group-hover:text-[var(--primary)]" />
              </a>
            ))}
          </div>

          {/* ── Center: Copyright ── */}
          <p className="order-3 sm:order-2 text-sm font-medium tracking-wide text-white/90 text-center">
            © {year} <span className="text-white">{f.rights}</span>
          </p>

          {/* ── Right: Email ── */}
          <a
            href={`mailto:${f.email}`}
            className="group order-2 sm:order-3 flex items-center gap-3 text-sm font-medium text-white/90 transition-default hover:text-white"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/15 transition-default group-hover:bg-white group-hover:ring-white">
              <FaEnvelope className="w-4 h-4 text-white transition-default group-hover:text-[var(--primary)]" />
            </span>
            <span className="whitespace-nowrap">{f.email}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
