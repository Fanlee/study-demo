/*
 * @Author: lihuan
 * @Date: 2023-08-18 17:02:38
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-21 13:22:04
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

function hotPotato(elementsList, num) {
  const queue = new Queue()
  const elimitateList = []
  for (let i = 0; i < elementsList.length; i++) {
    queue.enqueue(elementsList[i])
  }
  console.log(queue)
  while (queue.size() > 1) {
    for (let i = 0; i < num; i++) {
      queue.enqueue(queue.dequeue())
    }

    elimitateList.push(queue.dequeue())
  }
  return {
    eliminated: elimitateList,
    winner: queue.dequeue(),
  }
}

const names = ['John', 'Jack', 'Camila', 'Ingrid', 'Carl']
const result = hotPotato(names, 2)
result.eliminated.forEach((name) => {
  console.log(`${name}在击鼓传花游戏中被淘汰。`)
})

console.log(`胜利者： ${result.winner}`)
