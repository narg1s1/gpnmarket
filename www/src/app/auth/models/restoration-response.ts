import { RestorationErrorCode } from "../enum/restoration-error-code";

export class RestorationResponse {
  error?: {
    code?: RestorationErrorCode | string;
    detail?: string;
  };
}
