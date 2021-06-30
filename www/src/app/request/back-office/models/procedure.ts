import { IPositionsFilters } from './../../../positions/positions-filter';
import { Uuid } from "../../../cart/models/uuid";
import { ProposalSource } from "../enum/proposal-source";
import { RequestDocument } from "../../common/models/request-document";
import { ContragentShortInfo } from "../../../contragent/models/contragent-short-info";
import { RequestPosition } from "../../common/models/request-position";
import {BaseModel} from "../../../core/models/base-model";

export class Procedure extends BaseModel {
  id: Uuid;
  procedureId: string;
  contactEmail: string;
  contactPerson: string;
  contactPhone: string;
  createdDate: string;
  remoteId: string;
  requestId: Uuid;
  procedureTitle: string;
  dateEndRegistration: any;
  dateSummingUp: any;
  datePublished: any;
  dateStartRegistration: any;
  lotId: number;
  number?: number;
  offersImported: boolean;
  isAvailableCancelProcedureByImportedOffers: boolean;
  sumWithoutVat: number;
  vatPercent: number;
  isCanceled?: boolean;
  isRetrade: boolean;
  canRetrade: boolean;
  positions: {
    contragent: ContragentShortInfo
    id: Uuid
    lotId: number
    procedureId: number
    requestPosition: RequestPosition
    requestPositionId: Uuid
    requestProcedureId: Uuid
    unitId: number
  }[];
  manualEndRegistration: boolean;
  positionsAllowAnalogsOnly: boolean;
  positionsAnalogs: boolean;
  positionsApplicsVisibility: "PriceAndRating" | "OnlyPrice" | "OnlyRating" | "None";
  positionsBestPriceType: "LowerStartPrice" | "LowerPriceBest";
  bestPriceRequirements: boolean;
  positionsEntireVolume: boolean;
  positionsRequiredAll: boolean;
  withoutTotalPrice: boolean;
  withoutTotalPriceReason: string;
  positionsSuppliersVisibility: "Name" | "NameHidden" | "None";

  dishonestSuppliersForbidden: boolean;
  okpd2: string;
  procedureLotDocuments: RequestDocument[];
  prolongateEndRegistration: number;
  procedureDocuments: RequestDocument[];
  privateAccessContragents: ContragentShortInfo[];
  getTPFilesOnImport: boolean;
  source: ProposalSource;
  requestTechnicalCommercialProposalGroupId?: Uuid;

  registryNumber?: string;
  procedureType?: string;
  isEmergency?: string;
  totalViews?: string;

  contractSubject: string;
  startPrice: number;
  contractConditions: {
    address: string
    isAlternateAddress: boolean
    isAlternateQuantity: boolean
    isAlternateTerm: boolean
    quantity: string
    term: string
  };

  reviewApplicsCity: any;
  currency: string;
  startPriceWithoutVat: string;

  organizer: {
    addresses: {
      address: string;
      city: string;
      country: string;
      createdDate: string;
      id: Uuid;
      locality: any;
      postIndex: string;
      region: string;
      type: 'POSTAL' | 'FACTUAL';
    }[];
    email: string;
    fullName: string;
    id: Uuid;
    inn: string;
    kpp: string;
    responsible: object;
    shortName: string;
    type: string;
    updatedDate: Date;
    usersGroup: object;
    usersGroupId: string
  };

  requestProcedureId: Uuid;

  filters?: IPositionsFilters;

  isWaitingForImportOffers?: boolean;
}
