import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  Home,
  Users,
  Briefcase,
  Handshake,
  Calendar,
  MessageSquare,
  Sparkles,
  Bell,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  PanelLeftClose
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import AlevateLogo from '../common/AlevateLogo';

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
  sidebarOpen = true,
  setSidebarOpen = () => {}
}) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [hoveredItem, setHoveredItem] = useState(null);

  const role = user?.role || 'student';

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  const navItems = [
    {
      to:
        role === 'alumni'
          ? '/alumni/dashboard'
          : role === 'admin'
            ? '/admin/dashboard'
            : '/student/dashboard',
      icon: Home,
      label: 'Dashboard'
    },
    {
      to: '/mentors',
      icon: Users,
      label: 'Find Mentors'
    },
    {
      to: '/jobs',
      icon: Briefcase,
      label: 'Jobs & Internships'
    },
    {
      to: '/referrals',
      icon: Handshake,
      label: 'Referrals Network'
    },
    {
      to: '/sessions',
      icon: Calendar,
      label: 'Mentorship Sessions'
    },
    {
      to: '/messages',
      icon: MessageSquare,
      label: 'Messages'
    },
    {
      to: '/ai-companion',
      icon: Sparkles,
      label: 'Alevate AI',
      badge: 'AI'
    },
    {
      to: '/notifications',
      icon: Bell,
      label: 'Notifications'
    },
    {
      to: '/profile',
      icon: User,
      label: 'My Profile'
    }
  ];

  // Admin only
  if (role === 'admin') {
    navItems.push({
      to: '/admin/dashboard',
      icon: ShieldCheck,
      label: 'Admin Console'
    });
  }

  // =========================================================
  // ROLE BADGES
  // =========================================================

  const roleBadgeStyles = {
    student:
      'bg-purple-500/10 text-purple-300 border-purple-500/40',

    alumni:
      'bg-purple-500/10 text-purple-300 border-purple-500/40',

    admin:
      'bg-purple-500/10 text-purple-300 border-purple-500/40'
  };

  // =========================================================
  // ACTIVE ROUTE
  // =========================================================

  const isActiveRoute = (item) => {
    return (
      location.pathname === item.to ||
      (item.to !== '/' && location.pathname.startsWith(item.to))
    );
  };

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
          ===================================================== */}

      <aside
        className={`
          hidden md:flex
          fixed
          left-0
          top-0
          bottom-0
          z-40
          w-64
          flex-col
          py-4
          px-4
          select-none

          bg-[#080808]

          border-r
          border-purple-500/30

          shadow-[2px_0_20px_rgba(168,85,247,0.08)]

          transition-transform
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* =================================================
            LOGO + CLOSE BUTTON
            ================================================= */}

        <div className="mb-6 flex items-center justify-between px-1">

          <NavLink
            to={
              role === 'alumni'
                ? '/alumni/dashboard'
                : role === 'admin'
                  ? '/admin/dashboard'
                  : '/student/dashboard'
            }
            className="flex items-center gap-3 group"
            title="ALEVATE Home"
          >
            <AlevateLogo
              size="md"
              showText={true}
              subtitle="Mentorship & Careers"
            />
          </NavLink>

          {/* ONLY ICON — NO "COLLAPSE" TEXT */}

          <button
            onClick={() => setSidebarOpen(false)}
            className="
              p-2
              rounded-xl

              text-gray-500

              hover:text-purple-300
              hover:bg-purple-500/10

              border
              border-transparent

              hover:border-purple-500/30

              transition-all
            "
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="flex-1 w-full space-y-1.5 overflow-y-auto pr-1">

          {navItems.map((item) => {

            const Icon = item.icon;
            const isActive = isActiveRoute(item);

            return (
              <div
                key={item.to}
                className="relative w-full"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >

                <NavLink
                  to={item.to}
                  className={`
                    flex
                    items-center
                    gap-3
                    w-full
                    px-3.5
                    py-2.5

                    rounded-2xl

                    text-xs
                    font-bold

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          bg-[#A855F7]
                          text-white
                          shadow-lg
                          shadow-purple-500/25
                        `
                        : `
                          text-gray-400

                          hover:text-purple-300
                          hover:bg-purple-500/10
                        `
                    }
                  `}
                >

                  <Icon
                    className={`
                      w-5
                      h-5
                      shrink-0

                      transition-transform
                      duration-200

                      ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-purple-300'
                      }
                    `}
                  />

                  <span className="flex-1 truncate">
                    {item.label}
                  </span>

                  {/* AI BADGE */}

                  {item.badge && (
                    <span
                      className={`
                        text-[10px]
                        font-extrabold
                        px-1.5
                        py-0.5
                        rounded-md

                        ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}

                </NavLink>

              </div>
            );
          })}

        </nav>

        {/* =================================================
            BOTTOM USER CARD
            ================================================= */}

        <div
          className="
            w-full
            pt-3
            mt-2

            border-t
            border-purple-500/20
          "
        >

          <div
            className="
              bg-[#120B1A]
              border
              border-purple-500/30

              rounded-2xl

              p-2.5

              flex
              items-center
              justify-between
            "
          >

            <div className="flex items-center gap-2.5 min-w-0">

              {/* USER INITIALS */}

              <div
                className="
                  w-8
                  h-8
                  rounded-xl

                  bg-purple-500
                  text-white

                  font-bold
                  text-xs

                  flex
                  items-center
                  justify-center

                  shrink-0
                "
              >
                {user?.name?.substring(0, 2).toUpperCase() || 'AL'}
              </div>

              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    font-bold
                    text-white
                    truncate
                  "
                >
                  {user?.name || 'Alex Rivera'}
                </p>

                <span
                  className={`
                    inline-block
                    text-[10px]
                    font-bold
                    px-1.5
                    py-0.5

                    rounded
                    border

                    uppercase

                    ${
                      roleBadgeStyles[role] ||
                      roleBadgeStyles.student
                    }
                  `}
                >
                  {role}
                </span>

              </div>

            </div>

            {/* LOGOUT */}

            <button
              onClick={logout}
              className="
                p-1.5
                rounded-lg

                text-gray-500

                hover:text-purple-300
                hover:bg-purple-500/10

                transition-colors
              "
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MOBILE DRAWER
          ===================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            md:hidden

            bg-black/70
            backdrop-blur-sm

            flex
          "
        >

          {/* MOBILE SIDEBAR */}

          <div
            className="
              w-72
              max-w-[80vw]
              h-full

              bg-[#080808]

              border-r
              border-purple-500/30

              shadow-2xl

              flex
              flex-col

              p-5

              animate-in
              slide-in-from-left
              duration-200
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between

                pb-4
                border-b
                border-purple-500/20

                mb-4
              "
            >

              <AlevateLogo
                size="sm"
                showText={true}
                subtitle="Mentorship"
              />

              <button
                onClick={() => setMobileOpen(false)}
                className="
                  p-1.5
                  rounded-lg

                  text-gray-500

                  hover:text-purple-300
                  hover:bg-purple-500/10
                "
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* MOBILE NAV */}

            <nav className="flex-1 overflow-y-auto space-y-1">

              {navItems.map((item) => {

                const Icon = item.icon;
                const isActive = isActiveRoute(item);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex
                      items-center
                      gap-3

                      px-3.5
                      py-2.5

                      rounded-xl

                      text-xs
                      font-bold

                      transition-all

                      ${
                        isActive
                          ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                          : 'text-gray-400 hover:bg-purple-500/10 hover:text-purple-300'
                      }
                    `}
                  >

                    <Icon className="w-4 h-4 shrink-0" />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`
                          text-[10px]
                          px-1.5
                          py-0.5
                          rounded
                          font-bold

                          ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-purple-500/10 text-purple-300'
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}

                  </NavLink>
                );
              })}

            </nav>

            {/* MOBILE BOTTOM */}

            <div
              className="
                pt-4
                border-t
                border-purple-500/20
                space-y-2
              "
            >

              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="
                  flex
                  items-center
                  gap-3

                  px-3
                  py-2

                  text-xs
                  font-bold

                  text-gray-400

                  hover:bg-purple-500/10
                  hover:text-purple-300

                  rounded-xl
                "
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="
                  w-full

                  flex
                  items-center
                  gap-3

                  px-3
                  py-2

                  text-xs
                  font-bold

                  text-purple-300

                  hover:bg-purple-500/10

                  rounded-xl
                "
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

            </div>

          </div>

          {/* CLICK OUTSIDE TO CLOSE */}

          <div
            className="flex-1"
            onClick={() => setMobileOpen(false)}
          />

        </div>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          ===================================================== */}

      <div
        className="
          md:hidden

          fixed
          bottom-0
          left-0
          right-0

          z-40

          bg-[#080808]/95
          backdrop-blur-md

          border-t
          border-purple-500/20

          px-3
          py-2

          flex
          items-center
          justify-around
        "
      >

        <NavLink
          to={
            role === 'alumni'
              ? '/alumni/dashboard'
              : role === 'admin'
                ? '/admin/dashboard'
                : '/student/dashboard'
          }
          className={({ isActive }) =>
            `
              flex
              flex-col
              items-center
              gap-1

              py-1
              px-2.5

              rounded-xl

              text-[10px]
              font-bold

              ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }
            `
          }
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/mentors"
          className={({ isActive }) =>
            `
              flex
              flex-col
              items-center
              gap-1

              py-1
              px-2.5

              rounded-xl

              text-[10px]
              font-bold

              ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }
            `
          }
        >
          <Users className="w-4 h-4" />
          <span>Mentors</span>
        </NavLink>

        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `
              flex
              flex-col
              items-center
              gap-1

              py-1
              px-2.5

              rounded-xl

              text-[10px]
              font-bold

              ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }
            `
          }
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `
              flex
              flex-col
              items-center
              gap-1

              py-1
              px-2.5

              rounded-xl

              text-[10px]
              font-bold

              ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }
            `
          }
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </NavLink>

        <NavLink
          to="/ai-companion"
          className={({ isActive }) =>
            `
              flex
              flex-col
              items-center
              gap-1

              py-1
              px-2.5

              rounded-xl

              text-[10px]
              font-bold

              ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }
            `
          }
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI</span>
        </NavLink>

      </div>
    </>
  );
}