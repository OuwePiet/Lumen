/**
 * VIA Recognition launch gate.
 *
 * Keep OFF until VIA is genuinely ready for public launch and the recognition
 * criteria/source have been reviewed. The leaf must never appear merely
 * because someone is signed in, verified by DeSo, or manually styled.
 */
export const VIA_RECOGNITION_ENABLED = false

export function canShowViaRecognition(recognized: boolean) {
  return VIA_RECOGNITION_ENABLED && recognized
}
