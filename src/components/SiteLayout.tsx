import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Menu, Youtube, X } from "lucide-react";
import { church, navItems } from "../config";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return (
    <header
      className={`site-header ${scrolled || location.pathname !== "/" ? "scrolled" : ""}`}
    >
      <div className="nav-wrap">
        <Link className="brand" to="/">
          <img src={church.logo} alt={`${church.name} logo`} />
          <span>
            <b>NEW COVENANT</b>
            <small>CHURCH · DUNSTABLE</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link
              className={href === "/give" ? "nav-give" : ""}
              key={href}
              to={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <img
            className="footer-logo"
            src={church.logo}
            alt={`${church.name} logo`}
          />
          <h3>{church.name}</h3>
          <p>
            A place to encounter God, grow in faith, and serve our community.
          </p>
          <p className="placeholder">
            {church.address}
            <br />
            {church.location}
          </p>
        </div>
        <div>
          <h4>Worship with us</h4>
          <p>
            <b>Sunday service</b>
            <br />
            {church.Sunday}
          </p>
          <p>
            <b>Midweek gathering</b>
            <br />
            {church.midweek}
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          {navItems.slice(1).map(([label, href]) => (
            <Link key={href} to={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="footer-contact">
          <h4>Get in touch</h4>
          {church.phone && <p>{church.phone}</p>}
          <p>
            <a href={`mailto:${church.email}`}>{church.email}</a>
          </p>
          <div className="socials">
            {church.socials.map((s) => {
              const Icon =
                s.name === "Instagram"
                  ? Instagram
                  : s.name === "Facebook"
                    ? Facebook
                    : Youtube;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={`Visit NCC Dunstable on ${s.name}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon size={19} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {church.name}
        {/* <span>Made for our Dunstable community</span> */}
      </div>
    </footer>
  );
}
export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
