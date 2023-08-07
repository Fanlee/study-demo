/*
 * @Author: lihuan
 * @Date: 2023-08-07 15:31:35
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-07 17:57:19
 * @Description:
 */
const data = {
  ok: true,
  text: 'hello',
}

// 存储副作用函数的桶
const bucket = new WeakMap()
//  全局变量存储注册的副作用函数
let activeEffect
// 用于注册副作用函数
function effect(fn) {
  activeEffect = fn
  fn()
}

const obj = new Proxy(data, {
  get(target, key) {
    console.log('getter')
    track(target, key)
    // 返回属性值
    return target[key]
  },
  set(target, key, newVal) {
    console.log('setter')
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
}

// 触发变化
function trigger(target, key) {
  let depsMap = bucket.get(target)
  if (!depsMap) return
  // 根据key获取所有副作用函数
  let effects = depsMap.get(key)
  effects && effects.forEach((fn) => fn())
}

effect(() => {
  console.log('effect run')
  document.body.innerHTML = obj.ok ? obj.text : 'not'
})

// obj.ok = false
// console.log(data)
