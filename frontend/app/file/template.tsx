"use client";

import type { ReactNode } from "react";

export default function FileTemplate({ children }: { children: ReactNode }) {
  return <div className="filing-route-enter min-h-full">{children}</div>;
}
