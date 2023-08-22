/*
 * @Author: lihuan
 * @Date: 2023-08-22 15:19:52
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-22 16:02:37
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
    return valuePair != null ?  valuePair.value: undefined
  }
  hasKey(key) {
    return this.table[this.toStrFn(key)] != null
  }
  remove(key) {
    if (this.hasKey(key)) {
      delete this.table[this.toStrFn(key)]
      return true
    }
    return false
  }
}
