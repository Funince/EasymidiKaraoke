// formatAss.js
const formatAss = (data) => {
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
      const texto = silaba.replace(/\$/g, ' ' + '{\\k0}')
      return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${texto}`
    })
    .join('\n')

  return `${header}\n${events}`
}

export default formatAss
