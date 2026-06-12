import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll window and document to top on every route change */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const main = document.getElementById("app-main-content");
    if (main) main.scrollTop = 0;
  }, [pathname]);

  return null;
}
