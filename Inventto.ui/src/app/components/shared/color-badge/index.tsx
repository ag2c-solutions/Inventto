import { Badge } from "@/app/components/ui/badge";
import { parseColorValue } from "@/app/features/products/utils";
import { cn } from "@/lib/utils";

interface ColorBadgeProps {
    color: string;
    className?: string;
}

export const ColorBadge = ({ color, className }: ColorBadgeProps) => {
    return (
        <Badge
            variant="secondary"
            className={cn("flex items-center gap-2 pl-1 pr-1.5 py-1", className)}
        >
            <div
                className="h-4 w-4 rounded-full border shadow-sm"
                style={{ backgroundColor: parseColorValue(color).hex }}
            />
            <span className="text-xs">{parseColorValue(color).name}</span>
        </Badge>
    );
}