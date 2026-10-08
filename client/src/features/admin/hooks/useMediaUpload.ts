import { useRef, useState, type ChangeEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ik, isVideo } from '../../../shared/lib/media'
import { adminApi } from '../api/admin.api'

/** One media slot: preview, hidden file input, upload with progress. */
export function useMediaUpload(value: string, onChange: (url: string) => void) {
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const upload = useMutation({
    mutationFn: (f: File) => adminApi.upload(f, setProgress),
    onSuccess: onChange,
    onSettled: () => setProgress(null),
  })
  const video = !!value && isVideo(value)
  return {
    input,
    browse: () => input.current?.click(),
    onFile: (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      e.target.value = ''
      if (f) { setProgress(0); upload.mutate(f) }
    },
    clear: () => onChange(''),
    preview: value ? { video, src: ik(value, video ? 'w-640' : 'w-800') } : null,
    uploading: progress !== null,
    percent: Math.round((progress ?? 0) * 100),
    error: upload.error?.message,
  }
}
