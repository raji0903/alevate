import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Calendar,
  Briefcase,
  Menu,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import AlevateLogo from '../common/AlevateLogo';
import api from '../../api/client';

export default function Header({
  onOpenMobileMenu = () => {},
  sidebarOpen = true,
  onToggleSidebar = () => {}
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');

        if (res.notifications) {
          setNotifications(res.notifications);

          setUnreadCount(
            res.notifications.filter(
              (notification) => !notification.read
            ).length
          );
        }
      } catch {
        // Quiet fallback
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      setShowMobileSearch(false);

      navigate(
        `/mentors?search=${encodeURIComponent(
          searchTerm.trim()
        )}`
      );
    }
  };

  // =========================================================
  // MARK ALL READ
  // =========================================================

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true
        }))
      );

      setUnreadCount(0);
    } catch {
      // Quiet fallback
    }
  };

  // =========================================================
  // ROLE BADGES
  // =========================================================

  const roleBadgeColors = {
    student:
      'bg-purple-500/10 text-purple-300 border-purple-500/30',

    alumni:
      'bg-purple-500/10 text-purple-300 border-purple-500/30',

    admin:
      'bg-purple-500/10 text-purple-300 border-purple-500/30'
  };

  return (
    <header
      className="
        h-16
        md:h-20

        bg-[#080808]/95
        backdrop-blur-md

        border-b
        border-purple-500/30

        sticky
        top-0
        z-30

        px-3
        sm:px-6
        md:px-8

        flex
        items-center
        justify-between
      "
    >

      {/* =====================================================
          LEFT SIDE
          ===================================================== */}

      <div className="flex items-center gap-2 sm:gap-3">

        {/* MOBILE MENU */}

        <button
          onClick={onOpenMobileMenu}
          className="
            p-2
            -ml-1

            text-gray-400

            hover:text-purple-300
            hover:bg-purple-500/10

            rounded-xl

            transition-colors

            md:hidden
          "
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* =================================================
            DESKTOP SIDEBAR TOGGLE

            CLOSED  → ☰
            OPEN    → no button here
            ================================================= */}

        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="
              hidden
              md:flex

              p-2.5

              text-gray-400

              hover:text-purple-300
              hover:bg-purple-500/10

              rounded-xl

              border
              border-purple-500/20

              transition-all

              items-center
              justify-center
            "
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* MOBILE LOGO */}

        <NavLink
          to={
            user?.role === 'alumni'
              ? '/alumni/dashboard'
              : user?.role === 'admin'
                ? '/admin/dashboard'
                : '/student/dashboard'
          }
          className="flex items-center md:hidden"
        >
          <AlevateLogo
            size="xs"
            showText={true}
            subtitle=""
          />
        </NavLink>

      </div>

      {/* =====================================================
          DESKTOP SEARCH
          ===================================================== */}

      <form
        onSubmit={handleSearchSubmit}
        className="
          relative
          flex-1

          max-w-xs
          md:max-w-sm
          lg:max-w-md

          hidden
          md:block

          mx-3
          lg:mx-4
        "
      >

        <Search
          className="
            w-4
            h-4

            text-gray-500

            absolute
            left-3.5
            top-1/2

            -translate-y-1/2
          "
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          placeholder="Search mentors by skills, Google, Stripe..."
          className="
            w-full

            pl-10
            pr-4

            py-2
            sm:py-2.5

            bg-[#120B1A]

            border
            border-purple-500/30

            rounded-2xl

            text-xs
            sm:text-sm

            text-white

            placeholder-gray-500

            focus:outline-none

            focus:ring-2
            focus:ring-purple-500/20

            focus:border-purple-500

            transition-all
          "
        />

      </form>

      {/* =====================================================
          RIGHT CONTROLS
          ===================================================== */}

      <div
        className="
          flex
          items-center
          gap-1.5
          sm:gap-3

          ml-auto
        "
      >

        {/* MOBILE SEARCH */}

        <button
          onClick={() =>
            setShowMobileSearch(!showMobileSearch)
          }
          className="
            md:hidden

            p-2

            rounded-xl

            text-gray-400

            hover:text-purple-300
            hover:bg-purple-500/10

            transition-colors
          "
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* ALEVATE AI */}

        <NavLink
          to="/ai-companion"
          className="
            flex
            items-center
            gap-1.5

            px-3
            py-1.5

            sm:px-3.5
            sm:py-2

            bg-gradient-to-r
            from-purple-600
            via-purple-500
            to-fuchsia-500

            hover:from-purple-700
            hover:to-fuchsia-600

            text-white

            rounded-xl
            sm:rounded-2xl

            text-[11px]
            sm:text-xs

            font-bold

            shadow-lg
            shadow-purple-500/20

            transition-all

            shrink-0
          "
        >
          <Sparkles className="w-3.5 h-3.5" />

          <span className="hidden sm:inline">
            Alevate AI
          </span>
        </NavLink>

        {/* =================================================
            NOTIFICATIONS
            ================================================= */}

        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            className="
              w-8
              h-8

              sm:w-10
              sm:h-10

              rounded-xl
              sm:rounded-2xl

              bg-[#0D0D0D]

              border
              border-purple-500/30

              flex
              items-center
              justify-center

              text-gray-400

              hover:bg-purple-500/10
              hover:text-purple-300

              transition-colors

              relative
            "
            title="Notifications"
          >

            <Bell
              className="
                w-3.5
                h-3.5

                sm:w-4
                sm:h-4
              "
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -right-1

                  w-4
                  h-4

                  sm:w-5
                  sm:h-5

                  bg-purple-500

                  text-white

                  text-[9px]
                  sm:text-[11px]

                  font-bold

                  rounded-full

                  flex
                  items-center
                  justify-center

                  ring-2
                  ring-[#080808]
                "
              >
                {unreadCount}
              </span>
            )}

          </button>

          {/* NOTIFICATION DROPDOWN */}

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                mt-3

                w-72
                sm:w-80
                md:w-96

                bg-[#0D0D0D]

                border
                border-purple-500/30

                rounded-2xl

                shadow-2xl
                shadow-purple-900/20

                p-4

                z-50
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between

                  pb-3

                  border-b
                  border-purple-500/20
                "
              >

                <div className="flex items-center gap-2">

                  <h3
                    className="
                      font-bold
                      text-white
                      text-xs
                      sm:text-sm
                    "
                  >
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <span
                      className="
                        bg-purple-500/10
                        text-purple-300

                        text-[10px]
                        sm:text-xs

                        px-2
                        py-0.5

                        rounded-full

                        font-semibold
                      "
                    >
                      {unreadCount} new
                    </span>
                  )}

                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="
                      text-[11px]
                      sm:text-xs

                      text-purple-400

                      hover:text-purple-300

                      font-medium
                    "
                  >
                    Mark all read
                  </button>
                )}

              </div>

              <div
                className="
                  max-h-72

                  overflow-y-auto

                  divide-y
                  divide-purple-500/10

                  py-1
                "
              >

                {notifications.length === 0 ? (

                  <div
                    className="
                      py-8

                      text-center

                      text-gray-500

                      text-xs
                    "
                  >
                    No new notifications right now
                  </div>

                ) : (

                  notifications.map((n) => (

                    <div
                      key={n._id || n.id}
                      onClick={() => {
                        setShowNotifications(false);

                        if (n.link) {
                          navigate(n.link);
                        }
                      }}
                      className={`
                        py-2.5
                        sm:py-3

                        px-2

                        rounded-xl

                        cursor-pointer

                        hover:bg-purple-500/10

                        transition-colors

                        ${
                          !n.read
                            ? 'bg-purple-500/5'
                            : ''
                        }
                      `}
                    >

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-white
                        "
                      >
                        {n.title}
                      </p>

                      <p
                        className="
                          text-[11px]
                          sm:text-xs

                          text-gray-400

                          mt-0.5

                          line-clamp-2
                        "
                      >
                        {n.message}
                      </p>

                      <span
                        className="
                          text-[10px]

                          text-gray-600

                          mt-1

                          block
                        "
                      >
                        Just now
                      </span>

                    </div>

                  ))

                )}

              </div>

              <div
                className="
                  pt-2

                  border-t
                  border-purple-500/20

                  text-center
                "
              >

                <NavLink
                  to="/notifications"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="
                    text-xs
                    font-semibold

                    text-purple-400

                    hover:text-purple-300
                  "
                >
                  View All Notifications →
                </NavLink>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            USER PROFILE
            ================================================= */}

        <div className="relative">

          <button
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
            className="
              flex
              items-center

              gap-1.5
              sm:gap-2

              p-1

              rounded-xl
              sm:rounded-2xl

              hover:bg-purple-500/10

              border
              border-transparent

              hover:border-purple-500/30

              transition-all
            "
          >

            <Avatar
              name={
                user?.name || 'Alex Rivera'
              }
              size="sm"
              rounded="rounded-xl"
            />

            <div
              className="
                text-left
                hidden
                md:block
              "
            >

              <p
                className="
                  text-xs
                  font-bold

                  text-white

                  leading-tight
                "
              >
                {user?.name || 'Alex Rivera'}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1

                  mt-0.5
                "
              >

                <span
                  className={`
                    text-[10px]

                    font-semibold

                    px-1.5
                    py-0.5

                    rounded-md

                    border

                    uppercase
                    tracking-wide

                    ${
                      roleBadgeColors[
                        user?.role || 'student'
                      ]
                    }
                  `}
                >
                  {user?.role || 'student'}
                </span>

              </div>

            </div>

            <ChevronDown
              className="
                w-3.5
                h-3.5

                text-gray-500

                hidden
                sm:block
              "
            />

          </button>

          {/* PROFILE DROPDOWN */}

          {showProfileMenu && (
            <div
              className="
                absolute
                right-0
                mt-3

                w-64

                bg-[#0D0D0D]

                border
                border-purple-500/30

                rounded-2xl

                shadow-2xl

                p-2.5

                z-50
              "
            >

              <div
                className="
                  px-3
                  py-2

                  border-b
                  border-purple-500/20

                  mb-2
                "
              >

                <p
                  className="
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {user?.name}
                </p>

                <p
                  className="
                    text-[11px]
                    text-gray-500

                    truncate
                  "
                >
                  {user?.email}
                </p>

                <span
                  className={`
                    inline-block

                    text-[10px]

                    font-bold

                    px-2
                    py-0.5

                    rounded

                    uppercase

                    border

                    mt-1

                    ${
                      roleBadgeColors[
                        user?.role || 'student'
                      ]
                    }
                  `}
                >
                  {user?.role || 'student'}
                </span>

              </div>

              <NavLink
                to="/profile"
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="
                  flex
                  items-center
                  gap-2.5

                  px-3
                  py-2

                  text-xs
                  font-medium

                  text-gray-300

                  hover:bg-purple-500/10

                  rounded-xl
                "
              >
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span>My Profile & Skills</span>
              </NavLink>

              <NavLink
                to="/sessions"
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="
                  flex
                  items-center
                  gap-2.5

                  px-3
                  py-2

                  text-xs
                  font-medium

                  text-gray-300

                  hover:bg-purple-500/10

                  rounded-xl
                "
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>My Sessions</span>
              </NavLink>

              <NavLink
                to="/referrals"
                onClick={() =>
                  setShowProfileMenu(false)
                }
                className="
                  flex
                  items-center
                  gap-2.5

                  px-3
                  py-2

                  text-xs
                  font-medium

                  text-gray-300

                  hover:bg-purple-500/10

                  rounded-xl
                "
              >
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span>My Referrals</span>
              </NavLink>

              <div
                className="
                  border-t
                  border-purple-500/20
                  my-1
                "
              />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="
                  w-full

                  flex
                  items-center
                  gap-2.5

                  px-3
                  py-2

                  text-xs
                  font-medium

                  text-purple-300

                  hover:bg-purple-500/10

                  rounded-xl
                "
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          MOBILE SEARCH
          ===================================================== */}

      {showMobileSearch && (
        <div
          className="
            absolute
            top-16
            left-0
            right-0

            bg-[#080808]

            border-b
            border-purple-500/30

            p-3

            shadow-xl

            md:hidden

            z-30
          "
        >

          <form
            onSubmit={handleSearchSubmit}
            className="
              relative
              flex
              items-center
              gap-2
            "
          >

            <div className="relative flex-1">

              <Search
                className="
                  w-4
                  h-4

                  text-gray-500

                  absolute
                  left-3
                  top-1/2

                  -translate-y-1/2
                "
              />

              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search mentors by company, skills..."
                className="
                  w-full

                  pl-9
                  pr-3

                  py-2

                  bg-[#120B1A]

                  border
                  border-purple-500/30

                  rounded-xl

                  text-xs

                  text-white

                  placeholder-gray-500

                  focus:outline-none

                  focus:ring-2
                  focus:ring-purple-500
                "
              />

            </div>

            <button
              type="submit"
              className="
                px-3.5
                py-2

                bg-purple-600

                text-white

                font-bold
                text-xs

                rounded-xl
              "
            >
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                setShowMobileSearch(false)
              }
              className="
                p-2

                text-gray-500

                hover:text-purple-300
              "
            >
              <X className="w-4 h-4" />
            </button>

          </form>

        </div>
      )}

    </header>
  );
}