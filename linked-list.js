/*
 * @Author: lihuan
 * @Date: 2023-08-21 14:30:37
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-21 16:44:27
 * @Description: 链表
 */

const { defaultEquals } = require('./util')

class Node {
  constructor(element) {
    this.element = element
    this.next = undefined
  }
}

class LinkedList {
  constructor(equalsFn = defaultEquals) {
    this.count = 0
    this.head = null
    this.equalsFn = equalsFn
  }
  push(element) {
    const node = new Node(element)
    let current
    if (this.head == null) {
      this.head = node
    } else {
      current = this.head
      while (current.next != null) {
        current = current.next
      }
      current.next = node
    }
    this.count++
  }
  insert(element, index) {
    if (index >= 0 && index <= this.count) {
      const node = new Node(element)
      if (index === 0) {
        let current = this.head
        node.next = current
        this.head = node
      } else {
        let previous = this.getElementAt(index - 1)
        const current = previous.next
        node.next = current
        previous.next = node
      }
      this.count++
      return true
    }
    return false
  }
  getElementAt(index) {
    if (index >= 0 && index <= this.count) {
      let current = this.head
      for (let i = 0; i < index && current != null; i++) {
        current = current.next
      }
      return current
    }
    return undefined
  }
  remove(element) {
    const index = this.indexOf(element)
    return this.removeAt(index)
  }
  indexOf(element) {
    let current = this.head
    for (let i = 0; i < this.count && current != null; i++) {
      if (this.equalsFn(element, current.element)) {
        return i
      }
      current = current.next()
    }
    return -1
  }
  removeAt(index) {
    if (index >= 0 && index < this.count) {
      let current = this.head
      if (index === 0) {
        this.head = current.next
      } else {
        let previous = this.getElementAt(index - 1)
        current = previous.next
        previous.next = current.next
      }
      this.count--
      return current.element
    } else {
      return undefined
    }
  }
  getHead() {
    return this.head
  }
  isEmpty() {
    return this.size() === 0
  }
  size() {
    return this.count
  }
  toString() {
    if (this.head == null) return ''
    let str = `${this.head.element}`
    let current = this.head.next
    for (let i = 0; i < this.size() && current != null; i++) {
      str = `${str}, ${current.element}`
      current = current.next
    }
    return str
  }
}

const list = new LinkedList()
list.push(1)
list.push(2)
list.push(3)
console.log(list.toString())
