import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, ChevronDown, ChevronUp, Shield } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_PREFS: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const savePrefs = (preferences: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setVisible(false);
  };

  const acceptAll = () => {
    savePrefs({ essential: true, analytics: true, marketing: true, functional: true });
  };

  const declineAll = () => {
    savePrefs({ essential: true, analytics: false, marketing: false, functional: false });
  };

  const saveCustom = () => {
    savePrefs({ ...prefs, essential: true });
  };

  const categories = [
    {
      key: "essential" as const,
      label: "Essential",
      description: "Required for the site to function. Cannot be disabled.",
      locked: true,
    },
    {
      key: "analytics" as const,
      label: "Analytics",
      description: "Help us understand how visitors interact with our site.",
      locked: false,
    },
    {
      key: "functional" as const,
      label: "Functional",
      description: "Enable personalized features and remember your preferences.",
      locked: false,
    },
    {
      key: "marketing" as const,
      label: "Marketing",
      description: "Used for targeted advertising and promotions.",
      locked: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Main banner */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">We value your privacy</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can customize your preferences below.
              </p>
            </div>
          </div>

          {/* Expandable categories */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-4"
          >
            <Shield className="w-3.5 h-3.5" />
            Customize preferences
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="space-y-3 mb-4 p-4 bg-secondary/50 rounded-xl">
              {categories.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <Switch
                    checked={prefs[cat.key]}
                    onCheckedChange={(checked) =>
                      !cat.locked && setPrefs((p) => ({ ...p, [cat.key]: checked }))
                    }
                    disabled={cat.locked}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {showDetails ? (
              <>
                <Button onClick={saveCustom} size="sm" className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={acceptAll} variant="outline" size="sm" className="flex-1">
                  Accept All
                </Button>
              </>
            ) : (
              <>
                <Button onClick={acceptAll} size="sm" className="flex-1">
                  Accept All
                </Button>
                <Button onClick={declineAll} variant="outline" size="sm" className="flex-1">
                  Decline All
                </Button>
              </>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-3">
            Read our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            {" "}for more information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
