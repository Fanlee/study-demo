/*
 * @Author: lihuan
 * @Date: 2023-08-21 14:29:37
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-24 15:17:38
 * @Description:
 */
export function defaultEquals(a, b) {
  return a === b
}

export const Compare = {
  LESS_THAN: 1,
  BIGGER_THAN: -1,
}

export function defaultCompare(a, b) {
  if (a === b) return 0
  return a < b ? Compare.LESS_THAN : Compare.BIGGER_THAN
}

export const BalanceFactor = {
  UNBALANCED_RIGHT: 1,
  SLIGHTLY_UNBALANCED_RIGHT: 2,
  BALANCED: 3,
  SLIGHTLY_UNBALANCED_LEFT: 4,
  UNBALANCED_LEFT: 5,
}
