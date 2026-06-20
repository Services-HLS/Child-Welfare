import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GovernmentPageFrame({
  children,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return <div className={cn("gov-page-body")}>{children}</div>;
}
