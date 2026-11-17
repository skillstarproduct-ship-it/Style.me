'use client';

import React, { useState, useRef, useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

export type SpecularButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'custom';

const SIZES: Record<SpecularButtonSize, string> = {
  sm: 'px-5 py-2.5 text-[0.875rem]',
  md: 'px-7 py-3.5 text-[1rem]',
  lg: 'px-[38px] py-[18px] text-[1.125rem]',
  xl: 'px-10 py-5 text-[1.25rem]',
  icon: 'w-24 h-24 sm:w-28 sm:h-28 p-0',
  custom: ''
};

const BUTTON_BASE =
  'relative isolate m-0 inline-flex cursor-pointer items-center justify-center gap-[0.5em] border-0 font-medium leading-none tracking-[0.01em] outline-none select-none transition-transform duration-200 ease-out active:scale-[0.97] disabled:cursor-default disabled:opacity-50 disabled:active:scale-100';

export interface SpecularButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  children?: ReactNode;
  size?: SpecularButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0.04,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.8,
  glow = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = true,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  style,
  ...rest
}: SpecularButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mouseAngle, setMouseAngle] = useState<number | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Mouse tracking for followMouse proximity
  useEffect(() => {
    if (!followMouse || disabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance <= proximity) {
        setIsNear(true);
        // Calculate angle in degrees from top (0 deg is top)
        const rad = Math.atan2(dy, dx);
        const deg = (rad * 180) / Math.PI + 90;
        setMouseAngle(deg < 0 ? deg + 360 : deg);
      } else {
        setIsNear(false);
        setMouseAngle(null);
      }
    };

    const handlePointerLeave = () => {
      setIsNear(false);
      setMouseAngle(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [followMouse, disabled, proximity]);

  // Duration for spinning animation based on speed prop
  const animDuration = Math.max(1, 4 / (speed || 0.35));
  const effectiveIntensity = isNear ? intensity : autoAnimate ? intensity * 0.9 : idleIntensity;
  const borderThickness = Math.max(1, thickness);

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      className={`${BUTTON_BASE} ${SIZES[size] ?? SIZES.lg}${className ? ` ${className}` : ''}`}
      style={
        {
          borderRadius: `${radius}px`,
          color: textColor,
          boxShadow: `0 10px 24px -14px rgba(0,0,0,0.45)`,
          ...style
        } as CSSProperties
      }
      {...rest}
    >
      {/* Moving Specular Border Beam Layer (Pure CSS / Conic-Gradient - NO CANVAS) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          borderRadius: `${radius}px`,
          padding: `${borderThickness}px`
        }}
      >
        {/* Specular light streak rotating or tracking pointer */}
        <span
          className="absolute -inset-[150%] transition-opacity duration-300"
          style={{
            opacity: disabled ? 0.2 : effectiveIntensity,
            transform: mouseAngle !== null ? `rotate(${mouseAngle}deg)` : undefined,
            animation: mouseAngle === null && autoAnimate ? `specularSpin ${animDuration}s linear infinite` : 'none',
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 240deg, ${baseColor} 300deg, ${lineColor} 350deg, transparent 360deg)`
          }}
        />

        {/* Inner frosted glass backing inside the border */}
        <span
          className="absolute inset-[1px] transition-all duration-200"
          style={{
            borderRadius: `${Math.max(0, radius - borderThickness)}px`,
            background: `color-mix(in srgb, ${tint} calc(${tintOpacity} * 100%), transparent)`,
            backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
            WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
            boxShadow: isPressed
              ? `inset 0 0 15px rgba(255,255,255,0.15)`
              : undefined
          }}
        />
      </span>

      {/* Button Content */}
      <span className="relative z-10 inline-flex items-center justify-center w-full h-full gap-[inherit]">
        {children}
      </span>
    </button>
  );
};

export default SpecularButton;
