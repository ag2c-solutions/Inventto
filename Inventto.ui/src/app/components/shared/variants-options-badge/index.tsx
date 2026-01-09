import { Badge } from "@/app/components/ui/badge";
import type { VariantOption } from "@/app/features/products/types";
import { ColorBadge } from "../color-badge";
import { cn } from "@/lib/utils";

interface VariantOptionBadgeProps {
    option: VariantOption;
    className?: string;
}

export function VariantOptionBadge({ option, className }: VariantOptionBadgeProps) {
    return (
        option.value.includes('#') ? (
            <ColorBadge className={className} color={option.value} />
        ) : (
            <Badge
                variant="secondary"
                className={cn("flex items-center gap-2 pl-1 pr-1.5 py-1", className)}
            >
                <span className="text-xs">{`${option.name} ${option.value}`}</span>
            </Badge>
        )
    );
}