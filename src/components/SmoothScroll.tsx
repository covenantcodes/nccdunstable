import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startSmoothScroll, stopSmoothScroll } from "../lib/smoothScroll";

/** Inertial smooth scrolling on the public site; the admin area keeps native scrolling. */
export function SmoothScroll() {
  const admin = useLocation().pathname.startsWith("/admin");
  useEffect(() => {
    if (admin) return;
    startSmoothScroll();
    return stopSmoothScroll;
  }, [admin]);
  return null;
}
