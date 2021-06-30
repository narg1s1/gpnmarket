import { Uuid } from "../../cart/models/uuid";

export class OkatoRegion {
  active?: boolean;
  id?: Uuid;
  createdDate?: string;
  endDate?: string;
  code: OkatoRegionCode;
  name: string;
  parentCode?: OkatoRegionCode;
}

export type OkatoRegionCode = string;
