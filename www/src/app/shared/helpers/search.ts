import { ContragentInfo } from "../../contragent/models/contragent-info";
import { ContragentList } from "../../contragent/models/contragent-list";
import { ContragentShortInfo } from "../../contragent/models/contragent-short-info";
import { User } from "../../user/models/user";
import { RequestPosition } from "../../request/common/models/request-position";
import { UxgFilterCheckboxItem, UxgFilterCheckboxList } from "projects/uxg/src/public-api";

export function searchContragents<T extends ContragentInfo | ContragentList | ContragentShortInfo>(q: string, contragents: T[]): T[] {
  return contragents.filter(c => searchContragent(q, c));
}

export function searchContragent(q: string, contragent: ContragentInfo | ContragentList | ContragentShortInfo): boolean {
  return contragent.shortName?.toLowerCase().indexOf(q.toLowerCase()) > -1 || contragent.inn?.indexOf(q) > -1 || contragent.kpp?.indexOf(q) > -1;
}

export function searchUsers(q: string, users: User[]): User[] {
  return users.filter(c => !q || c.shortName.toLowerCase().indexOf(q.toLowerCase()) > -1 || c.fullName.toLowerCase().indexOf(q.toLowerCase()) > -1);
}

export function searchPosition(q: string, position: RequestPosition): boolean {
  return position.name?.toLowerCase().indexOf(q.toLowerCase()) >= 0;
}

export function searchString(q: string, strings: string[]): string[] {
  return strings.filter(str => str?.toString().toLowerCase().includes(q?.toLowerCase()));
}
