"use client";

import PublishStoryView from "@/components/Admin/PublishStoryView";

export default function PublishStoryPage() {
  return (
    <>
      <header className="p-6 sm:p-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Publish Story</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">कहानी प्रकाशित करें — सप्ताहिक कहानियां प्रबंधन</p>
      </header>
      <div className="px-4 sm:px-8 pb-8">
        <PublishStoryView />
      </div>
    </>
  );
}
