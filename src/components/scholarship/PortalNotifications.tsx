import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  XCircle,
  ListTodo,
  BookOpen,
  AlertCircle,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ScholarshipNotification } from "@/types/scholarship";

interface PortalNotificationsProps {
  notifications: ScholarshipNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export function PortalNotifications({
  notifications,
  markNotificationRead,
  markAllNotificationsRead,
}: PortalNotificationsProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "new_task":
        return <ListTodo className="w-5 h-5 text-primary" />;
      case "task_approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "task_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "module_unlocked":
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (notifications.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! Check back later for updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
            <Check className="w-4 h-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-secondary/50 transition-colors ${
                !notification.is_read ? "bg-primary/5" : ""
              }`}
              onClick={() => !notification.is_read && markNotificationRead(notification.id)}
            >
              <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-medium ${!notification.is_read ? "text-primary" : ""}`}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <Badge className="bg-primary/10 text-primary text-xs shrink-0">New</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
