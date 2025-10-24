import React from "react";

function Logo() {
  return (
    <div className="eventplanner-logo d-flex align-items-center justify-content-center mb-4">
      <span style={{ fontSize: 36, marginRight: 10 }}>
        {/* Calendar icon SVG */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="3" fill="#0d6efd"/>
          <rect x="7" y="2" width="2" height="4" rx="1" fill="#fff"/>
          <rect x="15" y="2" width="2" height="4" rx="1" fill="#fff"/>
          <rect x="3" y="9" width="18" height="2" fill="#fff"/>
        </svg>
      </span>
      <span style={{ fontWeight: 700, fontSize: 28, color: '#0d6efd', letterSpacing: 1 }}>
        EventPlanner
      </span>
    </div>
  );
}

export default Logo;
