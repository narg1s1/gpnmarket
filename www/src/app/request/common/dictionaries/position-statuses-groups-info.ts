import { RequestPosition } from "../models/request-position";
import { PositionStatusGroups } from "./position-statuses-groups";
import { PositionStatus } from "../enum/position-status";

export interface PositionStatusesGroupInfo {
  url: string;
  label: string;
  statuses: PositionStatus[];
  positions: RequestPosition[];
  shortName: string;
  hasActions: boolean;
  color?: string;
  availabilityField?: string;
  counterField?: string;
}

export const PositionStatusesGroupsInfo: PositionStatusesGroupInfo[] = [
  {
    url: "draft",
    label: "Черновик",
    statuses: PositionStatusGroups.DRAFT,
    positions: [],
    shortName: "Черновик",
    hasActions: false,
    color: "#C4C4C4"
  },
  {
    url: "new",
    label: "Новая",
    statuses: PositionStatusGroups.NEW,
    positions: [],
    shortName: "Новая",
    hasActions: false,
    color: "#BE3A3A"
  },
  {
    url: "technical-proposals",
    label: "Технические предложения",
    statuses: PositionStatusGroups.TECHNICAL_PROPOSALS,
    positions: [],
    shortName: "ТП",
    hasActions: true,
    color: "#ED9254",
    availabilityField: "isTpAvailable",
    counterField: "tp"
  },
  {
    url: "commercial-proposals",
    label: "Коммерческие предложения",
    statuses: PositionStatusGroups.PROPOSALS,
    positions: [],
    shortName: "КП",
    hasActions: true,
    color: "#F9C74F",
    availabilityField: "isCpAvailable",
    counterField: "kp"
  },
  {
    url: "offers-approve-groups",
    label: "Технико-коммерч. предложения",
    statuses: PositionStatusGroups.TECHNICAL_COMMERCIAL_PROPOSALS,
    positions: [],
    shortName: "ТКП",
    hasActions: true,
    color: "#F35C6C",
    availabilityField: "isTcpAvailable",
    counterField: "tcp"
  },
  {
    url: "design-documentation",
    label: "РКД",
    statuses: PositionStatusGroups.RKD,
    positions: [],
    shortName: "РКД и изготовление",
    hasActions: true,
    color: "#56b9f2",
    availabilityField: "isRkdAvailable",
    counterField: "rkd"
  },
  {
    url: "contracts",
    label: "Договор",
    statuses: PositionStatusGroups.CONTRACT,
    positions: [],
    shortName: "Договор",
    hasActions: true,
    color: "#00AA5F",
    availabilityField: "isContractAvailable",
    counterField: "contractAgreement"
  },
  {
    url: "delivery",
    label: "Доставка и оплата",
    statuses: PositionStatusGroups.DELIVERY,
    positions: [],
    shortName: "Доставка и оплата",
    hasActions: false,
    color: "#1400DC"
  },
  {
    url: "completed",
    label: "Завершено",
    statuses: PositionStatusGroups.COMPLETED,
    positions: [],
    shortName: "Завершено",
    hasActions: false,
    color: "#9b51e0"
  },
  {
    url: "canceled",
    label: "Отменено",
    statuses: PositionStatusGroups.CANCELED,
    positions: [],
    shortName: "Отменено",
    hasActions: false,
    color: "#c4c4c4"
  },
  {
    url: "not-relevant",
    label: "Не актуально",
    statuses: PositionStatusGroups.NOT_RELEVANT,
    positions: [],
    shortName: "Не актуально",
    hasActions: false,
    color: "#c4c4c4"
  },
];
