export class RecommendedQuantity {
  id: number;
  name: string;
  pathToForecast: string;
  accuracy: number;
  unit: string;
  quantity: number;
  isNotify: boolean;
  createdAt: string;
  forecastCommodity: ForecastCommodity[];
}

export class ForecastCommodity {
  id: number;
  additionalData: string;
  date: string;
  quantity: number;
  isNotify: boolean;
  isForecast: boolean;
  createdAt: string;
  updatedAt: string;
}
