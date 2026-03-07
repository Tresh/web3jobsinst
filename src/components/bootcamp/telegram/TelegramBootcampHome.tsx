import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMyBootcamps } from "@/hooks/useBootcamps";
import { useMyBootcampApplications } from "@/hooks/useBootcampApplications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Search, Rocket, Clock, Briefcase } from "lucide-react";
import TelegramChatList from "./TelegramChatList";

type TabType = "ongoing" | "applied" | "hosting";

const TelegramBootcampHome = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  const { joinedBootcamps, hostedBootcamps, loading: loadingBootcamps } = useMyBootcamps();
  const { applications, loading: loadingApplications } = useMyBootcampApplications();
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  const pendingApplications = applications.filter(
    (app) => app.status === "pending" && app.bootcamp
  );

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "ongoing", label: "Ongoing", icon: <Rocket className="w-4 h-4" />, count: joinedBootcamps.length },
    { id: "applied", label: "Applied", icon: <Clock className="w-4 h-4" />, count: pendingApplications.length },
    { id: "hosting", label: "My Bootcamps", icon: <Briefcase className="w-4 h-4" />, count: hostedBootcamps.length },
  ];

  const tabOrder: TabType[] = ["ongoing", "applied", "hosting"];

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const endX = e.changedTouches[0].clientX;
    const diff = startXRef.current - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (diff > 0 && currentIndex < tabOrder.length - 1) {
        // Swipe left - go to next tab
        setActiveTab(tabOrder[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }
  };

  const loading = loadingBootcamps || loadingApplications;

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg">Bootcamps</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/bootcamps">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/bootcamps/create">
                <Button variant="ghost" size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area - Swipeable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "ongoing" && (
              <TelegramChatList
                bootcamps={joinedBootcamps}
                type="ongoing"
                emptyMessage="No bootcamps joined yet"
                emptySubtext="Browse and join a bootcamp to get started"
              />
            )}
            {activeTab === "applied" && (
              <TelegramChatList
                applications={pendingApplications}
                type="applied"
                emptyMessage="No pending applications"
                emptySubtext="Your submitted applications will appear here"
              />
            )}
            {activeTab === "hosting" && (
              <TelegramChatList
                bootcamps={hostedBootcamps}
                type="hosting"
                emptyMessage="No bootcamps hosted"
                emptySubtext="Create your own bootcamp to start hosting"
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation - Telegram Style */}
      <nav className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.count > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground text-background"
                      }`}
                    >
                      {tab.count > 99 ? "99+" : tab.count}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default TelegramBootcampHome;
