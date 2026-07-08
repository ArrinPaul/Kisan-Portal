export interface KisanAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'Water' | 'Weather' | 'Crop' | 'Disease' | 'Flood' | 'Drought' | 'Yield' | 'Advisory';
  title: string;          // Translation key or direct string
  message: string;        // Translation key or direct string
  recommendation: string; // Translation key or direct string
  timestamp: string;      // ISO string
  source: string;         // Source of the alert (e.g., 'Soil Moisture Sensor', 'Weather API')
  read: boolean;
  params?: Record<string, string | number>; // Dynamic interpolation parameters for localization
}
