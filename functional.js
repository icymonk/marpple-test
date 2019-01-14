const log = a => (console.log(a), a)
const isPromise = a => a instanceof Promise
const curry = f => (a, ..._) => !_.length ? (..._) => f(a, ..._) : f(a, ..._)
const push = (arr, v) => (arr.push(v), arr)
const pick = index => (...args) => args[index]
const then = (a, f) => isPromise(a) ? a.then(f) : f(a)
const reduce = (f, arr, acc) => arr.reduce((acc, cur) => then(acc, acc => f(acc, cur)), acc)
const peel = arr => reduce((acc, cur) => then(cur, cur => push(acc, cur)), arr, [])

const concatBase = curry((arr, args) => Array.isArray(args) ? reduce(concat, args, arr) : push(arr, args))
const concat = (arr, args) => then(args, concatBase(arr))

const pipeline = (arg, ...fs) => reduce((acc, f) => f(acc), fs, arg)
const map = curry((f, arr) => reduce((acc, v) => push(acc, f(v)), arr, []))
const range = num => Array(num).fill().map(pick(1))
const flat = arr => reduce(concat, arr, [])

const take = curry((num, arr) => {
  const result = []
  arr.some((cur, i) => {
    if(i == num) return true
    result.push(cur)
  })
  return peel(result)
})
const takeWhile = curry((f, arr) => {
  const result = []
  const iter = arr[Symbol.iterator]()
  return function recur() {
    for (const cur of iter) {
      const pred = then(cur, f)
      if(!pred) break
      if(isPromise(pred)) return pred.then(async pred => pred ? push(result, await cur) && recur() : result)
      push(result, cur)
    }
    return result
  }()
})
