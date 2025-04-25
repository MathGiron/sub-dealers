"use client";

import React from "react";

interface CrossSquareIconProps {
  className?: string;
}

const CrossSquareIcon: React.FC<CrossSquareIconProps> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M9 9L15 15M15 9L9 15M4 4H20V20H4V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CrossSquareIcon;