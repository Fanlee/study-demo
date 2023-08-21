/*
 * @Author: lihuan
 * @Date: 2023-08-18 17:02:38
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-21 10:28:17
 * @Description:
 */
class Queue {
  constructor() {
    this.count = 0
    this.lowestCount = 0
    this.items = {}
  }
  enqueue(element) {
    this.items[this.count] = element
    this.count++
  }
  dequeue() {
    if (this.isEmpty()) return
    const result = this.items[this.lowestCount]
    delete this.items[this.lowestCount]
    this.lowestCount++
    return result
  }
  peek() {
    if (this.isEmpty()) return
    return this.items[this.lowestCount]
  }
  isEmpty() {
    return this.count - this.lowestCount === 0
  }
  size() {
    return this.count - this.lowestCount
  }
  clear() {
    this.count = this.lowestCount = 0
    this.items = {}
  }
  toString() {
    if (this.isEmpty()) return
    let objString = `${this.items[this.lowestCount]}`
    for (let i = this.lowestCount + 1; i < this.count; i++) {
      objString = `${objString}, ${this.items[i]}`
    }
    return objString
  }
}

const queue = new Queue()
queue.enqueue(1)
queue.enqueue(2)
queue.enqueue(3)
queue.enqueue(4)
queue.enqueue(5)
queue.enqueue(6)
queue.enqueue(7)
console.log(queue)
queue.dequeue()
queue.dequeue()
queue.dequeue()
console.log(queue)
console.log(queue.toString())
console.log(queue.size())
console.log(queue.clear())
console.log(queue.isEmpty())
