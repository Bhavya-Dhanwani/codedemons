import axios, { type AxiosError, type AxiosProgressEvent } from 'axios'
import { api } from '../../../shared/api/api'
import type { Item } from '../config/resources'

type IKAuth = { token: string; expire: number; signature: string; publicKey: string; folder: string }

// ImageKit free plan caps; checked up front so the admin gets a clear message
const IK_MAX = { image: 25, video: 100 } // MB
const IK_UPLOAD = 'https://upload.imagekit.io/api/v1/files/upload'

/**
 * Every upload goes straight from the browser to ImageKit; our server only signs the request
 * (and refuses with a clear message when ImageKit isn't configured). Returns the file's CDN URL.
 */
async function upload(file: File, onProgress: (p: number) => void) {
  const ik = await api.get<IKAuth>('/admin/imagekit-auth')
  const onUploadProgress = (e: AxiosProgressEvent) => { if (e.total) onProgress(e.loaded / e.total) }
  const fd = new FormData()
  const kind = file.type.startsWith('video/') ? 'video' : 'image'
  if (file.size > IK_MAX[kind] * 1024 * 1024) throw new Error(`Too big: ${kind}s can be up to ${IK_MAX[kind]} MB on the ImageKit free plan. Compress it first.`)
  fd.append('fileName', file.name.replace(/[^\w.-]+/g, '-'))
  fd.append('folder', ik.folder)
  fd.append('useUniqueFileName', 'true')
  fd.append('publicKey', ik.publicKey)
  fd.append('signature', ik.signature)
  fd.append('expire', String(ik.expire))
  fd.append('token', ik.token)
  fd.append('file', file)
  try {
    // plain axios: ImageKit is not our API, so no envelope and no token
    return (await axios.post<{ url: string }>(IK_UPLOAD, fd, { onUploadProgress })).data.url
  } catch (e) {
    throw new Error((e as AxiosError<{ message?: string }>).response?.data?.message || 'Upload failed, check your connection')
  }
}

export const adminApi = {
  list: (path: string) => api.get<Item[]>(path),
  save: (path: string, id: string | undefined, body: object) => (id ? api.put(`${path}/${id}`, body) : api.post(path, body)),
  remove: (path: string, id: string) => api.del(`${path}/${id}`),
  reorder: (path: string, ids: string[]) => api.put(`${path}/order`, { ids }),
  upload,
}
