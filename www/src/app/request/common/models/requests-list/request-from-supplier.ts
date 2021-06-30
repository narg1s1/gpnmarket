export enum RequestFromSupplierStatuses {
  AWAITING = 'В ожидании разъяснения',
  ANSWERED = 'Есть ответ',
  CANCELED = 'Отклонен',
}

export interface IProcedureRequestFromSupplier {
  id: string;
  isDocExplanation: boolean;
  requestProcedureId: string;
  procedureTitle: string;
  supplier: any;
  userId: string;
  procedureId: number;
  lotId: number;
  applicationId: number;
  etpCustomerId: number;
  etpRequestId: number;
  statusId: number;
  status: RequestFromSupplierStatuses;
  createdDate: string;
  answeredDate: string;
  canceledDate: string;
  question: string;
  answer: string;
  questionDocuments: File[];
  answerDocuments: File[];
}
