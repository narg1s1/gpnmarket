import { ContragentList } from "./contragent-list";
import { ContragentInfoAddresses } from "./contragent-info-address";
import { ContragentInfoBankRequisites } from "./contragent-info-bank-requisites";

export class ContragentRegistrationRequest {
  contragent: ContragentList;
  contragentAddress: ContragentInfoAddresses;
  contragentBankRequisite: ContragentInfoBankRequisites;
}
