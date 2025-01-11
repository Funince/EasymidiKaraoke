export function convertirTicksATiempo(ticks, usporquarter, ticksPorNegra) {
  const tiempoMs = (ticks * usporquarter) / ticksPorNegra / 1000
  const totalSeconds = Math.floor(tiempoMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor(tiempoMs % 1000)

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')
  const formattedMilliseconds = String(milliseconds).padStart(3, '0')

  return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
}

export function convertirATiempo(cont, usporquarter) {
  const t = (cont * usporquarter) / 1000000
  const totalSeconds = Math.floor(t)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((t - totalSeconds) * 1000)

  return `${minutes}:${seconds}.${milliseconds}`
}
