import { onScopeDispose } from 'vue'
import { useHealthStore } from '../stores/useHealthStore'

/**
 * useHealthPoll — polls the health store on a fixed interval.
 *
 * Calls refresh() immediately on invocation, then repeats every `intervalMs`.
 * The interval is cleared in onScopeDispose (component/scope unmount) and
 * can also be stopped manually via the returned `stop` handle.
 *
 * @param intervalMs - Polling interval in milliseconds (default 30 000).
 * @returns          - `{ stop }` for manual teardown before scope disposal.
 */
export function useHealthPoll(intervalMs = 30_000): { stop: () => void } {
  const store = useHealthStore()

  // Fire immediately so the UI has data before the first interval fires.
  void store.refresh()

  const timerId = setInterval(() => {
    void store.refresh()
  }, intervalMs)

  function stop(): void {
    clearInterval(timerId)
  }

  onScopeDispose(stop)

  return { stop }
}
