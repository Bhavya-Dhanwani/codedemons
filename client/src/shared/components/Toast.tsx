import { useToastMessage } from '../hooks/useToast'

export function Toast() {
  const msg = useToastMessage()
  return <div className={'ad-toast' + (msg ? ' on' : '')} role="status">{msg}</div>
}
