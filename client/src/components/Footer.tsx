import React from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "My Registrations", href: "/my-registrations" },
  { name: "Contact", href: "/register" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-primary/10 to-secondary/10 border-t border-primary/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Branding */}
        <div className="md:col-span-1 flex flex-col gap-2 items-start">
          <img
            src="/images/logo.jpeg"
            alt="KM Media Logo"
            className="h-16 w-16 object-contain rounded-full shadow mb-2"
            style={{ background: '#fff' }}
          />
          <span className="font-extrabold text-2xl text-primary tracking-tight">
            KM Media Training Institute
          </span>
          {/* <span className="text-gray-600 text-sm">Training Institute</span> */}
          <span className="text-gray-400 text-xs mt-2">
            Empowering your professional journey
          </span>
        </div>
        {/* Navigation */}
        <div className="md:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
            Navigate
          </h4>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-600 hover:text-primary transition-colors text-sm"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* Contact */}
        <div className="md:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" />
                <path d="M12 16v2m0 0h-2m2 0h2" />
              </svg>
              <a
                href="mailto:info@kmmedia.com"
                className="hover:text-primary transition-colors"
              >
                info@kmmedia.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <a
                href="tel:+1234567890"
                className="hover:text-primary transition-colors"
              >
                +1 (234) 567-890
              </a>
            </li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.21-.005-.423-.015-.633A9.936 9.936 0 0 0 24 4.557z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2 3.6 4.59v5.606z" />
              </svg>
            </a>
          </div>
        </div>
        {/* Legal */}
        <div className="md:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
            Legal
          </h4>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-gray-600 hover:text-primary transition-colors text-sm"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-4 border-t border-primary/10 bg-white/10">
        &copy; {new Date().getFullYear()} KM Media Training Institute. All
        rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
