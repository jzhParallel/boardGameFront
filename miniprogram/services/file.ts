import { BASE_URL } from '../config'
import { getToken } from '../utils/auth'

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

interface UploadResult {
  storageType: string
  url: string
  originalFilename: string
}

export function uploadImage(filePath: string): Promise<UploadResult> {
  const token = getToken()
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/api/files/images`,
      filePath,
      name: 'file',
      header: token ? { Authorization: token } : {},
      success(res) {
        const data = JSON.parse(res.data || '{}') as ApiResponse<UploadResult>
        if (res.statusCode === 200 && data.code === 200) {
          resolve(data.data)
          return
        }
        reject(new Error(data.msg || '图片上传失败'))
      },
      fail(err) {
        reject(new Error(err.errMsg || '图片上传失败'))
      },
    })
  })
}
