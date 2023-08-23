/*
 * @Author: lihuan
 * @Date: 2023-08-23 10:35:48
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-23 17:10:18
 * @Description: 散列表
 */

import { LinkedList } from './linked-list.js'
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

export class HashTableSeparateChaining extends HashTable {
  constructor(toStrFn = defalutToString) {
    super(toStrFn)
    this.table = {}
  }
  put(key, value) {
    if (key != null && value != null) {
      const position = this.hashCode(key)
      if (this.table[position] == null) {
        this.table[position] = new LinkedList((a, b) => {
          return a === b.key
        })
      }
      this.table[position].push(new ValuePair(key, value))
      return true
    }
    return false
  }
  get(key) {
    const position = this.hashCode(key)
    const linkedList = this.table[position]
    if (linkedList) {
      let index = linkedList.indexOf(key)
      if (index >= 0) {
        let node = linkedList.getElementAt(index)
        return node.element.value
      }
    }
    return undefined
  }
  remove(key) {
    const position = this.hashCode(key)
    const linkedList = this.table[position]
    if (linkedList != null && !linkedList.isEmpty()) {
      let index = linkedList.indexOf(key)
      if (index >= 0) {
        linkedList.removeAt(index)
        return true
      }
    }
    return false
  }
}

class HashTableLinearProbing extends HashTable {
  constructor(toStrFn = defalutToString) {
    super(toStrFn)
    this.table = {}
  }
  put(key, value) {
    if (key != null && value != null) {
      const position = this.hashCode(key)
      if (this.table[position] == null) {
        this.table[position] = new ValuePair(key, value)
      } else {
        let index = position + 1
        while (this.table[index] != null) {
          index++
        }
        this.table[index] = new ValuePair(key, value)
      }
      return true
    }
    return false
  }
  get(key) {
    const position = this.hashCode(key)
    if (this.table[position] != null) {
      if (this.table[position].key === key) {
        return this.table[position].value
      }
      let index = position + 1
      while (this.table[index] != null && this.table[index].key !== key) {
        index++
      }
      if (this.table[index].key === key) {
        return this.table[index].value
      }
    }
    return undefined
  }
  remove(key) {
    const position = this.hashCode(key)
    if (this.table[position] != null) {
      if (this.table[position].key === key) {
        delete this.table[position]
        this.verifyRemoveSideEffect(key, position)
        return true
      }
      let index = position + 1
      while (this.table[index] != null && this.table[index].key !== key) {
        index++
      }
      if (this.table[index] != null && this.table[index].key === key) {
        delete this.table[index]
        this.verifyRemoveSideEffect(key, index)
        return true
      }
    }
    return false
  }
  verifyRemoveSideEffect(key, removedPosition) {
    const hash = this.hashCode(key)
    let index = removedPosition + 1
    while (this.table[index] != null) {
      const posHash = this.hashCode(this.table[index].key)
      if (posHash <= hash || posHash <= removedPosition) {
        this.table[removedPosition] = this.table[index]
        delete this.table[index]
        removedPosition = index
      }
      index++
    }
  }
}
