export default function HeroAstronaut() {
  return (
    <div className="hero-astronaut" aria-hidden="true">
      <svg viewBox="0 0 400 480" role="presentation" focusable="false">
        <defs>
          <radialGradient id="astronautHalo">
            <stop offset="0" stopColor="#51caff" stopOpacity=".2" />
            <stop offset=".68" stopColor="#527fff" stopOpacity=".06" />
            <stop offset="1" stopColor="#527fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="suit" x1=".1" y1="0" x2=".9" y2="1">
            <stop stopColor="#f3f8ff" />
            <stop offset=".45" stopColor="#bac9dc" />
            <stop offset="1" stopColor="#687c97" />
          </linearGradient>
          <linearGradient id="visor" x1=".15" y1="0" x2=".85" y2="1">
            <stop stopColor="#85f0ff" />
            <stop offset=".28" stopColor="#277eb6" />
            <stop offset=".72" stopColor="#102b51" />
            <stop offset="1" stopColor="#081426" />
          </linearGradient>
          <linearGradient id="visorGlint" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d9fbff" stopOpacity=".85" />
            <stop offset="1" stopColor="#8ceaff" stopOpacity="0" />
          </linearGradient>
          <filter id="astronautGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
        </defs>

        <circle cx="205" cy="241" r="183" fill="url(#astronautHalo)" />
        <circle className="astronaut-orbit" cx="205" cy="241" r="164" fill="none" stroke="#77ceff" strokeOpacity=".22" strokeWidth="1.2" strokeDasharray="2 10" />
        <circle cx="67" cy="139" r="3" fill="#dff8ff" />
        <circle cx="331" cy="322" r="2.3" fill="#ffd5a1" />

        <g className="astronaut-suit" strokeLinecap="round" strokeLinejoin="round">
          {/* soft backlight */}
          <ellipse cx="210" cy="248" rx="96" ry="132" fill="#57c8ff" opacity=".12" filter="url(#astronautGlow)" />
          {/* backpack and rear life-support pack */}
          <path d="M251 177 295 188 310 268 286 306 248 292Z" fill="#344961" stroke="#9db7d2" strokeWidth="4" />
          <path d="m270 191 20 7 9 53-22-5Z" fill="#91a7bd" stroke="#d4e4f5" strokeWidth="2" />
          <path d="m277 261 24 7-15 25-20-7Z" fill="#182b43" stroke="#718ba8" strokeWidth="2" />
          <rect x="288" y="210" width="7" height="23" rx="3.5" fill="#ff8a5b" />

          {/* legs and magnetic boots */}
          <path d="m178 311-7 68-40 43 26 20 58-49 15-74Z" fill="url(#suit)" stroke="#d7e4f3" strokeWidth="4" />
          <path d="m221 316 25 58 31 37-22 24-52-37-25-72Z" fill="url(#suit)" stroke="#d7e4f3" strokeWidth="4" />
          <path d="m133 414 30 12-18 25-25-13Z" fill="#425a75" stroke="#aec3da" strokeWidth="3" />
          <path d="m257 405 28-8 14 23-26 17-24-13Z" fill="#425a75" stroke="#aec3da" strokeWidth="3" />
          <path d="m149 418 10 5m110-11 11-3" stroke="#56d9ff" strokeWidth="3" />

          {/* arm reaching outward */}
          <path d="m155 215-40 26-26 61 28 16 44-48 30-21Z" fill="url(#suit)" stroke="#d7e4f3" strokeWidth="5" />
          <path d="m90 292-15 18 10 19 25-10 8-19Z" fill="#dce8f5" stroke="#a9bbcf" strokeWidth="3" />
          <path d="m103 300-12 18m21-21-12 21" stroke="#7490ad" strokeWidth="2" />
          {/* opposite arm */}
          <path d="m248 211 36 31 27 48-26 20-41-41-25-23Z" fill="url(#suit)" stroke="#d7e4f3" strokeWidth="5" />
          <path d="m296 282 21 8 8 20-20 12-20-14Z" fill="#dce8f5" stroke="#a9bbcf" strokeWidth="3" />
          <path d="m299 291 18 12m-23-4 17 11" stroke="#7490ad" strokeWidth="2" />

          {/* torso, harness and mission console */}
          <path d="M160 190q42-25 89 2l28 105q-18 35-67 40-45-3-68-36Z" fill="url(#suit)" stroke="#e6f1fc" strokeWidth="5" />
          <path d="m157 210 91 93m-9-105-72 111" stroke="#697f99" strokeWidth="5" opacity=".9" />
          <path d="M179 254q27-15 53 2l-5 36q-25 10-48-4Z" fill="#112843" stroke="#91dfff" strokeWidth="3" />
          <path d="m188 263 27-3m-26 12 21-2" stroke="#41dfff" strokeWidth="3" />
          <circle cx="223" cy="280" r="4" fill="#ff956c" />
          <rect x="149" y="222" width="15" height="35" rx="6" fill="#7389a3" stroke="#d6e7f7" strokeWidth="2" />
          <rect x="249" y="227" width="14" height="32" rx="6" fill="#7389a3" stroke="#d6e7f7" strokeWidth="2" />

          {/* helmet */}
          <path d="M156 178c0-48 28-81 70-81s69 33 69 81l-12 36q-57 27-116-1Z" fill="#d6e3f0" stroke="#f4f9ff" strokeWidth="6" />
          <path d="M170 166c0-35 21-58 56-58s55 23 55 58l-8 27q-47 20-96 0Z" fill="url(#visor)" stroke="#7099bc" strokeWidth="3" />
          <path d="M185 132q20-23 49-18" fill="none" stroke="url(#visorGlint)" strokeWidth="8" opacity=".85" />
          <path d="M179 150q-4 20 1 29" fill="none" stroke="#d7f8ff" strokeWidth="3" opacity=".55" />
          <path d="M157 180q68 28 137 0" fill="none" stroke="#91a6bc" strokeWidth="5" />
          <path d="M185 198v11m81-11v11" stroke="#ff895a" strokeWidth="5" />
        </g>

        <g className="astronaut-hud" fill="none" stroke="#72d8ff" strokeWidth="1.2">
          <path d="M291 114h34v27m-219 208v20h31" opacity=".65" />
          <circle cx="325" cy="141" r="3" fill="#72d8ff" />
          <circle cx="137" cy="368" r="2.5" fill="#72d8ff" />
        </g>
        <g className="astronaut-label" fill="#a9c5df" fontFamily="monospace" fontSize="8" letterSpacing="1.5">
          <text x="296" y="105">ORBITAL CREW</text>
          <text x="167" y="454">MISSION 01 · EARTH ORBIT</text>
        </g>
      </svg>
    </div>
  )
}
