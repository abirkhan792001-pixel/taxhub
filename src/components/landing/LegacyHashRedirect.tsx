"use client";

import { useEffect } from "react";

// The app used to live at "/" with #wissen, #posteingang and #quellen tabs; keep shared links working.
export function LegacyHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (["#wissen", "#posteingang", "#quellen"].includes(hash)) window.location.replace(`/app${hash}`);
  }, []);
  return null;
}
