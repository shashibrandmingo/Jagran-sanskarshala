import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import GallerySection from "@/sections/Gallery/Gallery";

export const metadata = {
  title: "Gallery | Jagran Sanskarshaala",
  description:
    "Explore photo gallery and glimpses from Jagran Sanskarshaala sessions, events, and activities across the years.",
};

export default async function GalleryPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const yearParam = resolvedParams?.year || "All";

  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />
      <div className="flex-1">
        <GallerySection initialYear={yearParam} />
      </div>
      <Footer />
    </main>
  );
}
