import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAggregatedAlerts } from "@/lib/alerts/aggregate";

// Mock the server actions from @/lib/actions
vi.mock("@/lib/actions", () => {
  return {
    predictSoilMoistureAction: vi.fn(),
    getWeatherReportAction: vi.fn(),
    analyzeDroughtAndFloodRiskAction: vi.fn(),
    scheduleIrrigationAction: vi.fn(),
  };
});

describe("Kisan Alert Engine Aggregator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should aggregate data and evaluate rules successfully when all actions succeed", async () => {
    const {
      predictSoilMoistureAction,
      getWeatherReportAction,
      analyzeDroughtAndFloodRiskAction,
      scheduleIrrigationAction,
    } = await import("@/lib/actions");

    // Mock successful actions
    (predictSoilMoistureAction as any).mockResolvedValue({
      data: { volumetricWaterContent: 15.0, summary: "Dry", confidence: 0.95 },
      error: null,
    });
    (getWeatherReportAction as any).mockResolvedValue({
      data: {
        current: { temperature: 42.0, windSpeed: 28.0, humidity: 30, conditions: "Sunny", iconName: "Sun" },
        forecast: [{ temperature: 43.0, conditions: "Hot", time: "12:00 PM", iconName: "Sun" }],
        summary: "Hot and dry",
      },
      error: null,
    });
    (analyzeDroughtAndFloodRiskAction as any).mockResolvedValue({
      data: { droughtRisk: "High", floodRisk: "Low", summary: "High risk of drought", confidence: 0.85 },
      error: null,
    });
    (scheduleIrrigationAction as any).mockResolvedValue({
      data: { recommendation: "Irrigate now", nextIrrigationDate: "2026-07-09", wateringDepthInches: 1.0, notes: "Very dry" },
      error: null,
    });

    // Mock fetch for precipitation_sum
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          precipitation_sum: [0.0],
        },
      }),
    });

    const alerts = await getAggregatedAlerts(12.3456, 78.9012);

    // Verify all actions were called
    expect(predictSoilMoistureAction).toHaveBeenCalledWith({ latitude: 12.3456, longitude: 78.9012 });
    expect(getWeatherReportAction).toHaveBeenCalledWith({ latitude: 12.3456, longitude: 78.9012 });
    expect(analyzeDroughtAndFloodRiskAction).toHaveBeenCalledWith({ latitude: 12.3456, longitude: 78.9012 });
    expect(scheduleIrrigationAction).toHaveBeenCalledWith({ latitude: 12.3456, longitude: 78.9012 });

    // Based on mocks:
    // - soilMoistureVwc = 15.0 (<20 => HIGH water alert)
    // - droughtRisk = "High" (CRITICAL drought warning)
    // - maxTemperatureC = 43.0 (>40 => HIGH heat alert)
    // - windSpeedKmh = 28.0 (>25 => HIGH wind/crop alert)
    expect(alerts.length).toBeGreaterThanOrEqual(4);

    const categories = alerts.map((a) => a.category);
    expect(categories).toContain("Water");
    expect(categories).toContain("Drought");
    expect(categories).toContain("Weather");
    expect(categories).toContain("Crop");

    const severities = alerts.map((a) => a.severity);
    expect(severities).toContain("HIGH");
    expect(severities).toContain("CRITICAL");
  });

  it("should handle action failures gracefully and still produce partial alerts", async () => {
    const {
      predictSoilMoistureAction,
      getWeatherReportAction,
      analyzeDroughtAndFloodRiskAction,
      scheduleIrrigationAction,
    } = await import("@/lib/actions");

    // Mock failures / errors
    (predictSoilMoistureAction as any).mockRejectedValue(new Error("Network Failure"));
    (getWeatherReportAction as any).mockResolvedValue({ data: null, error: "API limit exceeded" });
    (analyzeDroughtAndFloodRiskAction as any).mockResolvedValue({
      data: { droughtRisk: "High", floodRisk: "Low", summary: "High risk of drought", confidence: 0.85 },
      error: null,
    });
    (scheduleIrrigationAction as any).mockRejectedValue(new Error("Timeout"));

    const alerts = await getAggregatedAlerts(12.3456, 78.9012);

    // Should still evaluate rules with droughtRisk = "High" => Critical drought warning alert
    expect(alerts.length).toBe(1);
    expect(alerts[0].category).toBe("Drought");
    expect(alerts[0].severity).toBe("CRITICAL");
  });
});
