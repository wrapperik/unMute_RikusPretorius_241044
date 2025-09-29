import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  Home as HomeIcon,
  Compass,
  BookOpen,
  Info,
  NotebookPen,
  LibraryBig,
  User as UserIcon,
  LayoutDashboard,
  LogIn,
  LogOut
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";


export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Menu links based on user state
  let links = [
    { to: "/", label: "Home" },
    { to: "/explore", label: "Explore" },
    { to: "/resources", label: "Resources" },
    { to: "/about", label: "About" },
  ];
  if (user) {
    links.splice(2, 0, { to: "/journal", label: "Journal" });
    const isAdmin = user.is_admin || user?.user?.is_admin;
    if (isAdmin) {
      links.push({ to: "/admin", label: "Admin Dashboard" });
    }
    links.push({ to: "/account", label: "Account" });
  }

  // Auth links
  let authLinks = [];
  if (!user) {
    authLinks = [
      { to: "/login", label: "Sign Up / Log In" },
    ];
  } else {
    authLinks = [
      { to: "#", label: "Logout", onClick: () => { logout(); navigate("/"); } },
    ];
  }

  // Icon mapping by label (simple approach without extra prop plumbing)
  const iconByLabel = {
    Home: HomeIcon,
    Explore: Compass,
    Resources: BookOpen,
    About: Info,
    Journal: NotebookPen,
    Account: UserIcon,
    'Admin Dashboard': LayoutDashboard,
    'Sign Up / Log In': LogIn,
    Logout: LogOut,
  };

  // NavLink class for active route (add flex & gap for icon + label)
  const navLinkClass = ({ isActive }) =>
    `${isActive ? 'font-bold text-green-900' : ''} flex items-center gap-2`;

  // Render menu items
  const renderLinks = (isMobile = false) => (
    <>
      {links.map((link) => {
        const Icon = iconByLabel[link.label];
        return (
          <li key={link.to} className={isMobile ? 'w-full flex justify-end' : ''}>
            <NavLink
              to={link.to}
              className={navLinkClass}
              onClick={(e) => {
                if (link.onClick) link.onClick(e);
                if (isMobile) setMobileOpen(false);
              }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{link.label}</span>
            </NavLink>
          </li>
        );
      })}
      {authLinks.map((link) => {
        const Icon = iconByLabel[link.label];
        return (
          <li key={link.label} className={isMobile ? 'w-full flex justify-end' : ''}>
            {link.onClick ? (
              <button
                onClick={(e) => {
                  link.onClick(e);
                  if (isMobile) setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 justify-end lg:justify-start"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </button>
            ) : (
              <NavLink
                to={link.to}
                className={navLinkClass}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </NavLink>
            )}
          </li>
        );
      })}
    </>
  );

  return (
    <div className="navbar relative shadow-sm text-black bg-white sticky top-0 z-50 md:px-20 transition-colors">
      <div className="flex-1">
        <Link to="/" className="p-2 text-xl inline-flex items-center" aria-label="unMute home">
          {/* use public folder image; keep height similar to surrounding text */}
          <img src="/u-logo.png" alt="unMute" className="h-10 w-auto" />
        </Link>
      </div>

      {/* Mobile hamburger button */}
      <div className="flex-none lg:hidden">
        <button
          aria-label="Toggle navigation menu"
          aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
          className="btn btn-ghost btn-circle"
        >
          <Menu className={`w-6 h-6 transition-transform duration-300 ${mobileOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Desktop menu */}
      <div className="flex-none hidden lg:block">
        <ul className="menu menu-horizontal px-1">
          {renderLinks(false)}
        </ul>
      </div>

      {/* Full-width mobile dropdown panel */}
      <div
        id="mobile-nav"
        className={`lg:hidden absolute left-0 top-full w-screen bg-white border-t border-gray-200 shadow-md overflow-hidden
          transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(.4,0,.2,1)] will-change-transform will-change-opacity
          motion-reduce:transition-none motion-reduce:max-h-full motion-reduce:opacity-100 motion-reduce:translate-y-0
          ${mobileOpen ? 'max-h-[520px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
        `}
        role="navigation"
        aria-label="Mobile"
        aria-hidden={!mobileOpen}
      >
        <ul className="flex flex-col gap-4 p-6 items-end text-right font-medium">
          {renderLinks(true)}
        </ul>
      </div>
    </div>
  );
}