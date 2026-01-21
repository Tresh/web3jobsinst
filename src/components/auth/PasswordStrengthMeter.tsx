import { cn } from "@/lib/utils";
import { getPasswordStrength } from "./passwordStrength";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const labels: Record<number, string> = {
  0: "Too weak",
  1: "Weak",
  2: "Okay",
  3: "Good",
  4: "Strong",
};

export default function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score } = getPasswordStrength(password);
  const progress = (score / 4) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Strength</span>
        <span className={cn("font-medium", score >= 3 ? "text-foreground" : "text-muted-foreground")}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}
