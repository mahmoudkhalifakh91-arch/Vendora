/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string; // class for the container
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  showSubtitle?: boolean;
  textClassName?: string;
  themeType?: 'light' | 'dark' | 'auto';
}

/**
 * High-fidelity representation of the official Vendora logo
 * Designed with beautiful SVGs, gradients, and 3D layered orbitals
 */
export const VendoraIcon: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 260 220" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`inline-block select-none ${className}`}
    >
      <defs>
        {/* Shopping bag front face gradient */}
        <linearGradient id="bagFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAA00" />
          <stop offset="60%" stopColor="#FF7300" />
          <stop offset="100%" stopColor="#E64A00" />
        </linearGradient>

        {/* Shopping bag side/under shadow gradient */}
        <linearGradient id="bagSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D95000" />
          <stop offset="100%" stopColor="#992C00" />
        </linearGradient>

        {/* Shopping bag handles */}
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FFE1A8" />
          <stop offset="100%" stopColor="#FF9900" />
        </linearGradient>

        {/* Orbit loop gradient */}
        <linearGradient id="orbitSwoosh" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#0066CC" />
          <stop offset="25%" stopColor="#00A2C7" />
          <stop offset="65%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#A3E635" />
        </linearGradient>

        {/* Spheres radial highlights for 3D depth */}
        <radialGradient id="greenSphere" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="40%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>

        <radialGradient id="blueSphere" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>

        <radialGradient id="orangeSphere" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="45%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>

        {/* Drop shadow for 3D realism */}
        <filter id="shadowDepth" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
        </filter>
        <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Ground subtle glow shadow below the bag */}
      <ellipse cx="130" cy="190" rx="55" ry="8" fill="#000000" fillOpacity="0.12" />

      {/* 2. BACK PART OF THE ORBITAL SWOOSH (drawn behind the bag) */}
      <path 
        d="M 50 148 C 30 115, 110 90, 195 98 C 215 100, 225 108, 195 110 C 130 114, 55 130, 48 142 " 
        fill="none" 
        stroke="url(#orbitSwoosh)" 
        strokeWidth="11" 
        strokeLinecap="round" 
        opacity="0.95"
      />

      {/* 4-pointed Sparkle: Upper Left Behind */}
      <path d="M 103 89 Q 106 89 106 86 Q 106 89 109 89 Q 106 89 106 92 Q 106 89 103 89 Z" fill="#38BDF8" />
      
      {/* 3. THE MAIN SHOPPING BAG (Tilted and layered) */}
      <g filter="url(#shadowDepth)">
        {/* Rotation Group for beautiful tilted 3D pose */}
        <g transform="rotate(-6, 130, 130)">
          {/* Bag Handles */}
          <path 
            d="M 116 100 C 114 62, 146 62, 144 100" 
            fill="none" 
            stroke="url(#handleGrad)" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />
          <path 
            d="M 120 100 C 118.5 68, 140.5 68, 139 100" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            opacity="0.8"
            strokeLinecap="round" 
          />

          {/* Bag Side fold / Depth panel */}
          <path 
            d="M 104 100 L 110 100 L 115 174 C 115 178, 111 181, 107 181 L 102 181 C 98 181, 95 178, 95 174 L 104 100 Z" 
            fill="url(#bagSideGrad)" 
          />

          {/* Bag Main Front Face */}
          <path 
            d="M 110 100 L 157 97 C 163 97, 166 102, 165 109 L 158 174 C 157 179, 152 182, 146 182 L 112 182 C 107 182, 103 178, 104 172 L 110 100 Z" 
            fill="url(#bagFrontGrad)" 
          />

          {/* Bag Front Lip Gloss highlight */}
          <path 
            d="M 111 103 L 156 100" 
            stroke="#FFFFE0" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            opacity="0.75" 
          />
          
          {/* Subtle logo shine reflex */}
          <path 
            d="M 152 108 L 145 170" 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.15" 
          />
        </g>
      </g>

      {/* 4. FRONT PART OF THE ORBITAL SWOOSH (curves gracefully over the bag) */}
      <path 
        d="M 194 99 C 220 102, 235 116, 195 142 C 145 175, 54 180, 46 148" 
        fill="none" 
        stroke="url(#orbitSwoosh)" 
        strokeWidth="13" 
        strokeLinecap="round" 
      />

      {/* Gloss reflection line along the orbit for 3D metallic feel */}
      <path 
        d="M 185 103 C 210 106, 222 118, 190 140 C 145 171, 62 173, 53 148" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.4"
      />

      {/* 5. 3D GLOWING SPHERES */}
      {/* Green Sphere on Left Orbit */}
      <g filter="url(#shadowDepth)">
        <circle cx="60" cy="144" r="11" fill="url(#greenSphere)" />
        <circle cx="57" cy="140" r="3.5" fill="#FFFFFF" fillOpacity="0.55" />
      </g>

      {/* Blue Sphere on Right Orbit Inner */}
      <g filter="url(#shadowDepth)">
        <circle cx="199" cy="104" r="11" fill="url(#blueSphere)" />
        <circle cx="195" cy="100" r="3.5" fill="#FFFFFF" fillOpacity="0.6" />
      </g>

      {/* Orange/Yellow Sphere on Right Orbit Outer */}
      <g filter="url(#shadowDepth)">
        <circle cx="180" cy="102" r="7.5" fill="url(#orangeSphere)" />
        <circle cx="178" cy="99" r="2.2" fill="#FFFFFF" fillOpacity="0.6" />
      </g>

      {/* 6. GLINTING/SPARKLING STAR COGNIZANCES */}
      {/* Sparkle 1: Top Center */}
      <path d="M 149 101 Q 153 101 153 97 Q 153 101 157 101 Q 153 101 153 105 Q 153 101 149 101 Z" fill="#FDE047" />
      {/* Sparkle 2: Lower Right */}
      <path d="M 205 158 Q 208 158 208 155 Q 208 158 211 158 Q 208 158 208 161 Q 208 158 205 158 Z" fill="#FDBA74" />
      {/* Sparkle 3: Left side */}
      <path d="M 98 128 Q 100 128 100 126 Q 100 128 102 128 Q 100 128 100 130 Q 100 128 98 128 Z" fill="#FDE047" opacity="0.8" />
    </svg>
  );
};

