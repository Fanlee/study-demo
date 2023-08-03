/*
 * @Author: lihuan
 * @Date: 2023-08-03 14:29:31
 * @LastEditors: lihuan
 * @LastEditTime: 2023-08-03 15:29:46
 * @Description:
 */

let currentParent

// function createASTElement(tag, attrs, parent) {
//   return {
//     type: 1,
//     tag,
//     attrsList: attrs,
//     parent,
//     children: [],
//   }
// }

// parseHTML(template, {
//   start(tag, attrs, unary) {
//     let element = createASTElement(tag, attrs, currentParent)
//   },
//   end() {},
//   charts(text) {
//     let element = { type: 3, text }
//   },
//   comment(text) {
//     let element = { type: 3, text, isComment: true }
//   },
// })

var ncname = '[a-zA-Z_][\\w\\-\\.]*'
var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
var startTagOpen = new RegExp('^<' + qnameCapture)

console.log(`<a`.match(startTagOpen))
