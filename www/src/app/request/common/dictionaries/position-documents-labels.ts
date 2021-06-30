import { PositionDocuments } from "../models/position-documents";

export const PositionDocumentsLabels: { [key in keyof PositionDocuments]: string } = {
  general: "Общие документы",
  tp: "Документы ТП",
  cp: "Документы КП",
  tcp: "Документы ТКП",
  contract: "Договоры",
  rkd: "Документы РКД",
};
