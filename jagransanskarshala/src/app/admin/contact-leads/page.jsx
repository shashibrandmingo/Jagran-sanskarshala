"use client";

import ContactLeadsView from "@/components/Admin/ContactLeadsView";

export default function ContactLeadsPage() {
  return (
    <>
      <header className="p-6 sm:p-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Contact Leads
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-bold mt-0.5">
          कॉन्टैक्ट लीड्स डेटा — Website Enquiries
        </p>
      </header>
      <div className="px-4 sm:px-8 pb-8">
        <ContactLeadsView />
      </div>
    </>
  );
}

