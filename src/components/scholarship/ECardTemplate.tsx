import React from "react";
import { Award } from "lucide-react";

interface ECardTemplateProps {
  scholarName: string;
  photoUrl: string | null;
  programTitle: string;
  cohortYear?: string;
}

/**
 * E-Card Template Component
 * This component renders the visual template for the scholarship acceptance e-card.
 * It's designed to be captured by html2canvas for PNG download.
 */
export const ECardTemplate = React.forwardRef<HTMLDivElement, ECardTemplateProps>(
  ({ scholarName, photoUrl, programTitle, cohortYear = "2026" }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[600px] h-[800px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
            }}
          />
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full py-12 px-8">
          {/* Top section - Logo/Brand */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-purple-300 text-lg font-medium tracking-widest uppercase">
              Web3 Scholarship
            </h2>
          </div>

          {/* Middle section - Photo and Name */}
          <div className="flex flex-col items-center">
            {/* Congratulations text */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎓</div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                CONGRATULATIONS!
              </h1>
              <p className="text-purple-300 text-sm mt-3">
                You've been accepted into
              </p>
            </div>

            {/* Photo frame */}
            <div className="relative my-6">
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 rounded-full blur-sm opacity-75" />
              <div className="relative w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden bg-slate-800">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={scholarName}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Scholar name */}
            <div className="text-center mt-6">
              <h2 className="text-2xl font-bold text-white">
                {scholarName || "Scholar Name"}
              </h2>
              <p className="text-purple-300 text-base mt-4">
                has been officially accepted into the
              </p>
              <p className="text-white font-semibold text-lg mt-2">
                {programTitle || "Scholarship Program"}
              </p>
            </div>
          </div>

          {/* Bottom section - Cohort badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-purple-400" />
              <span className="text-white font-bold tracking-wider">
                COHORT {cohortYear}
              </span>
              <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-purple-400" />
            </div>
            <p className="text-slate-400 text-xs mt-4">
              #Web3Scholarship #BuildingTheFuture
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full" />
      </div>
    );
  }
);

ECardTemplate.displayName = "ECardTemplate";
