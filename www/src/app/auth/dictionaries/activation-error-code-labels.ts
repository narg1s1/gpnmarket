import { ActivationErrorCode } from "../enum/activation-error-code";

export const ActivationErrorCodeLabels: Record<ActivationErrorCode, string> = {
  [ActivationErrorCode.INCORRECT_ACTIVATION_TOKEN]: 'Некорректный код активации',
  [ActivationErrorCode.ALREADY_ACTIVATED]: 'Профиль уже был активирован ранее',
  [ActivationErrorCode.ACTIVATION_TOKEN_EXPIRED]: 'Срок действия ссылки истек',
  [ActivationErrorCode.NOT_ACTIVATED]: 'Необходима активация',
  [ActivationErrorCode.INVALID_LINK]: 'Ссылка недействительна',
  [ActivationErrorCode.UNKNOWN]: 'Что-то пошло не так'
};

