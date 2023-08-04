/*
 * @Author: lihuan
 * @Date: 2023-08-04 10:07:38
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-04 11:18:06
 * @Description:
 */
const callbacks = []
let pending = false
let useMacroTask = false

function flushCallbacks() {
  console.log('只调用了一次')
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let cb of copies) {
    cb()
  }
}

let microTimerFunc
let macroTimerFunc = function () {
  console.log('mrcro')
  setTimeout(flushCallbacks, 0)
}
const p = Promise.resolve()

microTimerFunc = () => {
  p.then(flushCallbacks)
}

function withMacroTask(fn) {
  return (
    fn._withTask ||
    (fn._withTask = function () {
      useMacroTask = true
      const res = fn.apply(null, arguments)
      useMacroTask = false
      return res
    })
  )
}

function nextTick(cb, ctx) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      cb.call(ctx)
    } else if (_resolve) {
      _resolve()
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  if (!cb && typeof Promise !== undefined) {
    return new Promise((resolve) => {
      _resolve = resolve
    })
  }
}

withMacroTask(() => {
  Promise.resolve().then(console.log(2))
  nextTick(() => {
    console.log('xx')
  })
})()

// nextTick(
//   function () {
//     console.log(this.name)
//   },
//   { name: 'zhangsan' }
// )
// nextTick(
//   function () {
//     console.log(this.name)
//   },
//   { name: 'zhangsan' }
// )
