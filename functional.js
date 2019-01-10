async function test() {
  /**
   * Collection 기반이 아닌 Array기반으로 직접적인 iterator 사용없이 구현해보려함
   */
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
  /**
   * 해당 문제에선 flat에서 Promise를 처리하고있어서 take와 takeWhile을 단순하게 만듬
   * 아래쪽에 Promise를 다루는 take2, takeWhile2 만듬
   */
  const take = curry((num, arr) => {
    const result = []
    for (let i = 0; i < num; i++) result.push(arr[i])
    return result
  })
  const takeWhile = curry((f, arr) => {
    let result = []
    for (let i = 0; f(arr[i]); i++) result.push(arr[i])
    return result
  })

  const logDiv = document.querySelector('#log')


  console.time('res1')
  const res1 = pipeline(
    range(100000),
    map(a => [a, a, a]),
    flat,
    take(8),
  )
  console.timeEnd('res1')

  console.time('res2')
  const res2 = await pipeline(
    range(100000),
    map(a => Promise.resolve([a, a, a])),
    flat,
    take(8),
  )
  console.timeEnd('res2')

  console.time('res3')
  const res3 = pipeline(
    range(100000),
    map(a => [a, a, a]),
    flat,
    takeWhile(a => a < 5),
  )
  console.timeEnd('res3')

  console.time('res4')
  const res4 = await pipeline(
    range(100000),
    map(a => Promise.resolve([a, a, a])),
    flat,
    takeWhile(a => a < 6),
  )
  console.timeEnd('res4')

  /**
   * Promise를 다루는 take와 takeWhile을 이터레이터와 재귀함수 없이 만들어보려했으나 비효율적이됨
   * Promise를 다루는 takeWhile은 재귀함수 없이 구현 실패
   */
  const take2 = curry((num, arr) => {
    const result = []
    arr.some((cur, i) => {
      if(i == num) return true
      result.push(cur)
    })
    return peel(result)
  })
  const takeWhile2 = curry((f, arr) => {
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

  console.time('res5')
  const res5 = await pipeline(
    range(100000),
    map(a => Promise.resolve(a)),
    take2(8),
  )
  console.timeEnd('res5')

  console.time('res6')
  const res6 = await pipeline(
    range(100000),
    map(a => Promise.resolve(a)),
    takeWhile2(a => a != 10),
  )
  console.timeEnd('res6')

  const resultList = [res1, res2, res3, res4, res5, res6]
  resultList.forEach((result, i) => pipeline(result, log, () => logDiv.innerHTML += `<br>res${i + 1}: ${JSON.stringify(result, null, 4)}`))
}


setTimeout(test, 1000)
