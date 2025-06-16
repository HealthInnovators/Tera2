import type React from 'react';

const TeraAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="17" cy="17" r="17" fill="hsl(var(--primary))" />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="Poppins, sans-serif"
      fontSize="12"
      fontWeight="500"
      fill="hsl(var(--primary-foreground))"
    >
      TeRA
    </text>
  </svg>
);

export default TeraAvatar;
