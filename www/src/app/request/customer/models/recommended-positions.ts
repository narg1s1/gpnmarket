export class RecommendedPositions {
  techmap: {
    id: number;
    name: string;
    commodities: Commodity[];
  };
  wantedCommodities: Commodity[];
}

export class Commodity {
  name: string;
  quantity: number;
  unit: string;
  deliveryBasis: string;
  deliveryDate: string;
  isDeliveryDateAsap: boolean;
}

