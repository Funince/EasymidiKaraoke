// formatAss.js
const addDelay = (timeStr, delaySeconds) => {
  const [hours, minutes, seconds] = timeStr.split(':')
  const [secs, ms] = seconds.split(',')

  let totalMs =
    (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs)) * 1000 + parseInt(ms)
  totalMs += delaySeconds * 1000

  const newHours = Math.floor(totalMs / (3600 * 1000))
  const newMinutes = Math.floor((totalMs % (3600 * 1000)) / (60 * 1000))
  const newSeconds = Math.floor((totalMs % (60 * 1000)) / 1000)
  const newMs = Math.floor(totalMs % 1000)

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}.${String(newMs).padStart(2, '0')}`
}

const formatAss = (data, delay = 0) => {
  const header = `[Script Info]
Title: Exported Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`

  const events = data
    .map(({ silaba, startTime, endTime }) => {
      const adjustedStart = addDelay(startTime, delay)
      const adjustedEnd = addDelay(endTime, delay)
      const texto = silaba.replace(/\$/g, ' ' + '{\\k0}')
      return `Dialogue: 0,${adjustedStart},${adjustedEnd},Default,,0,0,0,,${texto}`
    })
    .join('\n')

  return `${header}\n${events}`
}

export default formatAss
