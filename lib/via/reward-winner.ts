export type ViaRewardWinner = {
  publicKey: string
  awardedAt: string
  category: string
  rewardCents: number
}

export type ViaWinnerState = {
  current?: ViaRewardWinner
  history: ViaRewardWinner[]
}

export function rotateRewardWinner(
  state: ViaWinnerState,
  winner: ViaRewardWinner
): ViaWinnerState {
  const history = state.current
    ? [state.current, ...state.history].slice(0, 500)
    : state.history.slice(0, 500)

  return { current: winner, history }
}

export function currentWinnerBadge(state: ViaWinnerState, publicKey: string) {
  return state.current?.publicKey === publicKey ? "🏆" : undefined
}

/** Public presentation intentionally exposes no reward interval/cadence. */
export function rewardAnnouncement(winner: ViaRewardWinner, username: string) {
  return `🎁 VIA Surprise Reward · Congratulations @${username} 🏆 · $${(
    winner.rewardCents / 100
  ).toFixed(2)} awarded for meaningful community activity.`
}
