/*
 * @Author: lihuan
 * @Date: 2023-08-09 17:35:16
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-09 17:50:43
 * @Description:
 */

function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode
  }
  return {
    render,
  }
}

function patch(n1, n2, container) {}
