import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Atom,
  BookMarked,
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  Command,
  CornerDownLeft,
  Flame,
  Info,
  Layers,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import { useStore, importLegacyProgress } from "../lib/store";
import { searchAll, type SearchItem } from "../lib/search";
import { streakDays } from "../lib/stats";
import { cn, Kbd } from "./ui";

type NavItem = { to: string; label: string; icon: typeof Atom; short?: string };

const STUDY: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, short: "Home" },
  { to: "/learn", label: "Learn", icon: BookOpen, short: "Learn" },
  { to: "/practice", label: "Practice", icon: Brain, short: "Practice" },
  { to: "/flashcards", label: "Flashcards", icon: Layers, short: "Cards" },
  { to: "/exam", label: "Exam mode", icon: Timer },
];

const TOOLS: NavItem[] = [
  { to: "/periodic", label: "Periodic table", icon: Atom },
  { to: "/reference", label: "Reference", icon: BookMarked },
  { to: "/calculators", label: "Calculators", icon: Calculator },
];

const YOU: NavItem[] = [
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
];

const ALL = [...STUDY, ...TOOLS, ...YOU];

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const theme = useStore((state) => state.theme);
  const set = useStore((state) => state.set);
  const attempts = useStore((state) => state.att);
  const reduceMotion = useStore((state) => state.reduceMotion);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  const streak = useMemo(() => streakDays(attempts), [attempts]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.motion = reduceMotion ? "reduced" : "full";
  }, [theme, reduceMotion]);

  useEffect(() => {
    importLegacyProgress();
  }, []);

  useEffect(() => {
    setDrawer(false);
    setPalette(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = ALL.find((item) => isActive(location.pathname, item.to));

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <aside className="sidebar" aria-label="Primary">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            <Atom size={22} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="brand-name">Timtom</span>
            <span className="brand-sub">Chemistry Lab</span>
          </span>
        </Link>

        <nav className="sidebar-nav">
          <SidebarGroup label="Study" items={STUDY} pathname={location.pathname} />
          <SidebarGroup label="Tools" items={TOOLS} pathname={location.pathname} />
          <SidebarGroup label="You" items={YOU} pathname={location.pathname} />
        </nav>

        <div className="sidebar-foot">
          <button type="button" className="search-trigger" onClick={() => setPalette(true)}>
            <Search size={15} />
            <span>Search</span>
            <Kbd>⌘K</Kbd>
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            AP Chemistry · Units 3 &amp; 4
            <br />
            Not affiliated with College Board.
          </p>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="md:hidden">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setDrawer(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="topbar-eyebrow">Timtom Chemistry</p>
            <h2 className="topbar-title">{current?.label ?? "Chemistry Lab"}</h2>
          </div>
          <div className="hidden sm:block">
            <button type="button" className="search-trigger" onClick={() => setPalette(true)}>
              <Search size={15} />
              <span className="hidden lg:inline">Search everything</span>
              <Kbd>⌘K</Kbd>
            </button>
          </div>
          {streak > 0 ? (
            <span className="streak-pill" title={`${streak} day streak`}>
              <Flame size={14} /> {streak}
            </span>
          ) : null}
          <button
            type="button"
            className="icon-btn"
            onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main id="main" className="content">
          {children}
        </main>

        <footer className="app-footer">
          <span>Built for AP Chemistry Units 3–4 · {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">Progress stays in your browser.</span>
        </footer>
      </div>

      <nav className="mobile-nav" aria-label="Mobile">
        {[STUDY[0], STUDY[1], STUDY[2], STUDY[3]].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive: active }) => cn("mobile-nav-item", active && "is-active")}
          >
            <item.icon size={19} />
            <span>{item.short ?? item.label}</span>
          </NavLink>
        ))}
        <button type="button" className="mobile-nav-item" onClick={() => setDrawer(true)}>
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>

      {drawer ? (
        <div className="modal-backdrop lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={() => setDrawer(false)} />
          <div className="drawer">
            <div className="flex items-center justify-between">
              <span className="brand-name">Timtom Chemistry</span>
              <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 space-y-4 overflow-y-auto">
              <SidebarGroup label="Study" items={STUDY} pathname={location.pathname} />
              <SidebarGroup label="Tools" items={TOOLS} pathname={location.pathname} />
              <SidebarGroup label="You" items={YOU} pathname={location.pathname} />
            </div>
          </div>
        </div>
      ) : null}

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

function SidebarGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      <p className="sidebar-label">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === "/"} className={() => cn("sidebar-link", isActive(pathname, item.to) && "is-active")}>
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
              {isActive(pathname, item.to) ? <span className="sidebar-dot" aria-hidden /> : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const results = useMemo(() => searchAll(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (item: SearchItem) => {
    navigate(item.href);
    onClose();
  };

  const kindLabel: Record<SearchItem["kind"], string> = {
    page: "Page",
    subunit: "Topic",
    mcq: "Question",
    frq: "Free response",
    element: "Element",
    reference: "Reference",
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close search" onClick={onClose} />
      <div className="palette">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(results.length - 1, index + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              }
              if (event.key === "Enter" && results[active]) go(results[active]);
            }}
            placeholder="Search topics, questions, elements, formulas…"
            className="palette-input"
            aria-label="Search query"
          />
          <Kbd>esc</Kbd>
        </div>
        <div className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">No matches. Try “gas law”, “3.5” or “entropy”.</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
                className={cn("palette-row", index === active && "is-active")}
              >
                <span className="palette-kind">{kindLabel[item.kind]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--ink)]">{item.title}</span>
                  <span className="block truncate text-[11px] text-[var(--muted)]">{item.subtitle}</span>
                </span>
                {index === active ? <CornerDownLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Command size={12} /> K to open
          </span>
          <span>↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </div>
  );
}
