import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure<TData = unknown> {
  success: boolean;
  data: TData;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

type BizErrorInfo = Omit<ResponseStructure, 'success'>;

type BizError = Error & {
  info?: BizErrorInfo;
};

type ErrorHandlerOptions = {
  skipErrorHandler?: boolean;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toResponseStructure = (value: unknown): ResponseStructure | null => {
  if (
    !isObject(value) ||
    typeof value.success !== 'boolean' ||
    !Object.prototype.hasOwnProperty.call(value, 'data')
  ) {
    return null;
  }

  return {
    success: value.success,
    data: value.data,
    errorCode: typeof value.errorCode === 'number' ? value.errorCode : undefined,
    errorMessage: typeof value.errorMessage === 'string' ? value.errorMessage : undefined,
    showType: typeof value.showType === 'number' ? (value.showType as ErrorShowType) : undefined,
  };
};

const isBizError = (error: unknown): error is BizError =>
  error instanceof Error && error.name === 'BizError';

const hasResponse = (error: unknown): error is { response: { status?: number } } =>
  isObject(error) && isObject(error.response);

const hasRequest = (error: unknown): error is { request: unknown } =>
  isObject(error) && Object.prototype.hasOwnProperty.call(error, 'request');

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const response = toResponseStructure(res);
      if (!response) {
        return;
      }

      const { success, data, errorCode, errorMessage, showType } = response;
      if (!success) {
        const error = new Error(errorMessage) as BizError;
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: unknown, opts?: ErrorHandlerOptions) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (isBizError(error)) {
        const errorInfo = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (hasResponse(error)) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (hasRequest(error)) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const url = config?.url?.concat('?token = 123');
      return { ...config, url };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const data = (response as { data?: { success?: boolean } }).data;

      if (data?.success === false) {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};
