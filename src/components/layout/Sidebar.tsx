import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Search, Users, MessageCircle, Heart, PlusSquare, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/contexts/ThemeContext";
import { useUnreadCount } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import connectoLogo from "@/assets/connecto-logo.png";
import connectoIcon from "@/assets/connecto-icon.png";
import { Moon, Sun } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/connections", icon: Users, label: "Connections" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/notifications", icon: Heart, label: "Notifications", badge: true },
  { to: "/create", icon: PlusSquare, label: "Create" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { data: unreadCount } = useUnreadCount();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r border-border bg-card lg:flex xl:w-[240px]">
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={connectoIcon} alt="Connecto" className="h-10 w-10 xl:hidden" />
          <img src={connectoLogo} alt="Connecto" className="hidden h-18 xl:block" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-primary/10 ${
                isActive
                  ? "bg-primary/15 font-bold text-primary"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <div className="relative shrink-0">
                <item.icon className={`h-6 w-6 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                {item.badge && !!unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary xl:hidden" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-border px-2 py-4">
        <button
          onClick={toggleTheme}
          className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-foreground"
        >
          {theme === "light" ? <Moon className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110" /> : <Sun className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110" />}
          <span className="hidden xl:inline">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
        <Link
          to="/settings"
          className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-primary/10 ${
            location.pathname === "/settings" ? "bg-primary/15 text-primary font-bold" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          <Settings className={`h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110 ${location.pathname === "/settings" ? "text-primary" : ""}`} />
          <span className="hidden xl:inline">Settings</span>
        </Link>
        <button
          onClick={signOut}
          className="group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground/70 transition-all duration-200 hover:bg-primary/10 hover:text-foreground"
        >
          <LogOut className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="hidden xl:inline">Log Out</span>
        </button>

        {/* User mini profile */}
        {profile && (
          <Link
            to="/profile"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {profile.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:block min-w-0">
              <p className="text-sm font-semibold truncate">{profile.username}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.full_name}</p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
