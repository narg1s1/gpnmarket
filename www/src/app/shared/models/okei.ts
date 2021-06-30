export class Okei {
  id: number;
  code: OkeiCode;
  businessStatus: number;
  name: string;
  symbol: string|null;

  constructor(params?: Partial<Okei>) {
    Object.assign(this, params);
  }
}

export type OkeiCode = string;
