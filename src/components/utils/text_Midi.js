function textToMidi(text) {
    text="ho-la co-mo es-tan\nyo bien y tu\nyo tam-bien"
    const parts = text.split('\n')
    const result = parts.map(part=>part.split(/[\s-]+/))
    return result;
}

function anotherFunction(param) {
    console.log('Otro parámetro:', param);
}
export { textToMidi, anotherFunction };