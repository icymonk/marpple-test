async function functionalTest() {
  const res1 = await go(
    range(100000),
    map(a => [Promise.resolve(a), a, [a, Promise.resolve(a), Promise.resolve(a)]]),
    flat,
    take(5),
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
  const status = {
    top: 200,
    right: 200,
    time: 2000,
    ratio: 0.85,
  }
  const applyRatio = (status) => status.time *= status.ratio
  const changeDirection = (status) => (status.top *= -1, status.right *= -1)
  const adjustRatio = (status, ratio = 0.85) => {
    status.ratio *= 1.01
    status.time > 2000 && (status.ratio = ratio)
  }
  const rectangle = $('#rectangle')

  await animation({ top: 50, right: 50 }, 0, rectangle)
  while(true) {
    await animation({ right: status.right }, status.time, rectangle)
    applyRatio(status)
    await animation({ top: status.top }, status.time, rectangle)
    applyRatio(status)
    changeDirection(status)
    adjustRatio(status)
  }
}