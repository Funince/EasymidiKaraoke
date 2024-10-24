// Función para formatear los datos en formato SRT
export const formatSrtcolor = (data, color) => {
  let srtContent = ''

  data.forEach((item, index) => {
    item.silabas.forEach((silaba, silabaIndex) => {
      const startTime = silaba.startTime
      const endTime = silaba.endTime
      const oracion = item.oracion
      let texto = item.silabas
        .map((s, i) => (i <= silabaIndex ? `<font color='${color}'>${s.texto}</font>` : s.texto))
        .join('')
      texto = texto.replace(/\$/g, ' ') // Reemplazar $ por espacios
      srtContent += `${index * item.silabas.length + silabaIndex + 1}\n${startTime} --> ${endTime}\n${texto}\n\n`
      //srtContent += `${index * item.silabas.length + silabaIndex + 1}\n${startTime} --> ${endTime}\n${oracion}\n${texto}\n\n`
    })
  })

  return srtContent
}

export const formatSrt = (data) => {
  return data
    .map((item, index) => {
      const startTime = item.startTime
      const endTime = item.endTime
      console.log('texto:', item.silabas)
      const texto = item.oracion // Reemplazar $ por espacios
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
export const agruparSilabasSrt = (data, grupos, usporquarter, ticksPorNegra) => {
  let agrupado = []
  let index = 0

  grupos.forEach((grupo) => {
    let startTime = data[index][1]
    let endTime = data[index + grupo.length - 1][2]
    let silabas = grupo.map((silaba, i) => ({
      texto: silaba,
      startTime: convertirTicksATiempo(data[index + i][1], usporquarter, ticksPorNegra),
      endTime: convertirTicksATiempo(data[index + i][2], usporquarter, ticksPorNegra)
    }))

    agrupado.push({
      oracion: grupo.join(''),
      silabas: silabas,
      startTime: convertirTicksATiempo(startTime, usporquarter, ticksPorNegra),
      endTime: convertirTicksATiempo(endTime, usporquarter, ticksPorNegra)
    })

    index += grupo.length
  })

  return agrupado
}

// Función para convertir ticks a tiempo (debes definir esta función según tu lógica)
