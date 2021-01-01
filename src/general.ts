const emojis = {
  positive: '✅',
  negative: '❎',
  options: [
    '1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','0️⃣'
  ]
}

const colors = {
  default: '#cccccc'
}

interface LooseObject {
  [key: string]: any
}


export{
  emojis,
  colors,
  LooseObject
}