export const VendoraText: React.FC<{ 
  themeType?: 'light' | 'dark' | 'auto'; 
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ 
  themeType = 'auto',
  className = "",
  width = 180,
  height = 45
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 180 45" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <defs>
        {/* LIGHT MODE: Rich blue metallic gradient for VEN */}
        <linearGradient id="venTextGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E327A" />
        </linearGradient>

        {/* DARK MODE: Sky/ocean glow gradient for VEN to ensure high contrast against dark backgrounds */}
        <linearGradient id="venTextGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="45%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Shiny orange/gold gradient for DORA */}
        <linearGradient id="doraTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEE440" />
          <stop offset="45%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#9E2B00" />
        </linearGradient>

        <linearGradient id="subLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#E05300" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Font Rendering in SVG Paths for precise font-independent layout rendering */}
      {/* V - E - N (Dynamic dark mode class selectors for fill) */}
      <g>
        {/* V */}
        <path d="M 12 5 L 23.5 5 L 18.5 31 L 15.5 31 Z" fill="url(#venTextGradLight)" className="dark:fill-[url(#venTextGradDark)]" />
        <path d="M 23.5 5 L 35 5 L 20 38 L 14 38 Z" fill="url(#venTextGradLight)" className="dark:fill-[url(#venTextGradDark)]" />
        {/* E */}
        <path d="M 39 5 L 53 5 L 53 10 L 45 10 L 45 18 L 51 18 L 51 23 L 45 23 L 45 32 L 53.5 32 L 53.5 37 L 39 37 Z" fill="url(#venTextGradLight)" className="dark:fill-[url(#venTextGradDark)]" />
        {/* N */}
        <path d="M 58 5 L 64 5 L 75 26 L 75 5 L 80 5 L 80 37 L 74 37 L 63 15 L 63 37 L 58 37 Z" fill="url(#venTextGradLight)" className="dark:fill-[url(#venTextGradDark)]" fillRule="evenodd"/>
      </g>

      {/* D - O - R - A (Orange/Gold Metallic Gradient is highly visible in both light & dark) */}
      <g>
        {/* D */}
        <path d="M 87 5 L 98 5 C 104 5, 109.5 8, 111.5 13 C 113.5 18, 113.5 24, 111.5 29 C 109.5 34, 104 37, 98 37 L 87 37 Z M 93 10 L 93 32 L 97 32 C 101.5 32, 104.5 30, 105.8 26 C 107.1 22, 107.1 15, 105.8 11 C 104.5 7, 101.5 10, 97 10 Z" fill="url(#doraTextGrad)" fillRule="evenodd" />
        {/* O */}
        <path d="M 120 5 C 129 5, 137.5 7, 139.5 21 C 141.5 35, 129 37, 120 37 C 111 37, 102.5 35, 100.5 21 C 98.5 7, 111 5, 120 5 Z M 120 10 C 124.5 10, 127.5 11.5, 128.8 21 C 130.1 30.5, 124.5 32, 120 32 C 115.5 32, 112.5 30.5, 111.2 21 C 109.9 11.5, 115.5 10, 120 10 Z" fill="url(#doraTextGrad)" fillRule="evenodd" />
        {/* R */}
        <path d="M 144 5 L 155 5 C 160 5, 163 7, 164.5 11 C 166 15, 164.5 19, 161 21 L 166.5 37 L 160.5 37 L 155.5 22.5 L 150 22.5 L 150 37 L 144 37 Z M 150 10 L 150 17.5 L 154 17.5 C 157.5 17.5, 159 16.5, 159.5 13.8 C 160 11.1, 157.5 10, 154 10 Z" fill="url(#doraTextGrad)" fillRule="evenodd" />
        {/* A */}
        <path d="M 175 5 L 180 5 L 189 37 L 183 37 L 181 30 L 171 30 L 169.5 37 L 163.5 37 Z M 176 11 L 172.5 25 L 179.5 25 Z" fill="url(#doraTextGrad)" fillRule="evenodd" />
      </g>
    </svg>
  );
};

