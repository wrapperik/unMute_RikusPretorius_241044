import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { AuthContext } from "../context/AuthContext";


export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // NavLink class for active route
  const navLinkClass = ({ isActive }) =>
    isActive ? "font-bold text-orange" : "";

  // Render menu items
  const renderLinks = (isMobile = false) => (
    <>
      {links.map((link) => (
        <li key={link.to}>
          <NavLink to={link.to} className={navLinkClass} onClick={link.onClick}>{link.label}</NavLink>
        </li>
      ))}
      {authLinks.map((link) => (
        <li key={link.label}>
          {link.onClick ? (
            <button onClick={link.onClick} className="w-full text-left">{link.label}</button>
          ) : (
            <NavLink to={link.to} className={navLinkClass}>{link.label}</NavLink>
          )}
        </li>
      ))}
    </>
  );

  return (
    <div className="navbar shadow-sm text-black bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sticky top-0 z-50 px-10 transition-colors">
      <div className="flex-1">
        <Link to="/" className="p-2 text-xl"><span className="font-bold">un</span><span>Mute</span></Link>
      </div>
      {/* Mobile menu button */}
      <div className="flex-none lg:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <Menu className="w-6 h-6" />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-milk rounded-box w-52">
            {renderLinks(true)}
          </ul>
        </div>
      </div>
      {/* Desktop menu */}
      <div className="flex-none hidden lg:block">
        <ul className="menu menu-horizontal px-1">
          {renderLinks(false)}
        </ul>
      </div>
    </div>
  );
}