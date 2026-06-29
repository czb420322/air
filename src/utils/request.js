import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 环境配置
const env = process.env.NODE_ENV
const isDev = env === 'development'
const isProd = env === 'production'

// 创建axios实例的配置
const createAxiosConfig = () => {
  const config = {
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: parseInt(process.env.VUE_APP_REQUEST_TIMEOUT) || 10000,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }

  // 开发环境配置
  if (isDev) {
    config.withCredentials = true // 跨域请求携带cookie
  }

  return config
}

// 创建axios实例
const service = axios.create(createAxiosConfig())

// 请求重试配置
const retryConfig = {
  retries: parseInt(process.env.VUE_APP_REQUEST_RETRY) || 3,
  retryDelay: parseInt(process.env.VUE_APP_RETRY_DELAY) || 1000,
  shouldRetry: (error) => {
    // 只有网络错误或超时错误才重试
    return !error.response && (error.code === 'ECONNABORTED' || !error.response)
  }
}

// 请求队列（用于取消请求）
const pendingRequests = new Map()

// 生成请求唯一标识
const generateRequestKey = (config) => {
  return `${config.method}&${config.url}&${JSON.stringify(config.params)}&${JSON.stringify(config.data)}`
}

// 添加请求到队列
const addPendingRequest = (config) => {
  const requestKey = generateRequestKey(config)
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, cancel)
    }
  })
}

// 移除请求从队列
const removePendingRequest = (config) => {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey)
    cancel(requestKey)
    pendingRequests.delete(requestKey)
  }
}

// 清除所有pending请求
export const clearPendingRequests = () => {
  pendingRequests.forEach((cancel, key) => {
    cancel(key)
  })
  pendingRequests.clear()
}

// 日志工具
const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => isDev && console.error(...args),
  warn: (...args) => isDev && console.warn(...args)
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 开发环境打印请求日志
    logger.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config)

    // 防止重复请求（可选，根据业务需求开启）
    // removePendingRequest(config)
    // addPendingRequest(config)

    // 添加token到请求头
    if (store.getters.token) {
      // config.headers['X-Token'] = getToken();
      // 开发环境使用 'Bearer'，生产环境使用 'bearer'
      const tokenPrefix = isDev ? 'Bearer' : 'bearer'
      config.headers['Authorization'] = `${tokenPrefix} ${getToken()}`
      config.headers['ngrok-skip-browser-warning'] = "true"  // 关键：添加这个请求头以跳过拦截页

    }

    // 添加时间戳（防止缓存）
    if (config.method === 'get' && isDev) {
      config.params = { ...config.params, _t: Date.now() }
    }

    return config
  },
  error => {
    logger.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 开发环境打印响应日志
    logger.log(`[Response] ${response.config.url}`, response.data)

    // 解构多层包装的响应数据
    const res = unwrapResponse(response.data)

    // 根据业务状态码处理
    if (res.code !== 200) {
      // 错误消息处理
      const errorMessage = res.message || '请求失败'

      // 特殊状态码处理
      switch (res.code) {
        case 50008: // 非法token
        case 50012: // 其他客户端登录
        case 50014: // token过期
          handleTokenExpired()
          break
        case 50000: // 服务器内部错误
          Message.error({
            message: '服务器内部错误，请稍后重试',
            duration: 5 * 1000
          })
          break
        case 40000: // 参数错误
          Message.warning({
            message: errorMessage,
            duration: 3 * 1000
          })
          break
        case 40300: // 权限不足
          Message.warning({
            message: '权限不足，无法执行此操作',
            duration: 3 * 1000
          })
          break
        case 40400: // 资源不存在
          Message.warning({
            message: '请求的资源不存在',
            duration: 3 * 1000
          })
          break
        default:
          Message.error({
            message: errorMessage,
            duration: 5 * 1000
          })
      }

      return Promise.reject(new Error(errorMessage))
    }

    return res
  },
  error => {
    logger.error('[Response Error]', error)

    // 处理取消请求
    if (axios.isCancel(error)) {
      logger.warn('Request canceled:', error.message)
      return Promise.reject(error)
    }

    // 处理超时错误
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      Message.error({
        message: '请求超时，请检查网络连接',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }

    // 处理网络错误
    if (!error.response) {
      Message.error({
        message: '网络连接失败，请检查网络',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }

    // 根据HTTP状态码处理
    const status = error.response.status
    const message = error.response.data?.message || error.message

    switch (status) {
      case 400:
        Message.error({ message: `请求参数错误: ${message}`, duration: 5 * 1000 })
        break
      case 401:
        handleTokenExpired()
        break
      case 403:
        Message.error({ message: '拒绝访问', duration: 5 * 1000 })
        break
      case 404:
        Message.error({ message: '请求的资源不存在', duration: 5 * 1000 })
        // 清除 token 并跳转到登录页
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
        break
      case 500:
        Message.error({ message: '服务器内部错误', duration: 5 * 1000 })
        break
      case 502:
        Message.error({ message: '网关错误', duration: 5 * 1000 })
        break
      case 503:
        Message.error({ message: '服务不可用', duration: 5 * 1000 })
        break
      case 504:
        Message.error({ message: '网关超时', duration: 5 * 1000 })
        break
      default:
        Message.error({
          message: `请求失败: ${message}`,
          duration: 5 * 1000
        })
    }

    return Promise.reject(error)
  }
)

// 处理token过期
const handleTokenExpired = () => {
  MessageBox.confirm(
    '您的登录已过期，您可以取消停留在此页面，或重新登录',
    '确认登出',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.dispatch('user/resetToken').then(() => {
      location.reload()
    })
  })
}

// 封装请求方法（支持重试）
const requestWithRetry = async (config, retries = retryConfig.retries) => {
  try {
    return await service(config)
  } catch (error) {
    if (retries > 0 && retryConfig.shouldRetry(error)) {
      logger.warn(`请求失败，${retries}秒后重试...`)
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay))
      return requestWithRetry(config, retries - 1)
    }
    throw error
  }
}

