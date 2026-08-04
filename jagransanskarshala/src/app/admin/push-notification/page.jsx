"use client";

import PushNotificationView from "@/components/Admin/PushNotificationView";

export default function PushNotificationPage() {
  return (
    <>
      <header className="p-6 sm:p-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Push Notifications</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">पुश नोटिफिकेशन एवं घोषणाएं</p>
      </header>
      <div className="px-4 sm:px-8 pb-8">
        <PushNotificationView />
      </div>
    </>
  );
}
