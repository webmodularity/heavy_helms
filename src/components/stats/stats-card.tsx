"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  valueClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  valueClassName,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-stone-900/80 border border-stone-800/60 rounded-lg p-4 shadow-lg flex flex-col hover:border-yellow-500/30 transition-all",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-stone-400">{title}</h3>
        {icon && <div className="text-yellow-500">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline">
        <span
          className={cn(
            "text-2xl font-semibold text-yellow-500",
            valueClassName,
          )}
        >
          {value}
        </span>
      </div>

      {description && (
        <p className="mt-2 text-xs text-stone-500">{description}</p>
      )}

      {trend && (
        <div className="mt-2">
          {trend === "up" && (
            <span className="inline-flex items-center text-xs text-green-500">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Increasing
            </span>
          )}
          {trend === "down" && (
            <span className="inline-flex items-center text-xs text-red-500">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Decreasing
            </span>
          )}
          {trend === "neutral" && (
            <span className="inline-flex items-center text-xs text-blue-500">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14"
                />
              </svg>
              Stable
            </span>
          )}
        </div>
      )}
    </div>
  );
}
