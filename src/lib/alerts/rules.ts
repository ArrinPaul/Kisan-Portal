import { KisanAlert } from './types';

export interface RuleEvaluationInput {
  soilMoistureVwc?: number; // Volumetric Water Content percentage (e.g., 15)
  precipitationMm?: number; // Precitipication sum in mm for next 24h
  maxTemperatureC?: number; // Max temperature in Celsius
  windSpeedKmh?: number;     // Wind speed in km/h
  droughtRisk?: 'Low' | 'Medium' | 'High'; // Risk from GEE/ML model
  floodRisk?: 'Low' | 'Medium' | 'High';   // Risk from GEE/ML model
}

/**
 * Pure rule engine to evaluate conditions and generate KisanAlerts.
 * Does not call any external APIs or AI models.
 */
export function evaluateRules(input: RuleEvaluationInput, _sourceLocation = 'Sensor/API'): KisanAlert[] {
  const alerts: KisanAlert[] = [];
  const now = new Date().toISOString();
  let idCounter = 1;

  const getNextId = (category: string) => `alert-${category.toLowerCase()}-${Date.now()}-${idCounter++}`;

  // 1. Soil Moisture Rules
  if (input.soilMoistureVwc !== undefined) {
    if (input.soilMoistureVwc < 20) {
      alerts.push({
        id: getNextId('Water'),
        severity: 'HIGH',
        category: 'Water',
        title: 'alerts.rules.soil_moisture_low.title',
        message: 'alerts.rules.soil_moisture_low.message',
        recommendation: 'alerts.rules.soil_moisture_low.recommendation',
        timestamp: now,
        source: 'Soil Moisture Predictor',
        read: false,
        params: { moisture: input.soilMoistureVwc.toFixed(1) },
      });
    } else if (input.soilMoistureVwc > 60) {
      alerts.push({
        id: getNextId('Water'),
        severity: 'MEDIUM',
        category: 'Water',
        title: 'alerts.rules.soil_moisture_high.title',
        message: 'alerts.rules.soil_moisture_high.message',
        recommendation: 'alerts.rules.soil_moisture_high.recommendation',
        timestamp: now,
        source: 'Soil Moisture Predictor',
        read: false,
        params: { moisture: input.soilMoistureVwc.toFixed(1) },
      });
    }
  }

  // 2. Precipitation Rules
  if (input.precipitationMm !== undefined && input.precipitationMm > 10) {
    alerts.push({
      id: getNextId('Weather'),
      severity: 'MEDIUM',
      category: 'Weather',
      title: 'alerts.rules.heavy_rain.title',
      message: 'alerts.rules.heavy_rain.message',
      recommendation: 'alerts.rules.heavy_rain.recommendation',
      timestamp: now,
      source: 'Weather Forecast API',
      read: false,
      params: { rain: input.precipitationMm.toFixed(1) },
    });
  }

  // 3. Flood Risk Rules
  if (input.floodRisk === 'High') {
    alerts.push({
      id: getNextId('Flood'),
      severity: 'CRITICAL',
      category: 'Flood',
      title: 'alerts.rules.flood_warning.title',
      message: 'alerts.rules.flood_warning.message',
      recommendation: 'alerts.rules.flood_warning.recommendation',
      timestamp: now,
      source: 'Climate Risk Engine',
      read: false,
    });
  }

  // 4. Drought Risk Rules
  if (input.droughtRisk === 'High') {
    alerts.push({
      id: getNextId('Drought'),
      severity: 'CRITICAL',
      category: 'Drought',
      title: 'alerts.rules.drought_warning.title',
      message: 'alerts.rules.drought_warning.message',
      recommendation: 'alerts.rules.drought_warning.recommendation',
      timestamp: now,
      source: 'Climate Risk Engine',
      read: false,
    });
  }

  // 5. Extreme Heat Rules
  if (input.maxTemperatureC !== undefined && input.maxTemperatureC > 40) {
    alerts.push({
      id: getNextId('Weather'),
      severity: 'HIGH',
      category: 'Weather',
      title: 'alerts.rules.extreme_heat.title',
      message: 'alerts.rules.extreme_heat.message',
      recommendation: 'alerts.rules.extreme_heat.recommendation',
      timestamp: now,
      source: 'Weather Forecast API',
      read: false,
      params: { temp: input.maxTemperatureC.toFixed(1) },
    });
  }

  // 6. Strong Winds Rules
  if (input.windSpeedKmh !== undefined && input.windSpeedKmh > 25) {
    alerts.push({
      id: getNextId('Crop'),
      severity: 'HIGH',
      category: 'Crop',
      title: 'alerts.rules.strong_winds.title',
      message: 'alerts.rules.strong_winds.message',
      recommendation: 'alerts.rules.strong_winds.recommendation',
      timestamp: now,
      source: 'Weather Forecast API',
      read: false,
      params: { wind: input.windSpeedKmh.toFixed(1) },
    });
  }

  return alerts;
}
