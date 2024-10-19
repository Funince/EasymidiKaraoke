function textToMidi(text) {
  //text = 'ho-la co-mo es-tan\nyo bien y tu\nyo tam-bien'
  let parts = text.split('\n')
  let arr = parts.map((part) => {
    // Separar por espacios y guiones
    let words = part.split('-')
    return words
  })
  console.log(arr)
  const result = arr.map((subArr) =>
    subArr.flatMap((item) => {
      // Separar el elemento en partes y agregar un espacio a la primera sílaba
      const split = item.split(' ')

      // Agregar un espacio a todas excepto el ultimo
      return split.map((word, index) => (index === split.length - 1 ? word : word + ' '))
    })
  )

  return result
}

function anotherFunction(param) {
  console.log('Otro parámetro:', param)
}
export { textToMidi, anotherFunction }
