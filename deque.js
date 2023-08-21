/*
 * @Author: lihuan
 * @Date: 2023-08-21 10:33:08
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-21 14:19:17
 * @Description: 双端队列
 */
class Deque {
  constructor() {
    this.items = {}
    this.count = 0
    this.lowestCount = 0
  }
  addFront(element) {
    if (this.isEmpty()) {
      this.addBack(element)
    } else if (this.lowestCount > 0) {
      this.lowestCount--
      this.items[this.lowestCount] = element
    } else {
      for (let i = this.count; i > 0; i--) {
        this.items[i] = this.items[i - 1]
      }
      this.count++
      this.lowestCount = 0
      this.items[0] = element
    }
  }
  addBack(element) {
    this.items[this.count] = element
    this.count++
  }
  removeFront() {
    if (this.isEmpty()) return
    const result = this.items[this.lowestCount]
    delete this.items[this.lowestCount]
    this.lowestCount++
    return result
  }
  removeBack() {
    if (this.isEmpty()) return
    this.count--
    const result = this.items[this.count]
    delete this.items[this.count]
    return result
  }
  peekFront() {
    if (this.isEmpty()) return
    return this.items[this.lowestCount]
  }
  peekBack() {
    if (this.isEmpty()) return
    return this.items[this.count - 1]
  }
  isEmpty() {
    return this.count - this.lowestCount === 0
  }
  size() {
    return this.count - this.lowestCount
  }
  clear() {
    this.items = {}
    this.count = 0
    this.lowestCount = 0
  }
}

function palindromeChecker(aString) {
  if (!(typeof aString === 'string' && aString)) {
    return false
  }
  const deque = new Deque()
  const lowerString = aString.toLocaleLowerCase().split(' ').join('')
  for (let i = 0; i < lowerString.length; i++) {
    deque.addBack(lowerString[i])
  }

  let isEqual = true,
    lastChar,
    firstChar

  while (deque.size() > 1 && isEqual) {
    lastChar = deque.removeBack()
    firstChar = deque.removeFront()
    if (lastChar !== firstChar) {
      isEqual = false
    }
  }

  return isEqual
}

console.log('a', palindromeChecker('a'))
console.log('aa', palindromeChecker('aa'))
console.log('kayak', palindromeChecker('kayak'))
console.log('level', palindromeChecker('level'))
console.log(
  'Was it a car or a cat I saw',
  palindromeChecker('Was it a car or a cat I saw')
)
console.log('Step on no pets', palindromeChecker('Step on no pets'))
