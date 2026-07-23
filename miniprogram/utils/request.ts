import { BASE_URL } from '../config'
import { getToken, clearToken } from './auth'

/** 后端统一响应结构 */
interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  /** 是否跳过错误提示 */
  silent?: boolean
}

/**
 * 封装 wx.request
 * - 自动拼接 BASE_URL
 * - 自动携带 Authorization header
 * - 统一解析 R<T> 结构
 * - 401 自动清除登录态
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  const token = getToken()
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  }
  if (token) {
    header['Authorization'] = token
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success(res) {
        const data = res.data as ApiResponse<T>
        if (res.statusCode === 401 || data.code === 401) {
          clearToken()
          if (!options.silent) {
            wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          }
          reject(new Error('未授权'))
          return
        }
        if (data.code === 200) {
          resolve(data.data)
        } else {
          if (!options.silent) {
            wx.showToast({ title: data.msg || '请求失败', icon: 'none' })
          }
          reject(new Error(data.msg || '请求失败'))
        }
      },
      fail(err) {
        if (!options.silent) {
          wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        }
        reject(new Error(err.errMsg || '网络异常'))
      },
    })
  })
}

/** GET 请求 */
export function get<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'GET', data, ...options })
}

/** POST 请求 */
export function post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'POST', data, ...options })
}

/** PUT 请求 */
export function put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/** DELETE 请求 */
export function del<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
  return request<T>({ url, method: 'DELETE', data, ...options })
}
