/**
 * @file getErrorMessage
 * @description Extract a readable message from a fetch/API error.
 *
 * @status None
 * @issues None
 * @todo None
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string } }).data
    if (data?.statusMessage) {
      return data.statusMessage
    }
  }
  return 'خطایی رخ داد. دوباره تلاش کنید.'
}
