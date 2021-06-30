import { Uuid } from "../../cart/models/uuid";

export class User {
  id: Uuid;
  username: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  // полное имя
  fullName?: string;
  // фамилия и инициалы
  shortName?: string;
  phone?: string;
  position?: string;
  activated?: boolean;

  // todo в заявках нормализатор меняет username на email.
  // todo Хз зачем, но пусть будет здесь необязательное поле
  email?: string;
}
