import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  // =========================================================
  // SIDEBAR STATES
  // =========================================================

  const [mobileOpen, setMobileOpen] = useState(false);

  // TRUE  = sidebar visible
  // FALSE = sidebar hidden
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="
        min-h-screen

        bg-[#050505]

        text-white

        flex
        flex-col
        md:flex-row

        transition-colors
      "
    >

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div
        className={`
          flex-1
          flex
          flex-col

          min-h-screen
          min-w-0

          transition-all
          duration-300

          ${
            sidebarOpen
              ? 'md:pl-64'
              : 'md:pl-0'
          }
        `}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <Header
          onOpenMobileMenu={() =>
            setMobileOpen(true)
          }
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <main
          className="
            flex-1

            p-4
            sm:p-6
            md:p-8

            pb-20
            md:pb-8

            max-w-7xl
            w-full

            mx-auto

            animate-in
            fade-in
            duration-200
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}
