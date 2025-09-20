import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  CreditCard,
  User,
  BarChart3,
  Settings,
  Bell,
  GraduationCap,
  ClipboardList,
  Upload,
  Calendar,
  Shield,
  Database,
  Activity,
  TrendingUp,
  Award,
  Target,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Folder,
  Plus,
  Edit,
  CheckCircle,
  List,
  Camera,
  RotateCcw,
  Star,
  X,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: SidebarItem[];
  badge?: string | number;
  isNew?: boolean;
}

interface DashboardSidebarProps {
  userRole: "student" | "trainer" | "admin";
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  userRole,
  isOpen,
  onToggle,
  onLogout,
  user,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const getSidebarItems = (): SidebarItem[] => {
    switch (userRole) {
      case "student":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/dashboard",
          },
          {
            id: "courses",
            label: "My Courses",
            icon: BookOpen,
            href: "/student/courses",
            badge: 3,
          },
          {
            id: "assignments",
            label: "Assignments",
            icon: ClipboardList,
            children: [
              {
                id: "my-assignments",
                label: "My Assignments",
                icon: FileText,
                href: "/student/assignments",
                badge: 5,
              },
              {
                id: "submissions",
                label: "Submissions",
                icon: Upload,
                href: "/student/submissions",
              },
              {
                id: "grades",
                label: "Grades",
                icon: Award,
                href: "/student/grades",
              },
            ],
          },
          {
            id: "progress",
            label: "Progress",
            icon: TrendingUp,
            children: [
              {
                id: "learning-path",
                label: "Learning Path",
                icon: Target,
                href: "/student/progress",
              },
              {
                id: "certificates",
                label: "Certificates",
                icon: Award,
                href: "/student/certificates",
              },
              {
                id: "achievements",
                label: "Achievements",
                icon: Star,
                href: "/student/achievements",
              },
            ],
          },
          {
            id: "payments",
            label: "Payments",
            icon: CreditCard,
            href: "/student/payments",
            badge: 2,
          },
          {
            id: "profile",
            label: "Profile",
            icon: User,
            href: "/student/profile",
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            href: "/student/notifications",
            badge: 4,
          },
        ];

