"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import HeroBannerEnglish from "@/assets/images/herobannerenglish.png";
import HeroBannerHindi from "@/assets/images/herobannerhindi.png";
import HeroMobileBgEnglish from "@/assets/images/heromobilebgenglish.png";
import HeroMobileBgHindi from "@/assets/images/heromobilebghindi.png";

export default function Hero() {
  const { t, isHindi } = useLanguage();

  // Static imports carry the image's real width/height. This banner is
  // 1774x887 — an exact 2:1 ratio. Locking the container to that same
  // ratio (instead of a fixed pixel height) guarantees the image is NEVER
  // zoomed, stretched, or cropped at any screen size — it just scales.
  const banner = isHindi ? HeroBannerHindi : HeroBannerEnglish;
  const mobileBanner = isHindi ? HeroMobileBgHindi : HeroMobileBgEnglish;

  return (
    <section id="hero" className="relative w-full bg-[var(--background)] overflow-hidden">
      {/* Desktop / Tablet Banner (Hidden on Mobile) */}
      <div
        className="hidden md:block relative w-full max-w-[1774px] mx-auto"
        style={{ aspectRatio: `${banner.width} / ${banner.height}` }}
      >
        <Image
          src={banner}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain select-none pointer-events-none"
        />

        {/* Hide the small black artifact at the bottom left of the Hindi banner */}
        {isHindi && (
          <div className="absolute bottom-0 left-0 w-1/2 h-[4px] bg-[var(--background)] z-10" />
        )}

        {/* Heading + Paragraph overlaid on the banner's left half. */}
        <div className="absolute inset-y-0 left-0 w-[55%] flex items-center">
          <div className="w-full pl-[10%] sm:pl-[12%] lg:pl-[14%] xl:pl-[16%] pr-[4%] -mt-[2%]">
            <h1 className="heading-lg mb-3">
              <span style={{ color: "var(--heading)" }}>
                {t.about.headingMain}{" "}
              </span>
              <span style={{ color: "var(--primary)" }}>
                {t.about.headingHighlight}
              </span>
            </h1>

            <p className="paragraph text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] leading-relaxed">
              {t.about.paragraph}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Hero (Hidden on Desktop/Tablet) */}
      <div className="md:hidden relative w-full pb-8 flex flex-col items-center bg-[var(--background)]">
        {/* Top Mobile Banner Image - Full Width */}
        <div className="relative w-full mb-6">
          <Image
            src={mobileBanner}
            alt="Sanskarshala"
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
          <h1 className="heading-lg mb-4">
            <span style={{ color: "var(--heading)" }}>
              {t.about.headingMain}{" "}
            </span>
            <span style={{ color: "var(--primary)" }}>
              {t.about.headingHighlight}
            </span>
          </h1>

          <p className="paragraph text-[15px] sm:text-[16px] leading-relaxed">
            {t.about.paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
