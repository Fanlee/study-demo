class Stack {
  constructor() {
    this.items = {}
    this.count = 0
  }
  push(element) {
    this.items[this.count] = element
    this.count++
  }
  pop() {
    if (this.isEmpty()) return
    this.count--
    const result = this.items[this.count]
    delete this.items[this.count]
    return result
  }
  peek() {
    if (this.isEmpty()) return
    return this.items[--this.count]
  }
  size() {
    return this.count
  }
  isEmpty() {
    return this.count === 0
  }
  clear() {
    this.items = {}
    this.count = 0
  }
  toString() {
    if (this.isEmpty()) return ''
    let objString = `${this.items[0]}`
    for (let i = 1; i < this.count; i++) {
      objString = `${objString}, ${this.items[i]}`
    }
    return objString
  }
}

function baseConverter(decNumber, base) {
  const stack = new Stack()
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let number = decNumber
  let rem
  let binaryString = ''

  if (base <= 2 && base >= 36) {
    return ''
  }

  while (number > 0) {
    rem = Math.floor(number % base)
    stack.push(rem)
    number = Math.floor(number / base)
  }
  while (!stack.isEmpty()) {
    binaryString += digits[stack.pop()]
  }
  return binaryString
}

console.log(baseConverter(10, 16))
