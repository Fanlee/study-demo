/*
 * @Author: lihuan
 * @Date: 2023-07-26 21:42:32
 * @LastEditors: lihuan
 * @LastEditTime: 2023-07-27 23:06:22
 * @Description:
 */

function Vue() {}

let uid = 0

class Dep {
  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  removeSub(sub) {
    remove(this.subs, sub)
  }

  depend() {
    console.log('depend')
    if (Dep.target) {
      // this.addSub(Dep.target)
      Dep.target.addDep(this)
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
function hasOwn(obj, key) {
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
        console.log('child')
        childOb.dep.depend()
      }
      return val
    },
    set: function (newVal) {
      console.log('set')
      if (val === newVal) {
        return
      }
      dep.notify() // 新增
      val = newVal
    },
  })
}

const seenObjects = new Set()
function traverse(val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    i = val.length
    while (i--) {
      _traverse(val[i], seen)
    }
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) {
      _traverse(val[keys[i]], seen)
    }
  }
}

class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    if (options) {
      this.deep = !!options.deep
    } else {
      this.deep = false
    }
    this.deps = []
    this.depIds = new Set()
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    this.cb = cb
    this.value = this.get()
  }

  get() {
    Dep.target = this
    let value = this.getter.call(this.vm, this.vm)
    if (this.deep) {
      traverse(value)
    }
    Dep.target = undefined
    return value
  }

  update() {
    const oldValue = this.value
    console.log('watcher.update')
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.add(dep)
      dep.addSub(this)
    }
  }
  teardown() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
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
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args)
      const ob = this.__ob__
      let inserted
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args
          break
        case 'splice':
          inserted = args.slice(2)
        default:
          break
      }
      if (inserted) {
        ob.observeArray(inserted)
      }
      ob.dep.notify()
      return result
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
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
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
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i])
    }
  }
}

Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this
  options = options || {}
  const watcher = new Watcher(vm, expOrFn, cb, options)
  if (options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn() {
    watcher.teardown()
  }
}

function set(target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }

  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }

  const ob = target.__ob__
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(target, key, val)
  ob.dep.notify()
  return val
}

function del(target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) return
  ob.dep.notify()
}

const obj = { a: 1 }
new Observer(obj)
console.log(obj)
