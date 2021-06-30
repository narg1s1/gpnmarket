import { UserRole } from "../../user/models/user-role";
import { Feature } from "../models/feature";

export interface IFeatureList {
  backofficeDashboard;
  customerDashboard;
  registration;
  customerRequest;
  createRequest;
  editRequestNameBackoffice;
  editRequestNameCustomer;
  catalog;
  catalogUpdate;
  cart;
  chat;
  notifications;
  approverRequest;
  backofficeRequest;
  positionsList;
  filterPositions;
  deliveryMonitor;
  createContragent;
  editContragent;
  addContragentToUser;
  employees;
  contractGeneration;
  proceduresList;
  createProcedure;
  prolongProcedure;
  retradeProcedure;
  createTechnicalProposal;
  editTechnicalProposal;
  cancelPublishTechnicalProposal;
  createProposalsGroup;
  editProposalsGroup;
  createProposal;
  editProposal;
  cancelPublishProposal;
  createProposalsFromTemplate;
  addProposalContragent;
  publishProposalPositions;
  editProposalsCommonParameters;
  instructionsFileForCustomer;
  instructionsFileForBackoffice;
  publishRequest;
  approveRequest;
  addPosition;
  editPosition;
  backofficeCancelPosition;
  customerCancelPosition;
  changePositionStatus;
  addRequestGroup;
  moveRequestGroup;
  uploadPositionDocuments;
  disbandPositionsGroup;
  addContract;
  downloadGeneratedContract;
  attachContractDocument;
  sendContractToApproval;
  rollbackSentToApprovalContract;
  confirmContractSign;
  kim;
  addDesignDocumentation;
  deleteDesignDocList;
  sendForApprovalDesignDocList;
  addOrEditDesignDocuments;
  sentToApprove;
  filterRequestsByOnlyWithoutResponsibleUser;
  filterRequestsByResponsibleUser;
  filterPositionsByOnlyWithoutResponsibleUser;
  backofficeAgreements;
  customerAgreements;
  recommendedPositions;
  recommendedQuantity;
  backofficeProfile;
  backofficeIntelplan;
  customerProfile;
  customerIntelplan;
  createTemplate;
  normalization;
  requestDashboard;
  positionDashboard;
  contragents;
  hideRequestContragentsName;
}

export const FeatureList: { [key in keyof IFeatureList]: Feature } = {
  backofficeDashboard: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  customerDashboard: { roles: [UserRole.CUSTOMER] },
  registration: {},
  customerRequest: { roles: [UserRole.CUSTOMER] },
  createRequest: { roles: [UserRole.CUSTOMER] },
  editRequestNameBackoffice: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  editRequestNameCustomer: { roles: [UserRole.CUSTOMER] },
  catalog: {roles: [UserRole.CUSTOMER, UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.ADMIN]},
  catalogUpdate: { roles: [UserRole.ADMIN] },
  cart: { roles: [UserRole.CUSTOMER] },
  chat: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER, UserRole.CUSTOMER_APPROVER] },
  notifications: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.BACKOFFICE_OBSERVER, UserRole.CUSTOMER, UserRole.CUSTOMER_APPROVER] },
  instructionsFileForCustomer: { roles: [UserRole.CUSTOMER] },
  approverRequest: { roles: [UserRole.CUSTOMER_APPROVER] },
  backofficeRequest: { roles: [UserRole.BACKOFFICE] },
  positionsList: { roles: [UserRole.BACKOFFICE] },
  filterPositions: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_OBSERVER, UserRole.BACKOFFICE_BUYER] },
  deliveryMonitor: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  createContragent: { roles: [UserRole.ADMIN, UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  editContragent: { roles: [UserRole.ADMIN, UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  addContragentToUser: { roles: [UserRole.ADMIN, UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  employees: { roles: [UserRole.SENIOR_BACKOFFICE] },
  contractGeneration: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  proceduresList: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  createProcedure: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  prolongProcedure: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  retradeProcedure: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  createTechnicalProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  editTechnicalProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  cancelPublishTechnicalProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  createProposalsGroup: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  editProposalsGroup: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  createProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  editProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  cancelPublishProposal: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  createProposalsFromTemplate: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  addProposalContragent: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  publishProposalPositions: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  editProposalsCommonParameters: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  instructionsFileForBackoffice: { roles: [UserRole.BACKOFFICE_BUYER, UserRole.SENIOR_BACKOFFICE] },
  publishRequest: { roles: [UserRole.CUSTOMER] },
  approveRequest: { roles: [UserRole.CUSTOMER, UserRole.CUSTOMER_APPROVER] },
  addPosition: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER, UserRole.ADMIN] },
  editPosition: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.ADMIN] },
  backofficeCancelPosition: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  customerCancelPosition: { roles: [UserRole.CUSTOMER] },
  changePositionStatus: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.ADMIN] },
  addRequestGroup: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  moveRequestGroup: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  disbandPositionsGroup: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  uploadPositionDocuments: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER] },
  addContract: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  downloadGeneratedContract: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  attachContractDocument: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER] },
  sendContractToApproval: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  rollbackSentToApprovalContract: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  confirmContractSign: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  kim: { roles: [UserRole.CUSTOMER] },
  addDesignDocumentation: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  deleteDesignDocList: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  sendForApprovalDesignDocList: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  addOrEditDesignDocuments: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  sentToApprove: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  filterRequestsByOnlyWithoutResponsibleUser: { roles: [UserRole.SENIOR_BACKOFFICE] },
  filterRequestsByResponsibleUser: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_OBSERVER, UserRole.BACKOFFICE_BUYER] },
  filterPositionsByOnlyWithoutResponsibleUser: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_OBSERVER] },
  backofficeAgreements: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  customerAgreements: { roles: [UserRole.CUSTOMER] },
  recommendedPositions: { roles: [UserRole.CUSTOMER]},
  recommendedQuantity: { roles: [UserRole.CUSTOMER]},
  backofficeProfile: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  backofficeIntelplan: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER] },
  customerProfile: { roles: [UserRole.CUSTOMER] },
  customerIntelplan: { roles: [UserRole.CUSTOMER] },
  createTemplate: { roles: [UserRole.CUSTOMER] },
  normalization: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER]},
  requestDashboard: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER]},
  positionDashboard: { roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.CUSTOMER, UserRole.ADMIN]},
  contragents: {roles: [UserRole.CUSTOMER, UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER, UserRole.ADMIN]},
  hideRequestContragentsName: {roles: [UserRole.SENIOR_BACKOFFICE, UserRole.BACKOFFICE_BUYER]}
};
