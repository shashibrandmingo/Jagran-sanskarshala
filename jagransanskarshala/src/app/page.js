// import { Navbar } from "@/components/Navbar/Navbar";
import Hero from "@/sections/Hero/Hero";
import LatestUpdates from "@/sections/LatestUpdates/LatestUpdates";
import About from "@/sections/About/About";
import YearTalk from "@/sections/YearTalk/YearTalk";
import TalksSoFar from "@/sections/TalksSoFar/TalksSoFar";
import SurveyCTA from "@/sections/SurveyCTA/SurveyCTA";
// import WeeklyTalk from "@/sections/WeeklyTalk/WeeklyTalk";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import ContactUs from "@/sections/ContactUs/ContactUs";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LatestUpdates />
      <About />
      <YearTalk />
      {/* <TalksSoFar /> */}
      <SurveyCTA />
      {/* <WeeklyTalk /> */}
      <ContactUs />
      <Footer />
    </>
  );
}
