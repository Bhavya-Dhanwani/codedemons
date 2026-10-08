import { api } from '../../../shared/api/api'
import type { Project } from '../../../shared/types/content'

export const workApi = {
  projects: () => api.get<Project[]>('/projects'),
}
