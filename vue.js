/*
 * @Author: lihuan
 * @Date: 2023-07-26 21:42:32
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-02 16:58:42
 * @Description:
 */

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
    if (Dep.target) {
      this.addSub(Dep.target)
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

function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn(ob, key) {
  return hasOwnProperty.call(obj, key)
}

function observe(value) {
  if (!isObject(value)) {
    return
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

function defineReactive(data, key, val) {
  let childOb = observe(val)
  let dep = new Dep() // 修改
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend() // 修改
      if (childOb) {
        childOb.dep.depend()
      }
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return
      }
      dep.notify() // 新增
      val = newVal
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
    Dep.target = this
    let value = this.getter.call(this.vm, this.vm)
    Dep.target = undefined
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

const hasProto = '__proto__' in Object
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

function protoAugment(target, src, keys) {
  target.__proto__ = src
}

function copyAugment(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    def(target, key, src[key])
  }
}

function def(obj, key, val) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: val,
  })
}

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
    } else {
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

let arr = []
new Observer(arr)
console.log(arr.push(2))
