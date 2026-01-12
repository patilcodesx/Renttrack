import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-6 shadow-soft border border-border/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 animate-slide-up",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary-lighter">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