      case "trainer":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, href: "/trainer" },
          {
            id: "courses",
            label: "My Courses",
            icon: BookOpen,
            children: [
              {
                id: "course-list",
                label: "Course List",
                icon: List,
                href: "/trainer/courses",
              },
              {
                id: "course-management",
                label: "Course Management",
                icon: Settings,
                href: "/trainer/course-management",
              },
              {
                id: "materials",
                label: "Materials",
                icon: FileText,
                href: "/trainer/materials",
              },
            ],
          },
          {
            id: "students",
            label: "Students",
            icon: Users,
            children: [
              {
                id: "student-list",
                label: "Student List",
                icon: Users,
                href: "/trainer/students",
              },
              {
                id: "student-progress",
                label: "Student Progress",
                icon: TrendingUp,
                href: "/trainer/student-progress",
              },
              {
                id: "attendance",
                label: "Attendance",
                icon: Calendar,
                href: "/trainer/attendance",
              },
            ],
          },
          {
            id: "assignments",
            label: "Assignments",
            icon: ClipboardList,
            children: [
              {
                id: "create-assignment",
                label: "Create Assignment",
                icon: Plus,
                href: "/trainer/assignments/create",
              },
              {
                id: "manage-assignments",
                label: "Manage Assignments",
                icon: Edit,
                href: "/trainer/assignments",
              },
              {
                id: "grade-submissions",
                label: "Grade Submissions",
                icon: CheckCircle,
                href: "/trainer/submissions",
                badge: 12,
              },
            ],
          },
          {
            id: "quizzes",
            label: "Quizzes",
            icon: HelpCircle,
            children: [
              {
                id: "create-quiz",
                label: "Create Quiz",
                icon: Plus,
                href: "/trainer/quizzes/create",
              },
              {
                id: "manage-quizzes",
                label: "Manage Quizzes",
                icon: Edit,
                href: "/trainer/quizzes",
              },
              {
                id: "quiz-results",
                label: "Quiz Results",
                icon: BarChart3,
                href: "/trainer/quiz-results",
              },
            ],
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: BarChart3,
            href: "/trainer/analytics",
          },
          {
            id: "profile",
            label: "Profile",
            icon: User,
            href: "/trainer/profile",
          },
        ];

      case "admin":
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin" },
          {
            id: "courses",
            label: "Courses",
            icon: BookOpen,
            children: [
              {
                id: "course-list",
                label: "Course List",
                icon: List,
                href: "/admin/courses",
              },
              {
                id: "add-course",
                label: "Add Course",
                icon: Plus,
                href: "/admin/courses/add",
              },
              {
                id: "course-categories",
                label: "Categories",
                icon: Folder,
                href: "/admin/course-categories",
              },
            ],
          },
          {
            id: "users",
            label: "Users",
            icon: Users,
            children: [
              {
                id: "user-list",
                label: "User List",
                icon: Users,
                href: "/admin/users",
              },
              {
                id: "add-user",
                label: "Add User",
                icon: Plus,
                href: "/admin/users/add",
              },
              {
                id: "user-roles",
                label: "User Roles",
                icon: Shield,
                href: "/admin/user-roles",
              },
            ],
          },
          {
            id: "registrations",
            label: "Registrations",
            icon: FileText,
            href: "/admin/registrations",
            badge: 8,
          },
          {
            id: "payments",
            label: "Payments",
            icon: CreditCard,
            children: [
              {
                id: "payment-list",
                label: "Payment List",
                icon: List,
                href: "/admin/payments",
              },
              {
                id: "payment-analytics",
                label: "Payment Analytics",
                icon: BarChart3,
                href: "/admin/payment-analytics",
              },
              {
                id: "refunds",
                label: "Refunds",
                icon: RotateCcw,
                href: "/admin/refunds",
              },
            ],
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: BarChart3,
            children: [
              {
                id: "overview",
                label: "Overview",
                icon: BarChart3,
                href: "/admin/analytics",
              },
              {
                id: "reports",
                label: "Reports",
                icon: FileText,
                href: "/admin/reports",
              },
              {
                id: "insights",
                label: "Insights",
                icon: TrendingUp,
                href: "/admin/insights",
              },
            ],
          },
          {
            id: "content",
            label: "Content",
            icon: FileText,
            children: [
              {
                id: "stories",
                label: "Stories",
                icon: FileText,
                href: "/admin/stories",
              },
              {
                id: "media",
                label: "Media Library",
                icon: Camera,
                href: "/admin/media",
              },
              {
                id: "announcements",
                label: "Announcements",
                icon: Bell,
                href: "/admin/announcements",
              },
            ],
          },
          {
            id: "system",
            label: "System",
            icon: Settings,
            children: [
              {
                id: "settings",
                label: "Settings",
                icon: Settings,
                href: "/admin/settings",
              },
              {
                id: "backup",
                label: "Backup",
                icon: Database,
                href: "/admin/backup",
              },
              {
                id: "logs",
                label: "System Logs",
                icon: Activity,
                href: "/admin/logs",
              },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = isExpanded(item.id);
    const isItemActive = item.href ? isActive(item.href) : false;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
            level > 0 ? "ml-4" : ""
          } ${
            isItemActive
              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {item.href ? (
            <Link to={item.href} className="flex items-center space-x-3 flex-1">
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.isNew && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  New
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => hasChildren && toggleExpanded(item.id)}
              className="flex items-center space-x-3 flex-1 text-left"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.isNew && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  New
                </span>
              )}
            </button>
          )}

          <div className="flex items-center space-x-2">
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(item.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isItemExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {hasChildren && isItemExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarItems = getSidebarItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KM Media</h1>
              <p className="text-xs text-gray-500 capitalize">
                {userRole} Portal
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user.firstName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
