import { Uuid } from 'src/app/cart/models/uuid';
import { User } from '../../../user/models/user';

export class ManufacturingDocument {
  id: Uuid;
  user?: User;
  created: string;
  filename: string;
  comments?: string;
}
