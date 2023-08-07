/*
 * @Author: lihuan
 * @Date: 2023-08-04 15:41:23
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-04 15:42:50
 * @Description:
 */
function callHook(vm, hook) {
  const hooks = vm.$options[hook]
  if (hooks) { 
    for (let h of hooks) { 
      h.call(vm)
    }
  }
}
