export class UxgFilterCheckboxItem<V = unknown, I = unknown> {
  value: V;
  item?: I;
  label?: string | number;
  hideFolded?: boolean;
  checked?: boolean;
}

export type UxgFilterCheckboxList<V = unknown, I = unknown> = UxgFilterCheckboxItem<V, I>[];
