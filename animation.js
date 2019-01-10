async function testAnimation() {
  function $(sel, parent = document) { return parent.querySelector(sel) }

  let count = 0
  async function animation(options = {}, duration, element) {
    if(duration == 0) {
      for (const key in options) {
        element.style[key] = `${options[key]}px`
      }
      return
    }
    const pxList = [
      'left',
      'top',
      'right',
      'bottom',
    ]
    let prevStyle = Object.assign({}, element.style)
    const maxCount = Math.ceil(duration / 17)
    return new Promise(resolve => {
      const step = (timestamp) => {
        if(count <= maxCount) {
          for (const key in options) {
            const value = parseFloat(prevStyle[key] || 0) + (options[key] / maxCount) * count
            element.style[key] = pxList.indexOf(key) != -1 ? `${value}px` : value
          }
          count++
          return requestAnimationFrame(step)
        } else {
          prevStyle = Object.assign({}, element.style)
          count = 0
          resolve(timestamp)
        }
      }
      requestAnimationFrame(step)
    })
  }
  const rectangle = $('#rectangle')
  await animation({ top: 200, right: 200 }, 0, rectangle)
  await animation({}, 1000, rectangle)
  let top = 200, right = 200, time = 2000, ratio = 0.85
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

testAnimation()