export const ROUTES = {
  HOME: "/",
  COMMANDS: "/commands",
  COMMANDS_INFO: "/commands/:id",
  LOGIN: "/log-in"
}
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  COMMANDS: "Команды",
  COMMANDS_INFO: "Описание команды",
  LOGIN: "Авторизация"
};