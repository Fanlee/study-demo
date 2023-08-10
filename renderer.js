/*
 * @Author: lihuan
 * @Date: 2023-08-09 17:35:16
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-10 15:22:36
 * @Description:
 */

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

  function mountElement(vnode, container) {
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
    insert(el, container)
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

  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    const { type } = n2
    // 描述的是标签
    if (typeof type === 'string') {
      // oldnode不存在，执行挂载操作
      if (!n1) {
        mountElement(n2, container)
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
    }
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
      if (Array.isArray(n1.children)) {
        const oldChildren = n1.children
        const newChidren = n2.children
        const oldLen = oldChildren.length
        const newLen = newChidren.length
        const commonLen = Math.min(oldLen, newLen)

        for (let i = 0; i < commonLen; i++) {
          patch(oldChildren[i], newChidren[i], container)
        }
        // 需要新增节点
        if (newLen > oldLen) {
          for (let i = commonLen; i < newLen; i++) {
            patch(null, newChidren[i], container)
          }
        }
        // 需要删除节点
        else if (newLen < oldLen) {
          for (let i = commonLen; i < oldLen; i++) {
            unmount(oldChildren[i])
          }
        }
      } else {
        setElementText(container, '')
        n2.children.forEach((child) => patch(null, child, container))
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((child) => unmount(child))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
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

const vnode1 = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    // { type: 'p', children: '3' },
  ],
}

const vnode2 = {
  type: 'div',
  children: [
    { type: 'p', children: '4' },
    { type: 'p', children: '5' },
    { type: 'p', children: '6' },
  ],
}

renderer.render(vnode1, document.getElementById('app'))
console.log('///////////')
renderer.render(vnode2, document.getElementById('app'))