/**
 * 解构多层包装的响应数据
 * 支持多种响应格式：
 * 1. { code: 200, data: {...} } - 标准格式
 * 2. { success: true, data: {...} } - 成功标志格式
 * 3. { result: {...} } - 结果格式
 * 4. { data: { code: 200, data: {...} } } - 双层包装格式
 * 5. { data: { success: true, data: {...} } } - 双层成功标志格式
 * 6. 直接返回数组或对象
 */
const unwrapResponse = (data) => {
  // 如果 data 本身就是数组或包含 code 的标准格式，直接返回
  if (Array.isArray(data) || (data && typeof data === 'object' && 'code' in data)) {
    return data
  }

  // 如果 data 有 data 属性且 data.data 是对象/数组
  if (data && typeof data === 'object' && data.data !== undefined) {
    // 检查外层是否有 success 或 code 标志
    if (data.success === true || data.code === 200 || data.code === 0) {
      // 如果内层 data 也是包装格式，继续解构
      if (data.data && typeof data.data === 'object') {
        // 如果内层 data 有 code 或 success，返回内层 data
        if ('code' in data.data || 'success' in data.data) {
          return data.data
        }
        // 否则返回内层 data
        return data.data
      }
    }
    // 如果没有成功标志，直接返回 data.data
    return data.data
  }

  // 如果有 result 属性
  if (data && typeof data === 'object' && data.result !== undefined) {
    return data.result
  }

  // 如果有 content 属性
  if (data && typeof data === 'object' && data.content !== undefined) {
    return data.content
  }

  // 如果有 body 属性
  if (data && typeof data === 'object' && data.body !== undefined) {
    return data.body
  }

  // 默认返回原始数据
  return data
}

// 将对象转换为 key=value 格式的查询字符串
const serializeParams = (params) => {
  if (!params) return ''
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

// 导出封装的方法
export const request = {
  get: (url, params, config = {}) => requestWithRetry({ ...config, method: 'get', url, params }),
  // key-value 格式的 GET 请求（参数拼接在 URL 后面）
  getKey: (url, params, config = {}) => {
    const queryString = serializeParams(params)
    const fullUrl = queryString ? `${url}?${queryString}` : url
    return requestWithRetry({ ...config, method: 'get', url: fullUrl })
  },
  post: (url, data, config = {}) => requestWithRetry({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => requestWithRetry({ ...config, method: 'put', url, data }),
  delete: (url, params, config = {}) => requestWithRetry({ ...config, method: 'delete', url, params }),
  patch: (url, data, config = {}) => requestWithRetry({ ...config, method: 'patch', url, data }),
  // 上传文件
  upload: (url, file, config = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestWithRetry({
      ...config,
      method: 'post',
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 下载文件
  download: (url, params, filename, config = {}) => {
    return requestWithRetry({
      ...config,
      method: 'get',
      url,
      params,
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      return response
    })
  }
}

export default service
