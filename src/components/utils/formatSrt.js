export const formatSrtcolor = (data, color, delay = 0, anticipation_time = 1, maxVisibleSentences = 3, baseColor = 'white') => {
  // Primera pasada: ajustar todos los tiempos de las oraciones
  const processedData = data.map((item, index, array) => {
    const currentItem = {...item}
    // Ajustar el tiempo final de la oración actual con el tiempo inicial de la siguiente
    if (index < array.length - 1) {
      const nextItem = array[index + 1]
      const timeDiff = compareTimestamps(item.endTime, nextItem.startTime)
      if (timeDiff) {
        currentItem.endTime = nextItem.startTime
      }
    }
    return currentItem
  })

  // Segunda pasada: generar el contenido SRT
  let srtContent = ''
  let sequenceNumber = 1

  processedData.forEach((item, index) => {
    // Obtener las próximas oraciones (máximo maxVisibleSentences)
    const nextSentences = []
    let nextIndex = index + 1
    while (nextIndex < processedData.length && nextSentences.length < maxVisibleSentences - 1) {
      const nextItem = processedData[nextIndex]
      if (compareTimestamps(item.endTime, nextItem.startTime)) {
        nextSentences.push(nextItem.oracion)
      }
      nextIndex++
    }

    // Mostrar anticipación de la oración
    const sentenceStartTime = addDelay(item.startTime, delay - anticipation_time)
    const sentenceEndTime = addDelay(item.silabas[0].startTime, delay)
    const fullText = [
      baseColor !== 'white' ? `<font color='${baseColor}'>${item.oracion}</font>` : item.oracion,
      ...nextSentences.map(sent => baseColor !== 'white' ? `<font color='${baseColor}'>${sent}</font>` : sent)
    ].join('\n')
    srtContent += `${sequenceNumber++}\n${sentenceStartTime} --> ${sentenceEndTime}\n${fullText}\n\n`

    // Procesar sílabas con coloración progresiva
    item.silabas.forEach((silaba, silabaIndex) => {
      const startTime = addDelay(silaba.startTime, delay)
      const endTime = silabaIndex === item.silabas.length - 1 ? 
                     addDelay(item.endTime, delay) : 
                     addDelay(item.silabas[silabaIndex + 1].startTime, delay)
      
      // Construir el texto de la oración actual con colores
      let mainText = ''
      let acumulado = ''
      item.silabas.forEach((s, i) => {
        if (i <= silabaIndex) {
          acumulado += s.texto
          mainText += `<font color='${color}'>${s.texto}</font>`
        } else {
          mainText += baseColor !== 'white' ? 
            `<font color='${baseColor}'>${s.texto}</font>` : 
            s.texto
        }
      })

      // Combinar con las siguientes oraciones
      const combinedText = [
        mainText,
        ...nextSentences.map(sent => baseColor !== 'white' ? `<font color='${baseColor}'>${sent}</font>` : sent)
      ].join('\n')

      srtContent += `${sequenceNumber++}\n${startTime} --> ${endTime}\n${combinedText}\n\n`
    })
  })

  return srtContent
}

// Nueva función para comparar timestamps directamente
const compareTimestamps = (time1, time2) => {
  const [h1, m1, rest1] = time1.split(':')
  const [s1, ms1] = rest1.split(',')
  const [h2, m2, rest2] = time2.split(':')
  const [s2, ms2] = rest2.split(',')

  // Convertir todo a segundos para la comparación
  const seconds1 = parseInt(h1) * 3600 + parseInt(m1) * 60 + parseInt(s1)
  const seconds2 = parseInt(h2) * 3600 + parseInt(m2) * 60 + parseInt(s2)

  const secondsDiff = seconds2 - seconds1
  if (secondsDiff >10) {
    return false
  }

  return true
}


export const formatSrt = (data, delay = 0, baseColor = 'white') => {
  return data
    .map((item, index) => {
      const startTime = addDelay(item.startTime, delay)
      const endTime = addDelay(item.endTime, delay)
      const texto = baseColor !== 'white' ? 
        `<font color='${baseColor}'>${item.oracion}</font>` : 
        item.oracion
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

const addDelay = (timeStr, delaySeconds) => {
  const [hours, minutes, seconds] = timeStr.split(':')
  const [secs, ms] = seconds.split(',')

  let totalMs =
    (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs)) * 1000 + parseInt(ms)
  totalMs += delaySeconds * 1000

  const newHours = Math.floor(totalMs / (3600 * 1000))
  const newMinutes = Math.floor((totalMs % (3600 * 1000)) / (60 * 1000))
  const newSeconds = Math.floor((totalMs % (60 * 1000)) / 1000)
  const newMs = totalMs % 1000

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')},${String(newMs).padStart(3, '0')}`
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
