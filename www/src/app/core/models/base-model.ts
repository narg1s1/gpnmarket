/**
 * Базовый класс для моделей
 */
export class BaseModel {

  constructor(params?: Partial<BaseModel>) {
    Object.assign(this, params);
  }
}
