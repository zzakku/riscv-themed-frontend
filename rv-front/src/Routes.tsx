export const ROUTES = {
  HOME: "/",
  COMMANDS: "/commands",
  COMMANDS_INFO: "/commands/:id",
  PROGRAM: "/program/:id",
  PROGRAMS: "/programs",
  LOGIN: "/log-in",
  REGISTER: "/register",
  PROFILE: "/profile",
  IMAGE_SEARCH: "/command-img-search"
}
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  COMMANDS: "Команды",
  COMMANDS_INFO: "Описание команды",
  PROGRAM: "Программа",
  PROGRAMS: "Программы",
  LOGIN: "Авторизация",
  REGISTER: "Регистрация",
  PROFILE: "Личный кабинет",
  IMAGE_SEARCH: "Поиск команд по изображению"
};