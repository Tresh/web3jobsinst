import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rocket, Clock, Users, CheckCircle } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import type { Bootcamp, BootcampApplication } from "@/types/bootcamp";

interface TelegramChatListProps {
  bootcamps?: Bootcamp[];
  applications?: (BootcampApplication & { bootcamp?: Bootcamp })[];
  type: "ongoing" | "applied" | "hosting";
  emptyMessage: string;
  emptySubtext: string;
}

const TelegramChatList = ({
  bootcamps = [],
  applications = [],
  type,
  emptyMessage,
  emptySubtext,
}: TelegramChatListProps) => {
  const navigate = useNavigate();

  const getBootcampProgress = (bootcamp: Bootcamp) => {
    if (!bootcamp.start_date) return { currentDay: 0, totalDays: bootcamp.duration_days };
    const startDate = parseISO(bootcamp.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    const currentDay = Math.min(Math.max(daysPassed, 1), bootcamp.duration_days);
    return { currentDay, totalDays: bootcamp.duration_days };
  };

  const getStatusLabel = (bootcamp: Bootcamp) => {
    if (bootcamp.status === "active") {
      const { currentDay, totalDays } = getBootcampProgress(bootcamp);
      return `Day ${currentDay} • Daily task available`;
    }
    if (bootcamp.status === "approved") {
      return `Starts ${bootcamp.start_date ? format(parseISO(bootcamp.start_date), "MMM d") : "Soon"}`;
    }
    if (bootcamp.status === "completed") {
      return "Completed";
    }
    return bootcamp.status;
  };

  const getStatusBadge = (bootcamp: Bootcamp) => {
    if (bootcamp.status === "active") {
      return (
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-green-500 font-medium">Live</span>
        </span>
      );
    }
    if (bootcamp.status === "approved") {
      return <Badge variant="outline" className="text-xs">Starting Soon</Badge>;
    }
    if (bootcamp.status === "completed") {
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle className="w-3 h-3" />
          Done
        </span>
      );
    }
    return null;
  };

  const handleClick = (bootcamp: Bootcamp, isApplication = false) => {
    if (isApplication) {
      // For applications, show application status (could be a modal or different route)
      navigate(`/bootcamps/${bootcamp.id}`);
    } else {
      navigate(`/bootcamps/${bootcamp.id}`);
    }
  };

  // Check if lists are empty
  const isEmpty = type === "applied" ? applications.length === 0 : bootcamps.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-medium text-foreground mb-1">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">{emptySubtext}</p>
        <Link
          to="/bootcamps"
          className="mt-4 text-sm text-primary hover:underline font-medium"
        >
          Browse Bootcamps →
        </Link>
      </div>
    );
  }

  // Render bootcamps (ongoing or hosting)
  if (type !== "applied") {
    return (
      <div className="divide-y divide-border/50">
        {bootcamps.map((bootcamp) => (
          <button
            key={bootcamp.id}
            onClick={() => handleClick(bootcamp)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
          >
            {/* Avatar / Icon */}
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                {bootcamp.cover_image_url ? (
                  <AvatarImage src={bootcamp.cover_image_url} alt={bootcamp.title} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {bootcamp.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Active indicator glow */}
              {bootcamp.status === "active" && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20 -z-10" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="font-semibold truncate text-foreground">{bootcamp.title}</h4>
                {getStatusBadge(bootcamp)}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {type === "hosting" ? (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {bootcamp.current_participants} / {bootcamp.max_participants} participants
                  </span>
                ) : (
                  <span>{bootcamp.host_name}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {getStatusLabel(bootcamp)}
              </p>
            </div>

            {/* Unread indicator for active bootcamps */}
            {bootcamp.status === "active" && type === "ongoing" && (
              <div className="shrink-0">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  !
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Render applications
  return (
    <div className="divide-y divide-border/50">
      {applications.map((application) => (
        <button
          key={application.id}
          onClick={() => application.bootcamp && handleClick(application.bootcamp, true)}
          className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left opacity-70"
        >
          {/* Avatar / Icon */}
          <Avatar className="w-12 h-12 border border-border/50 shrink-0">
            {application.bootcamp?.cover_image_url ? (
              <AvatarImage src={application.bootcamp.cover_image_url} alt={application.bootcamp?.title} />
            ) : null}
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-bold">
              {application.bootcamp?.title?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h4 className="font-semibold truncate text-foreground">
                {application.bootcamp?.title || "Unknown Bootcamp"}
              </h4>
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {application.bootcamp?.host_name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied {format(parseISO(application.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TelegramChatList;
