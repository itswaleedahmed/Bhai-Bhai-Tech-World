import React, { useRef, useState, useCallback } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  isFlagship?: boolean;
  onClick?: () => void;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  isFlagship = false,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D perspective: max +/- 6 degrees
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    // Calculate sheen position percentage
    const sheenX = Math.round((x / rect.width) * 100);
    const sheenY = Math.round((y / rect.height) * 100);

    setRotation({ x: rotateX, y: rotateY });
    setSheenPos({ x: sheenX, y: sheenY });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setSheenPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className="relative select-none group"
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(-4px)`
            : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
          transition: isHovered
            ? 'transform 0.1s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className={`${className} relative overflow-hidden`}
      >
        {/* Flagship Metallic / Titanium Sheen Highlight */}
        {isHovered && isFlagship && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-xl mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 280px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(37, 211, 102, 0.15) 35%, transparent 70%)`,
            }}
          />
        )}

        {/* Regular sheen for non-flagship if hovered */}
        {isHovered && !isFlagship && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-xl mix-blend-screen"
            style={{
              background: `radial-gradient(circle 200px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Halo border glow for flagship cards */}
        {isFlagship && (
          <div className="absolute inset-0 rounded-xl border border-amber-400/30 pointer-events-none group-hover:border-[#25D366] transition-colors duration-300 shadow-[inset_0_0_15px_rgba(37,211,102,0.1)]" />
        )}

        {children}
      </div>
    </div>
  );
};
