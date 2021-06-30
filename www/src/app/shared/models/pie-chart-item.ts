import { BaseModel } from "../../core/models/base-model";

export class PieChartItem extends BaseModel {
  label: string;
  count: number;
  color: string;
  select?: boolean;
}
