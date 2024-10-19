// Función para formatear los datos en formato SRT
export const formatSrt = (data) => {
  return data
    .map((item, index) => {
      const startTime = item.startTime
      const endTime = item.endTime
      const texto = item.silaba.replace(/\$/g, ' ')
      return `${index + 1}\n${startTime} --> ${endTime}\n${texto}\n`
    })
    .join('\n')
}

// Función para formatear el tiempo en formato SRT (hh:mm:ss,ms)
const convertirTicksATiempo = (ticks, usporquarter, ticksPorNegra) => {
  const tiempoMs = (ticks * usporquarter) / ticksPorNegra / 1000
  const totalSeconds = Math.floor(tiempoMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor(tiempoMs % 1000)

  const hours = Math.floor(totalSeconds / 3600)

  // Asegúrate de que los valores estén formateados correctamente
  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')
  const formattedMilliseconds = String(milliseconds).padStart(3, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds},${formattedMilliseconds}`
}

// Función para agrupar las sílabas para el formato SRT
export const agruparSilabasSrt = (data, grupos, usporquarter, pasoGrilla) => {
  let agrupado = []
  let index = 0

  grupos.forEach((grupo) => {
    let startTime = data[index][1]
    let endTime = data[index + grupo.length - 1][2]
    let silabas = grupo.map((silaba) => silaba).join('')

    agrupado.push({
      silaba: silabas,
      startTime: convertirTicksATiempo(startTime, usporquarter, pasoGrilla),
      endTime: convertirTicksATiempo(endTime, usporquarter, pasoGrilla)
    })

    index += grupo.length
  })

  return agrupado
}

// Función para convertir ticks a tiempo (debes definir esta función según tu lógica)
