import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Heart, User, Users } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Search" },
  { to: "/create", icon: PlusSquare, label: "Create" },
  { to: "/connections", icon: Users, label: "Connect" },
  { to: "/notifications", icon: Heart, label: "Activity", badge: true },
  { to: "/profile", icon: User, label: "Profile" },
];

const MobileNav = () => {
  const location = useLocation();
  const { data: unreadCount } = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-1 lg:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-all duration-200 ${
              isActive
                ? "text-primary font-bold"
                : "text-foreground/50 active:text-foreground"
            }`}
          >
            <div className="relative">
              <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              {item.badge && !!unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className={`leading-tight ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
