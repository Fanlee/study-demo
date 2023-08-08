/*
 * @Author: lihuan
 * @Date: 2023-08-07 15:31:35
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-08 11:08:08
 * @Description:
 */
const data = {
  foo: 1,
  bar: 2,
}

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

const obj = new Proxy(data, {
  get(target, key) {
    // console.log('getter')
    track(target, key)
    // 返回属性值
    return target[key]
  },
  set(target, key, newVal) {
    // console.log('setter')
    target[key] = newVal
    trigger(target, key)
  },
})

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
function trigger(target, key) {
  let depsMap = bucket.get(target)
  if (!depsMap) return
  // 根据key获取所有副作用函数
  let effects = depsMap.get(key)
  const effectsToRun = new Set()
  effects &&
    effects.forEach((effectFn) => {
      if (activeEffect !== effectFn) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

const jobQueue = new Set()
const p = Promise.resolve()
let isFlushing = false
function flushJob() {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    jobQueue.forEach((job) => job())
  }).finally(() => {
    isFlushing = false
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

const res = computed(() => {
  return obj.foo + obj.bar
})

effect(() => {
  console.log(res.value)
})

obj.foo++
// console.log(res.value)
