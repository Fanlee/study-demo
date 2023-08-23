/*
 * @Author: lihuan
 * @Date: 2023-08-23 15:53:15
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-23 16:11:19
 * @Description:递归
 */
function factorial(number) {
  if (number === 1 || number === 0) return 1
  return number * factorial(number - 1)
}

function fibonacci(n) {
  if (n < 1) return 0
  if (n <= 2) return 1
  return fibonacci(n - 1) + fibonacci(n - 2)
}
console.log(fibonacci(5))
