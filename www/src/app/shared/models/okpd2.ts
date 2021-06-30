export class Okpd2 {
  active?: boolean;
  id?: number;
  createdDate?: string;
  endDate?: string;
  code: Okpd2Code;
  name: string;
  parentCode: Okpd2Code;
}

export type Okpd2Code = string;
