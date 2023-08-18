/*
 * @Author: lihuan
 * @Date: 2023-08-18 15:16:18
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-18 15:30:36
 * @Description:
 */
class Stack {
  constructor() {
    this.items = []
  }
  push(element) {
    this.items.push(element)
  }
  pop() {
    this.items.pop()
  }
  peek() {
    return this.items[this.items.length - 1]
  }
  isEmpty() {
    return this.items.length === 0
  }
  size() {
    return this.items.length
  }
  clear() {
    this.items.length = 0
  }
}

const stack = new Stack()
console.log(stack.size())
stack.push(2)
stack.push(8)
console.log(stack.size())
console.log(stack.peek())
stack.clear()
console.log(stack.size())
console.log(stack.isEmpty())
