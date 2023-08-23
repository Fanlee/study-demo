/*
 * @Author: lihuan
 * @Date: 2023-08-23 10:35:48
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-23 14:07:37
 * @Description: 散列表
 */

import { LinkedList } from './linked-list.js'
console.log(LinkedList)
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

class HashTable {
  constructor(toStrFn = defalutToString) {
    this.toStrFn = toStrFn
    this.table = {}
  }
  put(key, value) {
    if (key != null && value != null) {
      const position = this.hashCode(key)
      this.table[position] = new ValuePair(key, value)
      return true
    }
    return false
  }
  get(key) {
    const position = this.hashCode(key)
    const valuePair = this.table[position]
    return valuePair ? valuePair.value : undefined
  }
  remove(key) {
    const hash = this.hashCode(key)
    const valuePair = this.table[hash]
    if (valuePair != null) {
      delete this.table[hash]
      return true
    }
    return false
  }
  isEmpty() {
    return Object.keys(this.table).length === 0
  }
  loseloseHashCode(key) {
    if (typeof key === 'number') return key
    const tabKey = this.toStrFn(key)
    let hash = 0
    for (let i = 0; i < tabKey.length; i++) {
      hash += tabKey.charCodeAt(i)
    }
    return hash % 37
  }
  hashCode(key) {
    return this.loseloseHashCode(key)
  }
  toString() {
    if (this.isEmpty()) {
      return ''
    }
    const keys = Object.keys(this.table)
    let objString = `{${keys[0]} => ${this.table[keys[0]].toString()}}`
    for (let i = 1; i < keys.length; i++) {
      objString = `${objString}, {${keys[i]} =>  ${
        this.table[keys[i].toString()]
      }}`
    }
    return objString
  }
}

const hash = new HashTable()
hash.put('Ygritte', 'ygritte@email.com')
hash.put('Jonathan', 'jonathan@email.com')
hash.put('Jamie', 'jamie@email.com')
hash.put('Jack', 'jack@email.com')
hash.put('Jasmine', 'jasmine@email.com')
hash.put('Jake', 'jake@email.com')
hash.put('Nathan', 'nathan@email.com')
hash.put('Athelstan', 'athelstan@email.com')
hash.put('Sue', 'sue@email.com')
hash.put('Aethelwulf', 'aethelwulf@email.com')
hash.put('Sargeras', 'sargeras@email.com')

console.log(hash.toString())
