"use server";

import { evaluateRules } from "@/lib/alerts/rules";
import type { KisanAlert } from "@/lib/alerts/types";
import {
  getWeatherReportAction,
  scheduleIrrigationAction,
  predictSoilMoistureAction,
  analyzeDroughtAndFloodRiskAction,
} from "@/lib/actions";

/**
 * Aggregates climate, weather, and soil data for a location and passes them
 * to the rules engine to generate localized KisanAlerts.
 * Each server action is wrapped in a try-catch block to handle failures gracefully.
 */
export async function getAggregatedAlerts(
  latitude: number,
  longitude: number
): Promise<KisanAlert[]> {
  let soilMoistureVwc: number | undefined;
  let precipitationMm: number | undefined;
  let maxTemperatureC: number | undefined;
  let windSpeedKmh: number | undefined;
  let droughtRisk: "Low" | "Medium" | "High" | undefined;
  let floodRisk: "Low" | "Medium" | "High" | undefined;

  const coords = { latitude, longitude };

  // 1. Fetch Soil Moisture Predictor Data
  try {
    const res = await predictSoilMoistureAction(coords);
    if (res && res.data) {
      soilMoistureVwc = res.data.volumetricWaterContent;
    } else if (res && res.error) {
      console.warn("predictSoilMoistureAction returned error:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch soil moisture prediction:", error);
  }

  // 2. Fetch Weather Forecast & Current Weather Data
  try {
    const res = await getWeatherReportAction(coords);
    if (res && res.data) {
      if (res.data.current) {
        windSpeedKmh = res.data.current.windSpeed;
      }
      
      const forecastTemps = res.data.forecast?.map((f) => f.temperature) || [];
      if (res.data.current?.temperature !== undefined) {
        forecastTemps.push(res.data.current.temperature);
      }
      
      if (forecastTemps.length > 0) {
        maxTemperatureC = Math.max(...forecastTemps);
      }
    } else if (res && res.error) {
      console.warn("getWeatherReportAction returned error:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch weather report:", error);
  }

  // 3. Fetch Climate Risk Analysis (Drought/Flood)
  try {
    const res = await analyzeDroughtAndFloodRiskAction(coords);
    if (res && res.data) {
      droughtRisk = res.data.droughtRisk;
      floodRisk = res.data.floodRisk;
    } else if (res && res.error) {
      console.warn("analyzeDroughtAndFloodRiskAction returned error:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch drought & flood risk:", error);
  }

  // 4. Fetch Irrigation Scheduling
  try {
    const res = await scheduleIrrigationAction(coords);
    if (res && res.error) {
      console.warn("scheduleIrrigationAction returned error:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch irrigation schedule:", error);
  }

  // 5. Fetch Precipitation for the Next 24h directly from Open-Meteo as a robust fallback/supplement
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&timezone=auto&forecast_days=1`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (response.ok) {
      const data = await response.json();
      if (data.daily && data.daily.precipitation_sum && data.daily.precipitation_sum.length > 0) {
        precipitationMm = data.daily.precipitation_sum[0] ?? 0;
      }
    }
  } catch (error) {
    console.error("Failed to fetch precipitation directly from Open-Meteo API:", error);
  }

  const input = {
    soilMoistureVwc,
    precipitationMm,
    maxTemperatureC,
    windSpeedKmh,
    droughtRisk,
    floodRisk,
  };

  const source = `Coords: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

  return evaluateRules(input, source);
}
