/*
 * @Author: lihuan
 * @Date: 2023-08-16 10:05:21
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-18 13:26:38
 * @Description:
 */
function fetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('reject')
    }, 1000)
  })
}

function load(onError) {
  const p = fetch()
  return p.catch((err) => {
    return new Promise((resolve, reject) => {
      const retry = () => resolve(load(onError))
      const fail = () => reject(err)
      onError(retry, fail)
    })
  })
}

load((retry, fail) => {
  retry()
}).then((res) => console.log(res))
