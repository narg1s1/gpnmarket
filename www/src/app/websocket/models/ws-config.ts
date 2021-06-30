export interface WsConfig {
  url: string;
  chatUrl: string;
  notificationsUrl: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}