export const VendoraLogo: React.FC<LogoProps> = ({
  className = "",
  iconSize = 'md',
  showText = true,
  showSubtitle = true,
  textClassName = "",
  themeType = 'auto'
}) => {
  let size = 48;
  if (iconSize === 'sm') size = 36;
  else if (iconSize === 'md') size = 48;
  else if (iconSize === 'lg') size = 64;
  else if (iconSize === 'xl') size = 80;
  else if (typeof iconSize === 'number') size = iconSize;

  // Mathematically scale text container proportionally with the icon size
  const textH = Math.round(size * 0.7); 
  const textW = textH * 4; 
  const subW = Math.round(textW * 0.95);
  const subFS = Math.max(6.5, Math.round(textH * 0.22));

  return (
    <div className={`flex items-center gap-1.5 ${className}`} id="vendora-logo-main">
      <VendoraIcon size={size} />
      {showText && (
        <div className="flex flex-col justify-center leading-none" style={{ gap: '1px' }}>
          <VendoraText themeType={themeType} width={textW} height={textH} className={textClassName} />
          {showSubtitle && (
            <div 
              className="flex items-center justify-between gap-1 ml-1 px-0.5" 
              style={{ width: `${subW}px`, marginTop: '-2px' }}
            >
              <span className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-amber-500/80" />
              <span 
                className="font-sans font-black italic tracking-widest text-amber-500 uppercase leading-none select-none"
                style={{ fontSize: `${subFS}px` }}
              >
                The Everything Marketplace
              </span>
              <span className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-amber-500/80" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
