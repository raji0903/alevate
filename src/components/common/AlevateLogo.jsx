import React, { useId } from 'react';

export default function AlevateLogo({
  size = 'md',
  showText = true,
  subtitle = 'Mentorship & Careers',
  className = ''
}) {
  const uniqueId = useId();

  const bridgeGradientId = `alev-purple-bridge-${uniqueId}`;
  const aGradientId = `alev-purple-a-${uniqueId}`;

  const sizeMap = {
    xs: {
      box: 'w-7 h-7',
      text: 'text-base',
      sub: 'text-[8px]'
    },

    sm: {
      box: 'w-8 h-8',
      text: 'text-lg',
      sub: 'text-[9px]'
    },

    md: {
      box: 'w-10 h-10',
      text: 'text-xl',
      sub: 'text-[10px]'
    },

    lg: {
      box: 'w-12 h-12',
      text: 'text-2xl',
      sub: 'text-xs'
    },

    xl: {
      box: 'w-14 h-14',
      text: 'text-3xl',
      sub: 'text-xs'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-3
        select-none
        group
        ${className}
      `}
    >

      {/* =====================================================
          ALEVATE PURPLE LOGO CONTAINER
          ===================================================== */}

      <div
        className={`
          ${currentSize.box}

          rounded-2xl

          p-[1.5px]

          shrink-0

          relative

          flex
          items-center
          justify-center

          bg-gradient-to-br
          from-[#7E22CE]
          via-[#A855F7]
          to-[#C084FC]

          shadow-lg
          shadow-purple-500/20

          group-hover:scale-105

          transition-transform
          duration-200
        `}
      >

        {/* =================================================
            INNER DARK PURPLE BOX
            ================================================= */}

        <div
          className="
            w-full
            h-full

            rounded-[14px]

            bg-gradient-to-br
            from-[#0D0615]
            via-[#1A0B2E]
            to-[#3B0764]

            flex
            items-center
            justify-center

            relative
            overflow-hidden
          "
        >

          {/* =================================================
              PURPLE GLOW - TOP RIGHT
              ================================================= */}

          <div
            className="
              absolute

              -top-3
              -right-3

              w-8
              h-8

              rounded-full

              bg-[#A855F7]/20

              blur-md

              pointer-events-none
            "
          />

          {/* =================================================
              PURPLE GLOW - BOTTOM LEFT
              ================================================= */}

          <div
            className="
              absolute

              -bottom-3
              -left-3

              w-8
              h-8

              rounded-full

              bg-[#C084FC]/10

              blur-md

              pointer-events-none
            "
          />

          {/* =================================================
              SUBTLE INNER SHINE
              ================================================= */}

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-b
              from-white/[0.08]
              via-transparent
              to-transparent

              pointer-events-none
            "
          />

          {/* =================================================
              ALEVATE SVG MARK
              ================================================= */}

          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="
              w-[78%]
              h-[78%]

              relative
              z-10
            "
          >

            <defs>

              {/* =================================================
                  PURPLE BRIDGE GRADIENT
                  ================================================= */}

              <linearGradient
                id={bridgeGradientId}
                x1="5"
                y1="25"
                x2="31"
                y2="8"
                gradientUnits="userSpaceOnUse"
              >

                <stop
                  offset="0%"
                  stopColor="#9333EA"
                />

                <stop
                  offset="55%"
                  stopColor="#C084FC"
                />

                <stop
                  offset="100%"
                  stopColor="#F5D0FE"
                />

              </linearGradient>


              {/* =================================================
                  A LETTER GRADIENT
                  ================================================= */}

              <linearGradient
                id={aGradientId}
                x1="10"
                y1="30"
                x2="28"
                y2="5"
                gradientUnits="userSpaceOnUse"
              >

                <stop
                  offset="0%"
                  stopColor="#A855F7"
                />

                <stop
                  offset="50%"
                  stopColor="#E9D5FF"
                />

                <stop
                  offset="100%"
                  stopColor="#FFFFFF"
                />

              </linearGradient>

            </defs>


            {/* =================================================
                MAIN A
                ================================================= */}

            <path
              d="
                M7 29
                L15.4 6.8
                C16.1 5
                17.5 4
                19.3 4.4
                C20.4 4.7
                21.2 5.6
                21.7 6.6
                L29 29
                H23.8
                L21.9 22.8
                H14.1
                L12.2 29
                H7Z
              "
              fill={`url(#${aGradientId})`}
            />


            {/* =================================================
                INNER A CUTOUT
                ================================================= */}

            <path
              d="
                M18 10.8
                L15.6 18.2
                H20.4
                L18 10.8Z
              "
              fill="#1A0B2E"
            />


            {/* =================================================
                UPWARD MENTORSHIP BRIDGE
                ================================================= */}

            <path
              d="
                M5 23.5
                C9.2 23.5
                13.8 20.8
                18.5 17.2
                C23.2 13.6
                27.5 10.2
                31 9.2
                C29.2 11.8
                25.5 15.5
                21.2 19
                C16.8 22.5
                11.5 25
                5 23.5Z
              "
              fill={`url(#${bridgeGradientId})`}
            />


            {/* =================================================
                PURPLE MENTORSHIP SPARK
                ================================================= */}

            <path
              d="
                M29.5 4
                C29.5 6.2
                30.8 7.5
                33 7.5

                C30.8 7.5
                29.5 8.8
                29.5 11

                C29.5 8.8
                28.2 7.5
                26 7.5

                C28.2 7.5
                29.5 6.2
                29.5 4Z
              "
              fill="#E9D5FF"
            />

          </svg>

        </div>

      </div>


      {/* =====================================================
          ALEVATE BRAND TEXT
          ===================================================== */}

      {showText && (
        <div className="flex flex-col min-w-0">

          {/* =================================================
              BRAND NAME
              ================================================= */}

          <div
            className="
              flex
              items-center
              gap-1.5
              leading-none
            "
          >

            <span
              className={`
                font-black

                text-white

                tracking-tight

                ${currentSize.text}
              `}
            >
              ALEVATE
            </span>


            {/* =================================================
                PURPLE BRAND DOT
                ================================================= */}

            <span
              className="
                w-1.5
                h-1.5

                rounded-full

                bg-[#A855F7]

                animate-pulse

                inline-block
              "
            />

          </div>


          {/* =================================================
              SUBTITLE
              ================================================= */}

          {subtitle && (
            <span
              className={`
                font-bold

                text-[#C084FC]

                uppercase

                tracking-widest

                mt-1

                ${currentSize.sub}
              `}
            >
              {subtitle}
            </span>
          )}

        </div>
      )}

    </div>
  );
}