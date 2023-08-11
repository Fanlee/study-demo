/*
 * @Author: lihuan
 * @Date: 2023-08-09 17:35:16
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-11 17:18:12
 * @Description:
 */

const { reactive, effect } = VueReactivity

// 文本节点类型
const Text = Symbol()
// 注释节点类型
const Comment = Symbol()
// Fragment
const Fragment = Symbol()

function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') {
    return false
  }
  return key in el
}

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
    createText,
    setText,
  } = options

  function mountElement(vnode, container, anchor) {
    const el = (vnode.el = createElement(vnode.type))
    // 子节点是 文本
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
    insert(el, container, anchor)
  }

  function unmount(vnode) {
    if (vnode.type === Fragment) {
      vnode.children.forEach((child) => unmount(child))
      return
    }
    const parent = vnode.el.parentNode
    console.log('unmount')
    if (parent) {
      parent.removeChild(vnode.el)
    }
  }

  function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    const { type } = n2
    // 描述的是标签
    if (typeof type === 'string') {
      // oldnode不存在，执行挂载操作
      if (!n1) {
        mountElement(n2, container, anchor)
      } else {
        patchElement(n1, n2)
      }
    }
    // 文本类型
    else if (type === Text) {
      if (!n1) {
        const el = (n2.el = createText(n2.children))
        insert(el, container)
      } else {
        const el = (n2.el = n1.el)
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    }
    // Fragment
    else if (type === Fragment) {
      if (!n1) {
        n2.children.forEach((child) => patch(null, child, container))
      } else {
        patchChildren(n1, n2, container)
      }
    }
    // 描述的是组件
    else if (typeof type === 'object') {
      if (!n1) {
        mountComponent(n2, container, anchor)
      } else {
        patchComponent(n1, n2, anchor)
      }
    }
  }

  const queue = new Set()
  let isFlushing = false
  const p = Promise.resolve()

  function queueJob(job) {
    queue.add(job)
    if (!isFlushing) {
      isFlushing = true
      p.then(() => {
        queue.forEach((job) => job())
      }).finally(() => {
        isFlushing = false
        queue.clear = 0
      })
    }
  }

  function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const {
      render,
      data,
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,

      updated,
    } = componentOptions
    beforeCreate && beforeCreate()
    const state = reactive(data())
    const instance = {
      state,
      isMounted: false,
      subTree: null,
    }
    vnode.component = instance
    created && created.call(state)
    effect(
      () => {
        const subTree = render.call(state, state)
        if (!instance.isMounted) {
          beforeMount && beforeMount.call(state)
          patch(null, subTree, container, anchor)
          instance.isMounted = true
          mounted && mounted.call(state)
        } else {
          beforeUpdate && beforeUpdate.call(state)
          patch(instance.subTree, subTree, container, anchor)
          updated && updated.call(state)
        }
        instance.subTree = subTree
      },
      {
        scheduler: queueJob,
      }
    )
  }

  function patchElement(n1, n2) {
    const el = (n2.el = n1.el)
    const oldProps = n1.props
    const newProps = n2.props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }

    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }

    patchChildren(n1, n2, el)
  }

  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((child) => unmount(child))
      }

      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      patchKeyedChildren(n1, n2, container)
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((child) => unmount(child))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
      }
    }
  }

  // 简单diff算法
  function patchKeyedChildren1(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    let lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      const newVnode = newChildren[i]
      let j = 0
      let find = false
      for (j; j < oldChildren.length; j++) {
        const oldVnode = oldChildren[j]
        if (newVnode.key === oldVnode.key) {
          find = true
          patch(oldVnode, newVnode, container)
          if (j < lastIndex) {
            const prevNode = newChildren[i - 1]
            // prevNode不存在则代表第一个节点
            if (prevNode) {
              // 因为使用的是insertBefore的方式，所以需要取到nextSibling
              const anchor = prevNode.el.nextSibling
              insert(newVnode.el, container, anchor)
            }
          } else {
            lastIndex = j
          }
          break
        }
      }
      if (!find) {
        const prevNode = newChildren[i - 1]
        let anchor = null
        if (prevNode) {
          anchor = prevNode.el.nextSibling
        } else {
          anchor = container.firstChild
        }
        patch(null, newVnode, container, anchor)
      }
    }

    // 循环旧的节点，如果在新节点中不存在，则需要删除
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i]
      const has = newChildren.find((vnode) => vnode.key === oldVNode.key)
      if (!has) {
        unmount(oldVNode)
      }
    }

    // const oldLen = oldChildren.length
    // const newLen = newChidren.length
    // const commonLen = Math.min(oldLen, newLen)

    // for (let i = 0; i < commonLen; i++) {
    //   patch(oldChildren[i], newChidren[i], container)
    // }
    // // 需要新增节点
    // if (newLen > oldLen) {
    //   for (let i = commonLen; i < newLen; i++) {
    //     patch(null, newChidren[i], container)
    //   }
    // }
    // // 需要删除节点
    // else if (newLen < oldLen) {
    //   for (let i = commonLen; i < oldLen; i++) {
    //     unmount(oldChildren[i])
    //   }
    // }
  }

  // 双端diff算法
  function patchKeyedChildren(n1, n2, container) {
    if (Array.isArray(n1.children)) {
      const oldChildren = n1.children
      const newChildren = n2.children
      let oldStartIdx = 0
      let oldEndIdx = oldChildren.length - 1
      let newStartIdx = 0
      let newEndIdx = newChildren.length - 1
      let oldStartVNode = oldChildren[oldStartIdx]
      let oldEndVNode = oldChildren[oldEndIdx]
      let newStartVNode = newChildren[newStartIdx]
      let newEndVNode = newChildren[newEndIdx]
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!oldStartVNode) {
          oldStartVNode = oldChildren[++oldStartIdx]
        } else if (!oldEndVNode) {
          oldEndVNode = oldChildren[--oldEndIdx]
        } else if (oldStartVNode.key === newStartVNode.key) {
          patch(oldStartVNode, newStartVNode, container)
          oldStartVNode = oldChildren[++oldStartIdx]
          newStartVNode = newChildren[++newStartIdx]
        } else if (oldEndVNode.key === newEndVNode.key) {
          patch(oldEndVNode, newEndVNode, container)
          oldEndVNode = oldChildren[--oldEndIdx]
          newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
          patch(oldStartVNode, newEndVNode, container)
          insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
          oldStartVNode = oldChildren[++oldStartIdx]
          newEndVNode = newChildren[--newEndIdx]
        } else if (oldEndVNode.key === newStartVNode.key) {
          patch(oldEndVNode, newStartVNode, container)
          insert(oldEndVNode.el, container, oldStartVNode.el)
          oldEndVNode = oldChildren[--oldEndIdx]
          newStartVNode = newChildren[++newStartIdx]
        } else {
          // 拿新的头部节点去旧的节点里面查找
          const idxInOld = oldChildren.findIndex(
            (node) => node.key === newStartVNode.key
          )
          if (idxInOld > 0) {
            const vnodeToMove = oldChildren[idxInOld]
            patch(vnodeToMove, newStartVNode, container)
            insert(vnodeToMove.el, container, oldStartVNode.el)
            oldChildren[idxInOld] = undefined
          } else {
            patch(null, newStartVNode, container, oldStartVNode.el)
          }
          newStartVNode = newChildren[++newStartIdx]
        }
      }

      // 新增节点
      if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
        for (let i = newStartIdx; i <= newEndIdx; i++) {
          patch(null, newChildren[i], container, oldStartVNode.el)
        }
      }
      // 删除节点
      else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          unmount(oldChildren[i])
        }
      }
    } else {
      setElementText(container, '')
      n2.children.forEach((child) => patch(null, child, container))
    }
  }

  // 快速diff算法
  function patchKeyedChildren2(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    // 更新相同的前置节点
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container)
      j++
      oldVNode = oldChildren[j]
      newVNode = newChildren[j]
    }
    // 更新相同的后置节点
    let oldEnd = oldChildren.length - 1
    let newEnd = newChildren.length - 1
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]

    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container)
      oldEnd--
      newEnd--
      oldVNode = oldChildren[oldEnd]
      newVNode = newChildren[newEnd]
    }

    // 需要新增节点
    if (j > oldEnd && j <= newEnd) {
      const anchorIndex = newEnd + 1
      const anchor =
        anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor)
      }
    }
    // 需要删除节点
    else if (j > newEnd && j <= oldEnd) {
      while (j <= oldEnd) {
        unmount(oldChildren[j++])
      }
    }
    // 需要移动位置
    else {
      const count = newEnd - j + 1
      // source 数组将用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引
      const source = new Array(count)
      source.fill(-1)
      const oldStart = j
      const newStart = j
      let moved = false
      let pos = 0
      // 构建索引表
      const keyIndex = {}
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i
      }
      //代表更新过的节点数量
      let patched = 0
      for (let i = oldStart; i <= oldEnd; i++) {
        const oldVNode = oldChildren[i]
        if (patched <= count) {
          const k = keyIndex[oldVNode.key]
          if (typeof k !== undefined) {
            newVNode = newChildren[k]
            patch(oldVNode, newVNode, container)
            patched++
            source[k - newStart] = i
            if (k < pos) {
              moved = true
            } else {
              pos = k
            }
          } else {
            unmount(oldVNode)
          }
        } else {
          unmount(oldVNode)
        }
      }
      if (moved) {
      }
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }
    container._vnode = vnode
  }
  return {
    render,
  }
}

const renderer = createRenderer({
  //  创建元素
  createElement(tag) {
    console.log('create')
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps(el, key, prevValue, nextValue) {
    // 绑定事件
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      const name = key.slice(2).toLowerCase()
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            if (e.timeStamp < invoker.attached) return
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach((fn) => fn(e))
            } else {
              invoker.value(e)
            }
          }

          invoker.value = nextValue
          invoker.attached = performance.now()
          el.addEventListener(name, invoker)
        } else {
          invoker.value = nextValue
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker)
      }
    }
    // style也是类似，需要做特殊化处理
    else if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]

      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  },
  createText(text) {
    return document.createTextNode(text)
  },
  setText(el, text) {
    el.nodeValue = text
  },
})

const MyComponent = {
  name: 'MyComponent',
  data() {
    return {
      foo: 0,
    }
  },
  render(vm) {
    return {
      type: 'div',
      props: {
        onClick() {
          console.log(1, vm.foo)
          vm.foo++
        },
      },
      children: `文本 ${this.foo}`,
    }
  },
}

const CompVNode = {
  type: MyComponent,
}

renderer.render(CompVNode, document.getElementById('app'))
