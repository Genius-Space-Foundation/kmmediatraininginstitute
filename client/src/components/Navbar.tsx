import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import Logo from "./Logo";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  BookOpen,
  Home,
  FileText,
  Users,
  BarChart3,
  GraduationCap,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!isDarkMode).toString());
  };

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: "Home", href: "/", icon: Home },
      { name: "About", href: "/about", icon: Users },
      { name: "Courses", href: "/courses", icon: BookOpen },
      { name: "Stories", href: "/stories", icon: FileText },
    ];

    if (hasRole("admin")) {
      return [
        ...baseItems,
        { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
      ];
    }

    if (hasRole("trainer")) {
      return [
        ...baseItems,
        { name: "Trainer Dashboard", href: "/trainer", icon: GraduationCap },
      ];
    }

    if (user) {
      return [
        ...baseItems,
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <Logo size="md" showText={true} />
            </Link>
          </div>

          {/* Desktop navigation - Centered */}
          <div className="hidden lg:flex lg:items-center lg:justify-center flex-1">
            <div className="flex space-x-4 xl:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 touch-target ${
                      isActive
                        ? "text-blue-600 bg-blue-50 border border-blue-200"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden xl:inline">{item.name}</span>
                    <span className="xl:hidden">{item.name.split(" ")[0]}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search bar - Commented out as requested */}
          {/* <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                     <form onSubmit={handleSearch} className="w-full">
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <input
                           type="text"
                           placeholder="Search courses..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                         />
                       </div>
                     </form>
                   </div> */}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            {user && (
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors touch-target"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-up">
          <div className="px-4 py-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12">
                <Logo size="md" showText={false} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  KM Media
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Training Institute
                </span>
              </div>
            </div>

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
            </form>

            {/* Mobile navigation - Main Menu */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Navigation
              </h3>
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors touch-target ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile user section */}
            {user ? (
              <div className="space-y-6">
                {/* User profile section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Account
                  </h3>

                  {/* User info */}
                  <div className="flex items-center px-3 py-3 mb-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* User menu items */}
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Quick Actions
                  </h3>

                  <div className="space-y-1">
                    <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target">
                      <Bell className="h-4 w-4 mr-3" />
                      Notifications
                      <span className="ml-auto h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        3
                      </span>
                    </button>

                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                    >
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 mr-3" />
                      ) : (
                        <Moon className="h-4 w-4 mr-3" />
                      )}
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              /* Guest user section */
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    Account
                  </h3>

                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      className="flex items-center justify-center w-full px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors touch-target"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>

                {/* Theme toggle for guests */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4 mr-3" />
                    ) : (
                      <Moon className="h-4 w-4 mr-3" />
                    )}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
              </div>
            )}

            {/* Contact information */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Contact
              </h3>

              <div className="space-y-2 px-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>info@kmmedia.com</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-3 text-gray-400" />
                  <span>www.kmmedia.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
