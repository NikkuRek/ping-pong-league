import React from "react";

export const AppLogo: React.FC<{ size?: string }> = ({ size = "w-16 h-16" }) => (
  <div
    className={`flex-shrink-0 ${size} bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20 relative overflow-hidden`}
  >
    {/* Contenedor de la raqueta */}
    <div className="relative w-1/2 h-1/2 flex items-end">
  <img
      src="/favicon.png "
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-full"
    />
    </div>
  </div>
);
