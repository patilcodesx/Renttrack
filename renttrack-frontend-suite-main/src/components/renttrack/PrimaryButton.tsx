import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  children,
  loading,
  icon,
  disabled,
  className,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("gap-2", className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </Button>
  );
}
