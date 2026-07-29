import { BASE_URL } from '../config'

/**
 * 兼容完整 URL 与站内相对路径
 */
export function resolveAssetUrl(url?: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}
