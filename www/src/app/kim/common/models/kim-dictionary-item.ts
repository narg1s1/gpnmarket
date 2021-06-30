import { Uuid } from "../../../cart/models/uuid";
import { ClassifierCategory } from "./classifier-category";

export class KimDictionaryItem {
  id: Uuid;
  dictionaryPositionName: string;
  okeiCode: string;
  dictionaryPositionId: number;
  dictionaryPositionCategoryCode: string;
  classifierCategory: ClassifierCategory;
}
