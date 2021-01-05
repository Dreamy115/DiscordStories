const emojis = {
  positive: '✅',
  negative: '❎',
  lock: '🔒',
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

function replaceAll(str:string, find:string, replace:string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export{
  emojis,
  colors,
  LooseObject,
  replaceAll,
  escapeRegExp
}