const curry = f => (a, ..._) => !_.length ? (..._) => f(a, ..._) : f(a, ..._)
const curry2 = f => (a, b, ..._) => !_.length ? (..._) => f(a, b, ..._) : f(a, b, ..._)

const log = a => (console.log(a), a)
const identity = a => a
const push = (arr, v) => (arr.push(v), arr)
const pick = index => (...args) => args[index]
const copy = obj => Object.assign({}, obj)
const set = curry(([key, value], obj) => (obj[key] = value, obj))
const set2 = curry((obj, [key, value]) => (obj[key] = value, obj))

const hasIter = a => Boolean(a && a[Symbol.iterator])
const getIter = a => hasIter(a) ? a[Symbol.iterator]() : entries(a)

const values = function* (obj) { for (const value of obj) yield value }
const entries = function* (obj) { for (const key in obj) yield [key, obj[key]] }
const range = function *(num = Infinity) { for (let i = 0; i < num; i++) yield i }

const go = (...fs) => reduce((acc, f) => f(acc), fs)

const isPromise = a => a instanceof Promise
const then = (a, f) => isPromise(a) ? a.then(f) : f(a)

const reduce = curry(function(f, acc, coll) {
  if (arguments.length == 2) {
    const iter = getIter(acc)
    return reduce(f, iter.next().value, iter)
  }
  
  const iter = getIter(coll)
  return function recur() {
    let curIter, cur
    while (!(curIter = iter.next()).done) {
      cur = curIter.value
      acc = then(acc, acc => f(acc, cur))
      if (isPromise(acc)) return acc.then(recur)
    }
    return acc
  }()
})
const map = curry(function* (f, coll) { for (const cur of coll) yield f(cur) })
const each = curry(function (f, coll) { for (const cur of coll) f(cur); return coll })

const take = curry((num, coll) => {
  const result = []
  if(!num) return result

  const iter = getIter(coll)
  return function recur() {
    let curIter, cur
    while (!(curIter = iter.next()).done) {
      cur = curIter.value
      if (isPromise(cur))
        return cur.then(cur => push(result, cur).length == num ? result : recur())
      
      result.push(cur)
      if (result.length == num) return result
    }
    return result
  }()
})
const peel = take
const takeWhile = curry((f, coll) => {
  const result = []
  const iter = getIter(coll)
  return function recur() {
    for (const cur of iter) {
      const D = then(cur, f)  // 판별식(Discriminant)의 앞글자 "D"
      if(!D) break
      if(isPromise(D)) return D.then(async D => D ? push(result, await cur) && recur() : result)
      push(result, cur)
    }
    return result
  }()
})
const flat = function *(coll) {
  const iter = getIter(coll)
  for (const cur of iter) {
    if (hasIter(cur)) yield* flat(cur);
    else yield cur;
  }
};
