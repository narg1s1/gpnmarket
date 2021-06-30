import { PaymentTerms } from "../enum/payment-terms";

export const PaymentTermsLabels: Record<PaymentTerms, string> = {
  [PaymentTerms.Days30] : "30 банковских дней по факту поставки",
  [PaymentTerms.Days60] : "60 банковских дней по факту поставки",
  [PaymentTerms.Days90] : "90 банковских дней по факту поставки"
};
