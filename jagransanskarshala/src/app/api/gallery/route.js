import { NextResponse } from "next/server";
import { initialGalleryCategories, galleryTabs } from "@/services/galleryService";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/gallery`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      let categories = data.data?.categories || [];
      let years = data.data?.years || [];

      if (year && year !== "All" && year !== "all") {
        categories = categories.filter((cat) => cat.year === year);
      }

      return NextResponse.json({
        success: true,
        tabs: years.length > 0 ? years : galleryTabs,
        data: categories,
        totalCategories: categories.length,
      });
    }
  } catch (err) {
    console.warn("Express Backend connection failed, serving static fallback:", err.message);
  }

  // Fallback if backend offline
  let categories = [...initialGalleryCategories];
  if (year && year !== "All" && year !== "all") {
    categories = categories.filter((cat) => cat.year === year);
  }

  return NextResponse.json({
    success: true,
    tabs: galleryTabs,
    data: categories,
    totalCategories: categories.length,
  });
}

// POST endpoint for Admin / backend image push simulation
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, url, year } = body;

    if (!url || !year) {
      return NextResponse.json(
        { success: false, message: "URL and Year are required." },
        { status: 400 }
      );
    }

    const newImage = {
      id: `img-${year}-${Date.now()}`,
      title: title || `Sanskarshala ${year}`,
      url: url,
      year: String(year),
      tabId: String(year),
      createdAt: new Date().toISOString(),
    };

    galleryMemoryDB.unshift(newImage); // Put at top (latest)

    return NextResponse.json({
      success: true,
      message: "Image added successfully",
      data: newImage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
