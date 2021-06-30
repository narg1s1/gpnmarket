import { UserRole } from "../../user/models/user-role";

export class Feature {
  disabled?: boolean;
  roles?: UserRole[];
  rolesMatch?: 'full' | 'at-least-one';
}
