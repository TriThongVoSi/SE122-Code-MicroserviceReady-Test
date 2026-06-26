import { Card } from "@/shared/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useWeatherWidget } from "./hooks/useWeatherWidget";
import { CompactView } from "./components/CompactView";
import { DetailedView } from "./components/DetailedView";
import type { WeatherWidgetProps } from "./types";

/**
 * Weather Widget - Composition Root
 * Main entry point that initializes the hook and composes the view
 */
export function WeatherWidget({
    variant = "compact",
    farmId,
    seasonId,
}: WeatherWidgetProps) {
    const controller = useWeatherWidget({ farmId, seasonId });

    if (variant === "compact") {
        return (
            <CompactView
                weatherData={null}
                location={null}
                uiState="loading"
                statusMessage={null}
            />
        );
    }

    return (
        <Card
            className="border-border rounded-2xl shadow-sm overflow-hidden"
            style={{
                background:
                    "linear-gradient(to bottom right, color-mix(in oklab, var(--secondary) 5%, transparent), var(--card), color-mix(in oklab, var(--accent) 5%, transparent))",
            }}
        >
            <DetailedView {...controller} />
        </Card>
    );
}



