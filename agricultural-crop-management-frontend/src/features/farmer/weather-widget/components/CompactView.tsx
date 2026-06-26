import React, { useState } from "react";
import { MapPin, Droplets, CloudRain, ExternalLink, Sun, Cloud, CloudLightning, Snowflake, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { useI18n } from "@/hooks/useI18n";
import type { WeatherData, WeatherWidgetDataState } from "../types";

interface CompactViewProps extends React.HTMLAttributes<HTMLDivElement> {
  weatherData: WeatherData | null;
  location: string | null;
  uiState: WeatherWidgetDataState;
  statusMessage: string | null;
}

/**
 * Compact Weather Display Component
 * Minimal card view showing essential weather information
 * Uses forwardRef to support PopoverTrigger asChild pattern
 */
export const CompactView = React.forwardRef<HTMLDivElement, CompactViewProps>(
  ({ weatherData, location, uiState, statusMessage, ...props }, ref) => {
    const { t } = useI18n();
    
    // DEMO STATE
    const [searchQuery, setSearchQuery] = useState("");
    const [demoWeather, setDemoWeather] = useState<any>(null);
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);
    const [demoError, setDemoError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsLoadingDemo(true);
      setDemoError("");
      try {
        // HƯỚNG DẪN: Dán API Key của OpenWeatherMap vào biến apiKey dưới đây
        const apiKey = "";
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&appid=${apiKey}&units=metric&lang=vi`);
        const data = await res.json();
        
        if (data.cod === 200 || data.cod === "200") {
          setDemoWeather(data);
        } else {
          setDemoError(data.message || "Không tìm thấy địa điểm");
        }
      } catch (err) {
        setDemoError("Lỗi kết nối API");
      } finally {
        setIsLoadingDemo(false);
      }
    };

    const surfaceStyle = {
      background:
        "linear-gradient(to bottom right, color-mix(in oklab, var(--secondary) 5%, transparent), var(--card), color-mix(in oklab, var(--accent) 5%, transparent))",
    } as const;

    let placeholder = t("weatherWidget.compact.placeholder.default", "Click to view weather");
    if (uiState === "loading") {
      placeholder = t("weatherWidget.compact.placeholder.loading", "Loading weather...");
    }
    if (uiState === "location_required") {
      placeholder = t("weatherWidget.compact.placeholder.locationRequired", "Update farm location");
    }
    if (uiState === "weather_unavailable") {
      placeholder = t("weatherWidget.compact.placeholder.unavailable", "Weather unavailable");
    }
    if (uiState === "error") {
      placeholder =
        statusMessage ||
        t("weatherWidget.compact.placeholder.error", "Unable to load weather");
    }

    if (!weatherData && !demoWeather) {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Card
            ref={ref}
            {...props}
            className="w-72 border-border rounded-2xl shadow-sm hover:shadow-md transition-all"
            style={surfaceStyle}
          >
            <CardContent className="p-3.5 flex flex-col gap-2.5">
              <div className="text-center text-muted-foreground text-[0.75rem] font-medium">{placeholder}</div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="VD: Dong Thap"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  disabled={isLoadingDemo}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3"
                >
                  {isLoadingDemo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xem"}
                </button>
              </form>
              {demoError && <div className="text-[10px] text-destructive text-center">{demoError}</div>}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (demoWeather) {
      const getIcon = (iconId: string) => {
        if (iconId.startsWith('01')) return Sun;
        if (iconId.startsWith('09') || iconId.startsWith('10')) return CloudRain;
        if (iconId.startsWith('11')) return CloudLightning;
        if (iconId.startsWith('13')) return Snowflake;
        return Cloud;
      };
      const WeatherIconDemo = getIcon(demoWeather.weather[0].icon);
      
      return (
        <Card
          ref={ref}
          {...props}
          className="w-72 border-border rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
          style={surfaceStyle}
        >
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-lg" style={{ backgroundColor: "color-mix(in oklab, var(--accent) 20%, transparent)" }} />
                  <div className="relative p-2 rounded-xl" style={{ background: "linear-gradient(to bottom right, var(--accent), color-mix(in oklab, var(--accent) 70%, transparent))" }}>
                    <WeatherIconDemo className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="numeric text-xl text-foreground">
                      {Math.round(demoWeather.main.temp)}
                    </span>
                    <span className="text-xs text-muted-foreground">°C</span>
                  </div>
                  <div className="text-[0.65rem] text-secondary capitalize">
                    {demoWeather.weather[0].description}
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDemoWeather(null); }} className="text-muted-foreground hover:text-foreground">
                 <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
  
            <div className="flex items-center justify-between text-[0.65rem] pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[130px]">
                  {demoWeather.name}, {demoWeather.coord.lat.toFixed(2)}, {demoWeather.coord.lon.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-secondary" />
                  <span className="numeric text-muted-foreground">
                    {demoWeather.main.humidity}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const WeatherIcon = weatherData.icon;

    return (
      <Card
        ref={ref}
        {...props}
        className="w-60 border-border rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group"
        style={surfaceStyle}
      >
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    backgroundColor:
                      "color-mix(in oklab, var(--accent) 20%, transparent)",
                  }}
                />
                <div
                  className="relative p-2 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(to bottom right, var(--accent), color-mix(in oklab, var(--accent) 70%, transparent))",
                  }}
                >
                  <WeatherIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="numeric text-xl text-foreground">
                    {weatherData.temperature}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("weatherWidget.compact.temperatureUnit", "degC")}
                  </span>
                </div>
                <div className="text-[0.65rem] text-secondary">
                  {weatherData.condition}
                </div>
              </div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>

          <div className="flex items-center justify-between text-[0.65rem] pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {location || t("weatherWidget.compact.locationFallback", "Unknown location")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-secondary" />
                <span className="numeric text-muted-foreground">
                  {weatherData.humidity}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-primary" />
                <span className="numeric text-muted-foreground">
                  {weatherData.precipitation}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

CompactView.displayName = "CompactView";
