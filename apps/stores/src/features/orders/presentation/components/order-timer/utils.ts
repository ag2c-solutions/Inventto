export interface Countdown {
  remainingSeconds: number;
  label: string;
  urgent: boolean;
}

// RF035: countdown de expiração do Pool — vira urgente com menos de 3 min.
export function getCountdown(
  expiresAt: Date,
  now: Date = new Date()
): Countdown {
  const remainingMs = expiresAt.getTime() - now.getTime();
  const remainingSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return {
    remainingSeconds,
    label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    urgent: remainingSeconds < 180
  };
}
