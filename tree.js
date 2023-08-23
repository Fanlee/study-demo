/*
 * @Author: lihuan
 * @Date: 2023-08-23 16:43:51
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-23 17:10:44
 * @Description: 树
 */
import { Compare, defaultCompare } from './util.js'

class Node {
  constructor(key) {
    this.key = key
    this.left = null
    this.right = null
  }
}

export class BinarySearchTree {
  constructor(compareFn = defaultCompare) {
    this.compareFn = compareFn
    this.root = null
  }
  insert(key) {
    if (this.root == null) {
      this.root = new Node(key)
    } else {
      this.insertNode(this.root, key)
    }
  }
  insertNode(node, key) {
    // 插入节点小于当前节点，则插入到左边
    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      if (node.left == null) {
        node.left = new Node(key)
      } else {
        this.insertNode(node.left, key)
      }
    } else {
      if (node.right == null) {
        node.right = new Node(key)
      } else {
        this.insertNode(node.right, key)
      }
    }
  }
}

const tree = new BinarySearchTree()
tree.insert(11)

tree.insert(7)
tree.insert(15)
tree.insert(5)
tree.insert(3)
tree.insert(9)
tree.insert(8)
tree.insert(10)
tree.insert(13)
tree.insert(12)
tree.insert(14)
tree.insert(20)
tree.insert(18)
tree.insert(25)
console.log(tree)
