/*
 * @Author: lihuan
 * @Date: 2023-07-26 21:42:32
 * @LastEditors: lihuan
 * @LastEditTime: 2023-07-26 23:04:34
 * @Description:
 */

let vm = {}

class Dep {
  constructor() {
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  removeSub(sub) {
    remove(this.subs, sub)
  }

  depend() {
    if (window.target) {
      this.addSub(window.target)
    }
  }

  notify() {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

function defineReactive(data, key, val) {
  if (typeof val === 'object') {
    new Observer(val)
  }
  let dep = new Dep() // 修改
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend() // 修改
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      dep.notify() // 新增
    },
  })
}

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    // 执行this.getter()，就可以读取data.a.b.c的内容
    this.getter = parsePath(expOrFn)
    this.cb = cb
    this.value = this.get()
  }

  get() {
    window.target = this
    let value = this.getter.call(this.vm, this.vm)
    window.target = undefined
    return value
  }

  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

const bailRE = /[^\w.$]/
function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}

class Observer {
  constructor(value) {
    this.value = value
    if (!Array.isArray(value)) {
      this.walk(value)
    }
  }
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(
  function (method) {
    const original = arrayProto[method]
    Object.defineProperty(arrayMethods, method, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function mutator(...args) {
        console.log(args)
        return original.apply(this, args)
      },
    })
  }
)

Array.prototype = {}
console.log(Array.prototype)
let arr = []

console.log(arr.push(1))
