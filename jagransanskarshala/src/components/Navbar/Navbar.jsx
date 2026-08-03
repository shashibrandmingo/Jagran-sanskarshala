"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaXmark, FaUser, FaArrowRight, FaChevronRight, FaChevronLeft, FaImages } from "react-icons/fa6";
import { useLanguage } from "@/context/LanguageContext";
import { useSurveyModal } from "@/context/SurveyModalContext";
import LogoEnglish from "@/assets/images/Logo-english.png";
import LogoHindi from "@/assets/images/Logo-hindi.png";

export default function Navbar() {
  const { t, isHindi } = useLanguage();
  const { openSurveyModal } = useSurveyModal();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLogo = isHindi ? LogoHindi : LogoEnglish;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleLinkClick() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="flex items-stretch h-[84px] md:h-[96px]">
        {/* Logo side — cream background */}
        <div
          className="flex items-center shrink-0 pl-[4%] sm:pl-[6%] lg:pl-[8%] xl:pl-[10%] pr-8 sm:pr-16 lg:pr-24 xl:pr-32"
          style={{ background: "var(--background)" }}
        >
          <Link
            href="/"
            className="flex items-center"
            aria-label="Jagran Sanskarshala home"
          >
            <Image
              src={currentLogo}
              alt="Jagran Sanskarshala"
              priority
              className="h-[50px] sm:h-[60px] md:h-[68px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* Links side — red background, fills remaining width */}
        <div
          className="flex-1 flex items-center justify-end lg:justify-center gap-4 xl:gap-6 px-3 sm:px-4 lg:px-6"
          style={{ background: "var(--primary)" }}
        >
          <ul className="hidden lg:flex items-center gap-4 xl:gap-6 h-full">
            {t.navbar.links.map((link) => (
              <li
                key={link.id}
                className="relative group flex items-center h-full"
              >
                {link.dropdown ? (
                  <>
                    <button className="text-white/90 group-hover:text-white text-[16px] xl:text-[18px] font-semibold whitespace-nowrap transition-default flex items-center gap-1.5 h-full cursor-pointer">
                      {link.label}
                      <svg
                        className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <span className="absolute left-0 top-[65%] h-[2px] w-0 group-hover:w-full bg-white transition-all duration-300 ease-out rounded-full" />

                    <div className="absolute top-[90%] left-0 w-72 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-2 transition-all duration-300 z-50 p-2">
                      <ul className="flex flex-col">
                        {link.dropdown.map((dropItem) => (
                          <li key={dropItem.id}>
                            {dropItem.subDropdown ? (
                              <div className="py-1 my-0.5 rounded-xl bg-gray-50/70 p-1">
                                <Link
                                  href={dropItem.link || "/"}
                                  className="flex items-center justify-between px-3 py-2 text-[14px] text-gray-800 font-bold hover:text-[var(--primary)] transition-colors"
                                >
                                  <span>{dropItem.label}</span>
                                  <span className="text-[10px] bg-[var(--secondary)]/15 text-[var(--secondary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Latest
                                  </span>
                                </Link>
                                <div className="ml-3 mt-1 pl-3 border-l-2 border-[var(--secondary)] flex flex-col gap-1">
                                  {dropItem.subDropdown.map((subItem) => (
                                    <Link
                                      key={subItem.id}
                                      href={subItem.link || "/"}
                                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-gray-600 hover:text-[var(--primary)] hover:bg-white font-medium transition-all shadow-2xs group/subitem"
                                    >
                                      <FaImages className="text-xs text-[var(--secondary)] group-hover/subitem:scale-110 transition-transform" />
                                      <span>{subItem.label}</span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : dropItem.subDropdown2023 ? (
                              // Inline expand below (avoids off-screen issues)
                              <div className="group/sub2023">
                                <button className="w-full text-left flex items-center justify-between px-3 py-2.5 text-[14px] text-gray-700 font-medium hover:text-[var(--primary)] hover:bg-red-50 rounded-lg transition-colors group-hover/sub2023:text-[var(--primary)] group-hover/sub2023:bg-red-50 whitespace-normal leading-tight">
                                  <span>{dropItem.label}</span>
                                  <svg className="w-3 h-3 shrink-0 ml-2 text-gray-400 group-hover/sub2023:text-[var(--primary)] transition-transform duration-200 group-hover/sub2023:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {/* Inline sub-items — expand downward */}
                                <div className="overflow-hidden max-h-0 group-hover/sub2023:max-h-40 transition-all duration-300 ease-in-out">
                                  <div className="ml-3 pl-3 border-l-2 border-[var(--primary)]/30 flex flex-col gap-0.5 pb-1.5 pt-0.5">
                                    {dropItem.subDropdown2023.map((subItem) => (
                                      <Link
                                        key={subItem.id}
                                        href={subItem.link || "/"}
                                        className="block px-2.5 py-2 text-[13px] text-gray-600 font-medium hover:text-[var(--primary)] hover:bg-red-50/60 rounded-lg transition-colors leading-snug"
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={dropItem.link || "/"}
                                className="block px-3 py-2.5 text-[14px] text-gray-700 font-medium hover:text-[var(--primary)] hover:bg-gray-50 rounded-lg transition-colors whitespace-normal leading-tight"
                              >
                                {dropItem.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/#${link.id}`}
                      className="text-white/90 group-hover:text-white text-[16px] xl:text-[18px] font-semibold whitespace-nowrap transition-default flex items-center h-full"
                    >
                      {link.label}
                    </Link>
                    <span className="absolute left-0 top-[65%] h-[2px] w-0 group-hover:w-full bg-white transition-all duration-300 ease-out rounded-full" />
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Survey Button */}
          <div className="hidden lg:flex items-center ml-4 xl:ml-6">
            <button
              onClick={openSurveyModal}
              className="flex items-center gap-2.5 bg-[#f07f22] hover:bg-[#e6751c] text-white rounded-full p-1.5 pr-5 transition-all duration-300 shadow-md hover:shadow-[0_8px_25px_rgba(240,127,34,0.4)] hover:-translate-y-[2px] group/btn cursor-pointer"
            >
              <div className="bg-white/25 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-105 group-hover/btn:bg-white/30 shrink-0">
                <FaUser className="text-white text-[13px]" />
              </div>
              <span className="font-bold text-[15px] xl:text-[16px] tracking-wide whitespace-nowrap">
                {t.survey?.buttonText || "Survey"}
              </span>
              <FaArrowRight className="text-white text-sm group-hover/btn:translate-x-1 transition-transform duration-300 ml-0.5" />
            </button>
          </div>

          {/* Hamburger — mobile / tablet only */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-white transition-default active:scale-90 hover:bg-white/10"
          >
            <FaBars className="text-[26px]" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-[340px] flex flex-col
            transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]
            ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{
            background: "var(--white)",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          }}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between h-[84px] px-5 shrink-0 border-b"
            style={{
              background: "var(--background)",
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Link href="/" onClick={handleLinkClick}>
              <Image
                src={currentLogo}
                alt="Jagran Sanskarshala"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center w-10 h-10 rounded-full transition-default active:scale-90"
              style={{
                color: "var(--heading)",
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <FaXmark className="text-[22px]" />
            </button>
          </div>

          {/* Drawer links */}
          <ul className="flex flex-col px-3 py-4 overflow-y-auto">
            {t.navbar.links.map((link) => (
              <li
                key={link.id}
                className="border-b last:border-b-0"
                style={{ borderColor: "rgba(0,0,0,0.05)" }}
              >
                {link.dropdown ? (
                  <details className="group/details">
                    <summary
                      className="group flex items-center justify-between px-3 py-4 text-[16px] font-semibold transition-default cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                      style={{ color: "var(--heading)" }}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-2">
                        {link.label}
                        <svg
                          className="w-4 h-4 transition-transform group-open/details:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <ul className="pl-6 pb-4 flex flex-col gap-3">
                      {link.dropdown.map((dropItem) => (
                        <li key={dropItem.id}>
                          {dropItem.subDropdown ? (
                            <div className="flex flex-col py-1">
                              <div className="flex items-center justify-between text-[15px] font-bold text-gray-800 py-1">
                                <span>{dropItem.label}</span>
                                <span className="text-[10px] bg-[var(--secondary)]/15 text-[var(--secondary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Latest
                                </span>
                              </div>
                              <ul className="pl-3 mt-1 border-l-2 border-[var(--secondary)] flex flex-col gap-2">
                                {dropItem.subDropdown.map((subItem) => (
                                  <li key={subItem.id}>
                                    <Link
                                      href={subItem.link || "/"}
                                      onClick={handleLinkClick}
                                      className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-[var(--primary)] py-1 font-medium transition-colors"
                                    >
                                      <FaImages className="text-xs text-[var(--secondary)]" />
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : dropItem.subDropdown2023 ? (
                            <details className="group/sub2023details">
                              <summary className="flex items-center justify-between text-[15px] text-gray-600 py-1 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-[var(--primary)] transition-colors font-medium">
                                <span>{dropItem.label}</span>
                                <svg className="w-3.5 h-3.5 transition-transform group-open/sub2023details:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <ul className="pl-3 mt-1.5 border-l-2 border-gray-200 flex flex-col gap-1.5">
                                {dropItem.subDropdown2023.map((subItem) => (
                                  <li key={subItem.id}>
                                    <Link
                                      href={subItem.link || "/"}
                                      onClick={handleLinkClick}
                                      className="block text-[13px] text-gray-500 hover:text-[var(--primary)] py-1 transition-colors font-medium"
                                    >
                                      {subItem.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ) : (
                            <Link
                              href={dropItem.link || "/"}
                              onClick={handleLinkClick}
                              className="block text-[15px] text-gray-600 hover:text-[var(--primary)] py-1 transition-colors"
                            >
                              {dropItem.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={`/#${link.id}`}
                    onClick={handleLinkClick}
                    className="group flex items-center justify-between px-3 py-4 text-[16px] font-semibold transition-default"
                    style={{ color: "var(--heading)" }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "var(--primary)" }}
                    />
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div
            className="mt-auto px-6 py-5 text-center small-text"
            style={{ color: "var(--paragraph)" }}
          >
            {t.footer.tagline}
          </div>
        </div>
      </div>
    </header>
  );
}
