/*
 * @Author: lihuan
 * @Date: 2023-08-03 17:13:07
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-03 17:52:37
 * @Description:
 */
function Vue() {
  this._events = Object.create(null)
}

Vue.prototype.$on = function (event, fn) {
  const vm = this
  if (Array.isArray(event)) {
    for (let ev of event) {
      vm.$on(ev, fn)
    }
  } else {
    ;(vm._events[event] || (vm._events[event] = [])).push(fn)
  }
  return vm
}

Vue.prototype.$off = function (event, fn) {
  const vm = this
  if (!arguments.length) {
    vm._events = Object.create(null)
    return vm
  }

  if (Array.isArray(event)) {
    for (let ev of event) {
      vm.$off(ev, fn)
    }
    return vm
  }

  const cbs = vm._events[event]
  if (!cbs) {
    return vm
  }

  if (arguments.length === 1) {
    vm._events[event] = null
    return vm
  }

  if (fn) {
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn) {
        cbs.splice(i, 1)
        break
      }
    }
  }

  return vm
}

Vue.prototype.$once = function (event, fn) {
  const vm = this

  function on() {
    vm.$off(event, on)
    fn.call(vm, arguments)
  }

  vm.$on(event, on)
  return vm
}

Vue.prototype.$emit = function (event, ...args) {
  const vm = this
  const cbs = vm._events[event]
  for (let cb of cbs) {
    cb.apply(vm, args)
  }
}

const vm = new Vue()
console.log(vm)

// vm.$on(['update', 'delete'], () => {
//   console.log('update')
// })

// console.log(vm)
