async function functionalTest() {
  const res1 = await go(
    range(100000),
    map(a => [Promise.resolve(a), a, [a, Promise.resolve(a), Promise.resolve(a)]]),
    flat,
    take(5),
    log,
  )
  const res2 = await go(
    range(100000),
    map(a => Promise.resolve([a, a, [a, a, a]])),
    peel(5),
    flat,
    take(30),
  )
  const res3 = go(
    range(100000),
    map(a => [a, a, a]),
    flat,
    takeWhile(a => a < 5),
  )
  const res4 = await go(
    range(100000),
    map(a => Promise.resolve([a, a, a])),
    peel(10),
    flat,
    takeWhile(a => a < 6),
  )

  const logDiv = $('#log')
  const resultList = [res1, res2, res3, res4]
  resultList.forEach((result, i) => 
    go(
      result,
      log,
      () => logDiv.innerHTML += `<br>res${i + 1}: ${JSON.stringify(result, null, 4)}`))
}

async function spinRectangle() {
  const rectangle = $('#rectangle')
  animation({ top: 50, right: 50 }, 0, rectangle)
  let top = 200, right = 200, time = 2000, ratio = 0.1305
  while(time > 0.1) {
    await animation({ right, opacity: 1 }, time, rectangle)
    time *= ratio
    await animation({ top, opacity: -1 }, time, rectangle)
    top *= -1
    right *= -1
    time *= ratio
    ratio *= 1.01
    time > 2000 && (ratio = 0.85)
  }
}