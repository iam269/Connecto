import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import connectoLogo from "@/assets/connecto-logo.png";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const Layout = ({ children, title, subtitle }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link to="/">
          <img src={connectoLogo} alt="Connecto" className="h-7" />
        </Link>
        <Link to="/messages" className="text-foreground">
          <MessageCircle className="h-6 w-6" />
        </Link>
      </header>

      {/* Main content */}
      <main className="pt-14 pb-16 lg:pl-[72px] lg:pt-0 lg:pb-0 xl:pl-[240px]">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
          {title && (
            <div className="mb-2">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>

      <MobileNav />

      {/* Footer */}
      <footer className="fixed bottom-14 left-0 right-0 z-30 border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground lg:bottom-0 lg:left-[72px] xl:left-[240px]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>© 2026 Connecto</span>
          <span className="hidden sm:inline">·</span>
          <a href="/privacy" className="hover:text-primary">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-primary">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
