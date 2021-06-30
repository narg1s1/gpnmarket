import { Uuid } from "../../cart/models/uuid";

export class RegistrationRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  joinContragent: {
    id: Uuid
  };
}
