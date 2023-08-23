/*
 * @Author: lihuan
 * @Date: 2023-08-22 15:19:52
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-23 10:22:22
 * @Description:
 */

function defalutToString(item) {
  if (item === null) {
    return 'NULL'
  } else if (item === undefined) {
    return 'UNDEFINED'
  } else if (typeof item === 'string' || item instanceof String) {
    return `${item}`
  }
  return item.toString()
}

class ValuePair {
  constructor(key, value) {
    this.key = key
    this.value = value
  }
  toString() {
    return `[#${this.key}: ${this.value}]`
  }
}

class Dictionary {
  constructor(toStrFn = defalutToString) {
    this.toStrFn = toStrFn
    this.table = {}
  }
  set(key, value) {
    if (key != null && value != null) {
      const tabKey = this.toStrFn(key)
      this.table[tabKey] = new ValuePair(key, value)
      return true
    }
    return false
  }
  get(key) {
    const valuePair = this.table[this.toStrFn(key)]
    return valuePair != null ? valuePair.value : undefined
  }
  hasKey(key) {
    return this.table[this.toStrFn(key)] != null
  }
  keyValues() {
    return Object.values(this.table)
  }
  keys() {
    return this.keyValues().map((valuePair) => valuePair.key)
  }
  values() {
    return this.keyValues().map((valuePair) => valuePair.value)
  }
  forEach(callback) {
    const keyValues = this.keyValues()
    for (let i = 0; i < keyValues.length; i++) {
      const valuePair = keyValues[i]
      const result = callback(valuePair.key, valuePair.value)
      if (result === false) {
        break
      }
    }
  }
  remove(key) {
    if (this.hasKey(key)) {
      delete this.table[this.toStrFn(key)]
      return true
    }
    return false
  }
  size() {
    return Object.keys(this.table).length
  }
  isEmpty() {
    return this.size() === 0
  }
  clear() {
    this.table = {}
  }
  toString() {
    if (this.isEmpty()) return ''
    const valuePairs = this.keyValues()
    let objString = `${valuePairs[0].toString()}`
    for (let i = 1; i < valuePairs.length; i++) {
      objString = `${objString}, ${valuePairs[i].toString()}`
    }
    return objString
  }
}

const dictionary = new Dictionary()
dictionary.set('Gandalf', 'gandalf@email.com')
dictionary.set('John', 'johnsnow@email.com')
dictionary.set('Tyrion', 'tyrion@email.com')
console.log(dictionary)
console.log(dictionary.size())
console.log(dictionary.hasKey('Gandalf'))
console.log(dictionary.keys())
console.log(dictionary.values())
console.log(dictionary.get('Tyrion'))
dictionary.remove('John')
console.log(dictionary)
console.log(dictionary.keys())
console.log(dictionary.values())
console.log(dictionary.keyValues())
// dictionary.forEach((k, v) => {
//   console.log('forEach: ', `key: ${k}, value: ${v}`)
//   if (k === 'Gandalf') return false
// })
console.log(dictionary.toString())
