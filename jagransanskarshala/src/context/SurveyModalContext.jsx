"use client";

import { createContext, useContext, useState } from "react";

const SurveyModalContext = createContext();

export function SurveyModalProvider({ children }) {
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const openSurveyModal = () => setIsSurveyModalOpen(true);
  const closeSurveyModal = () => setIsSurveyModalOpen(false);

  return (
    <SurveyModalContext.Provider
      value={{
        isSurveyModalOpen,
        openSurveyModal,
        closeSurveyModal,
      }}
    >
      {children}
    </SurveyModalContext.Provider>
  );
}

export function useSurveyModal() {
  const context = useContext(SurveyModalContext);
  if (!context) {
    throw new Error("useSurveyModal must be used within a SurveyModalProvider");
  }
  return context;
}
