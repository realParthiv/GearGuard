import React from "react";
import { Settings } from "lucide-react";
import clsx from "clsx";

const Loader = ({
  size = "lg",
  fullScreen = false,
  text = "Loading...",
  className,
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const Spinner = () => (
    <div
      className={clsx("relative flex items-center justify-center", className)}
    >
      {/* Glowing effect */}
      <div
        className={clsx(
          "absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse",
          size === "sm" ? "hidden" : "block"
        )}
      />

      <Settings
        className={clsx(
          "animate-spin text-blue-500 relative z-10",
          sizeClasses[size]
        )}
        style={{ animationDuration: "3s" }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Spinner />
        {text && (
          <p className="text-slate-500 font-medium animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center p-8 gap-3 w-full min-h-[80vh]",
        className
      )}
    >
      <Spinner />
      {text && size !== "sm" && (
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
