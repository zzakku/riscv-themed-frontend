/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCommand {
  com_name?: string;
  description?: string;
  fmt?: string;
  id?: number;
  img?: string;
  is_delete?: boolean;
  rd_num?: number;
  rs_num?: number;
}

export interface HandlerAuthRequest {
  login: string;
  password: string;
}

export interface HandlerCommandWithOperand {
  command?: DsCommand;
  operand?: number;
}

export interface HandlerErrorResponse {
  description?: string;
  status?: string;
}

export interface HandlerLoginResp {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface HandlerModeratedProgramResp {
  commands_with_operands?: HandlerCommandWithOperand[];
  message?: string;
  program?: HandlerProgramResp;
  status?: string;
}

export interface HandlerModeratorDecisionReq {
  is_accepted: boolean;
}

export interface HandlerModifyProgramFieldsReq {
  init_t1?: number;
  init_t2?: number;
}

export interface HandlerOperandReq {
  operand: number;
}

export interface HandlerFilterReq {
  start_date: string;
  end_date: string;
  status: string;
}

export interface HandlerProgramCmdsResp {
  commands_with_operands?: HandlerCommandWithOperand[];
  program?: HandlerProgramResp;
}

export interface HandlerProgramResp {
  creator_login?: string;
  date_create?: string;
  date_finish?: string;
  date_update?: string;
  id?: number;
  init_t1?: number;
  init_t2?: number;
  moderator_login?: string;
  res_t1?: number;
  res_t2?: number;
  status?: string;
}

export interface HandlerRegisterRequest {
  /**
   * @minLength 3
   * @maxLength 25
   */
  login: string;
  /** @minLength 6 */
  password: string;
}

export interface HandlerSuccessMessageResp {
  message?: string;
  status?: string;
}

export interface HandlerSuccessResponse {
  data?: object;
  message?: string;
  status?: string;
}

export interface HandlerUserPutReq {
  login?: string;
  password?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8081",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title RVBACK
 * @version 1.0
 * @license AS IS (NO WARRANTY)
 * @baseUrl http://localhost:8081
 * @contact API Support <nuhuh@lol.com> (https://github.com/zzakku)
 *
 * Risc-V-themed Web-Service
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Обновить данные неудалённой команды. Доступно ревьюеру.
     *
     * @tags commands
     * @name CommandUpdate
     * @summary Обновить команду
     * @request PUT:/api/command/{id}
     */
    commandUpdate: (
      id: number,
      updated_command: DsCommand,
      params: RequestParams = {},
    ) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/command/${id}`,
        method: "PUT",
        body: updated_command,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить все неудалённые команды. Доступно любому пользователю.
     *
     * @tags commands
     * @name CommandsList
     * @summary Получить все команды
     * @request GET:/api/commands
     */
    commandsList: (query?: string, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/commands`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет операнд команды в программе-черновике текущего пользователя. Доступно авторизованному пользователю.
     *
     * @tags commands-programs
     * @name CommandsProgramsUpdate
     * @summary Изменить операнд команды в программе
     * @request PUT:/api/commands-programs
     * @secure
     */
    commandsProgramsUpdate: (
      query: {
        /** Команда, чей операнд мы меняем */
        command_id: number;
      },
      request: HandlerOperandReq,
      params: RequestParams = {},
    ) =>
      this.request<HandlerSuccessMessageResp, HandlerErrorResponse>({
        path: `/api/commands-programs`,
        method: "PUT",
        query: query,
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет команду из программы-черновика. Доступно авторизованному пользователю.
     *
     * @tags commands-programs
     * @name CommandsProgramsDelete
     * @summary Удалить команду из программы
     * @request DELETE:/api/commands-programs
     * @secure
     */
    commandsProgramsDelete: (
      query: {
        /** Удаляемая команда */
        command_id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerSuccessMessageResp, HandlerErrorResponse>({
        path: `/api/commands-programs`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавить команду без изображения. Доступно ревьюеру.
     *
     * @tags commands
     * @name CommandsCreate
     * @summary Добавить команду
     * @request POST:/api/commands/
     */
    commandsCreate: (request: DsCommand, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/commands/`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить данные одной команды по её ID. Доступно любому пользователю.
     *
     * @tags commands
     * @name CommandsDetail
     * @summary Получить команду по ID
     * @request GET:/api/commands/{id}
     */
    commandsDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/commands/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет команду и ассоциированное изображение в Minio. Доступно ревьюеру.
     *
     * @tags commands
     * @name CommandsDelete
     * @summary Удалить команду
     * @request DELETE:/api/commands/{id}
     */
    commandsDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/commands/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description Добавить изображение к команде, сохранив его в Minio. Доступно ревьюеру.
     *
     * @tags commands
     * @name CommandsAddImageList
     * @summary Добавить изображение
     * @request GET:/api/commands/{id}/add-image
     */
    commandsAddImageList: (
      id: number,
      data: {
        /** Файл изображения */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/commands/${id}/add-image`,
        method: "GET",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Позволяет добавить команду в текущую программу-черновик. Доступно авторизованным пользователям.
     *
     * @tags commands
     * @name CommandsAddToProgramCreate
     * @summary Добавить команду в программу
     * @request POST:/api/commands/{id}/add-to-program
     */
    commandsAddToProgramCreate: (id: number, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, void | HandlerErrorResponse>({
        path: `/api/commands/${id}/add-to-program`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * @description Получить список неудалённых программ. Ревьюер может получить все, оператор - только свои.
     *
     * @tags programs
     * @name ProgramsList
     * @summary Получить список програм
     * @request GET:/api/programs
     */
    programsList: (request: HandlerFilterReq, params: RequestParams = {}) =>
      this.request<HandlerProgramCmdsResp, void | HandlerErrorResponse>({
        path: `/api/programs`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет программу-черновик текущего пользователя. Заявка определяется автоматически по ID пользователя.
     *
     * @tags programs
     * @name ProgramsDelete
     * @summary Удаляет текущую программу-черновик
     * @request DELETE:/api/programs
     * @secure
     */
    programsDelete: (params: RequestParams = {}) =>
      this.request<HandlerSuccessMessageResp, HandlerErrorResponse>({
        path: `/api/programs`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Получает ID текущей программы-черновика и количество команд в ней. Доступно всем, для госта всегда возвращается 0, 0
     *
     * @tags programs
     * @name ProgramsCartIconList
     * @summary Получить иконку корзины
     * @request GET:/api/programs/cart-icon
     */
    programsCartIconList: (params: RequestParams = {}) =>
      this.request<HandlerProgramCmdsResp, void | HandlerErrorResponse>({
        path: `/api/programs/cart-icon`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Получить одну программу. Ревьюер может получить любую, создатель - только свои.
     *
     * @tags programs
     * @name ProgramsDetail
     * @summary Получить одну программу
     * @request GET:/api/programs/{id}
     */
    programsDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerProgramCmdsResp, HandlerErrorResponse>({
        path: `/api/programs/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет дополнительные поля программы. Доступно авторизованному пользователю.
     *
     * @tags programs
     * @name ProgramsUpdate
     * @summary Изменить поля программы
     * @request PUT:/api/programs/{id}
     */
    programsUpdate: (
      id: number,
      request: HandlerModifyProgramFieldsReq,
      params: RequestParams = {},
    ) =>
      this.request<HandlerProgramCmdsResp, HandlerErrorResponse>({
        path: `/api/programs/${id}`,
        method: "PUT",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Исполняет или отклоняет программу, проставляет в описание программы id принявшего решение ревьюера, вычисляет конечные поля программы. Доступно ревьюеру.
     *
     * @tags programs
     * @name ProgramsModerateUpdate
     * @summary Завершить программу
     * @request PUT:/api/programs/{id}/moderate
     */
    programsModerateUpdate: (
      id: number,
      isAccepted: HandlerModeratorDecisionReq,
      params: RequestParams = {},
    ) =>
      this.request<HandlerModeratedProgramResp, HandlerErrorResponse>({
        path: `/api/programs/${id}/moderate`,
        method: "PUT",
        body: isAccepted,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершить черновик заявки-программы и отправить на модерацию. Доступно авторизованному пользователю.
     *
     * @tags programs
     * @name ProgramsSubmitUpdate
     * @summary Сформировать программу
     * @request PUT:/api/programs/{id}/submit
     */
    programsSubmitUpdate: (id: number, params: RequestParams = {}) =>
      this.request<HandlerSuccessMessageResp, HandlerErrorResponse>({
        path: `/api/programs/${id}/submit`,
        method: "PUT",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Предоставляет текущему пользователю свои данные. Доступно авторизованным пользователям.
     *
     * @tags users
     * @name UsersList
     * @summary Получение данных пользователя
     * @request GET:/api/users
     * @secure
     */
    usersList: (params: RequestParams = {}) =>
      this.request<
        {
          status?: string;
          user?: object;
        },
        HandlerErrorResponse
      >({
        path: `/api/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет данные пользователя. Доступно авторизованным пользователям.
     *
     * @tags users
     * @name UsersUpdate
     * @summary Обновление данных в личном кабинете
     * @request PUT:/api/users
     * @secure
     */
    usersUpdate: (request: HandlerUserPutReq, params: RequestParams = {}) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/users`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Выдача зарегистрированному пользователю JWT-токена
     *
     * @tags users
     * @name UsersLogInCreate
     * @summary Аутентификация юзера
     * @request POST:/api/users/log-in
     */
    usersLogInCreate: (body: HandlerAuthRequest, params: RequestParams = {}) =>
      this.request<HandlerLoginResp, HandlerErrorResponse>({
        path: `/api/users/log-in`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет JWT-токен в черный список.
     *
     * @tags users
     * @name UsersLogOutCreate
     * @summary Выход пользователя
     * @request POST:/api/users/log-out
     * @secure
     */
    usersLogOutCreate: (params: RequestParams = {}) =>
      this.request<HandlerSuccessMessageResp, HandlerErrorResponse>({
        path: `/api/users/log-out`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт в базе данных нового пользователя с указанными данными, если логин уникальный и данные пользователя соответствуют требованиям
     *
     * @tags users
     * @name UsersRegisterCreate
     * @summary Регистрация пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (
      body: HandlerRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerSuccessResponse, HandlerErrorResponse>({
        path: `/api/users/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
