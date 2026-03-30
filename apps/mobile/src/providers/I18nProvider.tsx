"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    // Force re-render to ensure i18n is ready on the client
    setInit(true);
  }, []);

  if (!init) return null; // Wait for hydration / client-side

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
