/*
 * @Author: lihuan
 * @Date: 2023-08-07 15:31:35
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-08 17:42:53
 * @Description:
 */

const ITERATE_KEY = Symbol()

// 存储副作用函数的桶
const bucket = new WeakMap()
//  全局变量存储注册的副作用函数
let activeEffect
const effectStack = []
// 用于注册副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    console.log('effect run')
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  // 存储与副作用函数相关的依赖集合
  effectFn.options = options
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach((method) => {
  const originMethod = Array.prototype[method]
  arrayInstrumentations[method] = function (...args) {
    let res = originMethod.apply(this, args)
    if (res === false || res === -1) {
      res = originMethod.apply(this.raw, args)
    }
    return res
  }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      if (isReadonly) {
        console.log(`属性${key}是只读的`)
        return true
      }
      const hasKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key)
      if (res && hasKey) {
        trigger(target, key, 'DELETE')
      }
      return res
    },
    get(target, key, receiver) {
      if (key === 'raw') {
        return target
      }

      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }

      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)

      if (isShallow) return res

      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    },
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.log(`属性${key}是只读的`)
        return true
      }
      const oldVal = target[key]
      const type = Array.isArray(target)
        ? Number(key) < target.length
          ? 'SET'
          : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key)
        ? 'SET'
        : 'ADD'
      const res = Reflect.set(target, key, newVal, receiver)
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal)
        }
      }

      return res
    },
  })
}

const reactiveMap = new Map()

function reactive(obj) {
  const existionProxy = reactiveMap.get(obj)
  if (existionProxy) return existionProxy
  const proxy = createReactive(obj)
  reactiveMap.set(obj, proxy)
  return proxy
}

function shallowReactive(obj) {
  return createReactive(obj, true)
}

function readonly(obj) {
  return createReactive(obj, false, true)
}

function shallowReadonly(obj) {
  return createReactive(obj, true, true)
}

// 追踪变化
function track(target, key) {
  if (!activeEffect) return target[key]
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

// 触发变化
function trigger(target, key, type, newVal) {
  let depsMap = bucket.get(target)
  if (!depsMap) return
  // 根据key获取所有副作用函数
  let effects = depsMap.get(key)
  const iterateEffects = depsMap.get(ITERATE_KEY)
  const effectsToRun = new Set()
  effects &&
    effects.forEach((effectFn) => {
      if (activeEffect !== effectFn) {
        effectsToRun.add(effectFn)
      }
    })

  if (type === 'ADD' || type === 'DELETE') {
    iterateEffects &&
      iterateEffects.forEach((effectFn) => {
        if (activeEffect !== effectFn) {
          effectsToRun.add(effectFn)
        }
      })
  }

  if (type === 'ADD' && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects &&
      lengthEffects.forEach((effectFn) => {
        if (activeEffect !== effectFn) {
          effectsToRun.add(effectFn)
        }
      })
  }

  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach((effectFn) => {
          if (activeEffect !== effectFn) {
            effectsToRun.add(effectFn)
          }
        })
      }
    })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

function computed(getter) {
  // 缓存上一次的值
  let value
  // 判断是否需要重新计算，为true的时候需要重新计算
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    },
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        // 下次直接访问缓存的值
        dirty = false
      }
      track(obj, 'value')
      return value
    },
  }
  return obj
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || seen === null || seen.has(value)) {
    return
  }
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen)
  }
  return value
}

function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  let oldValue, newValue
  let cleanup
  function onInvalidate(fn) {
    cleanup = fn
  }
  const job = () => {
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      if (options.flush === 'post') {
        Promise.resolve().then(job)
      } else {
        job()
      }
    },
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

const o = {}
const data = [o]

const arr = reactive(data)

effect(() => {
  console.log(arr.includes(o))
})
// arr[1] = 'baz'
// arr.length = 0
