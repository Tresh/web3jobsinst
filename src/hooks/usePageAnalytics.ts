import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getCookieConsent = (): boolean => {
  try {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

export const usePageAnalytics = () => {
  const location = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    if (!getCookieConsent()) return;

    const trackPageView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("analytics_events").insert({
          event_type: "page_view",
          page_path: path,
          user_id: user?.id || null,
          metadata: {
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            screen_width: window.innerWidth,
          },
        });
      } catch {
        // Silent fail
      }
    };

    trackPageView();
  }, [location.pathname]);
};
