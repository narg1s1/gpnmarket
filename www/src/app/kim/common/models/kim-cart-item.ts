import { Uuid } from "../../../cart/models/uuid";
import { KimDictionaryItem } from "./kim-dictionary-item";

export class KimCartItem {
  kimDictionaryPosition: KimDictionaryItem;
  quantity: number;
}
