async function testAnimation() {
  async function animation(options = {}, duration, element, fps = 60) {
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
    let now;
    let start = Date.now();
    let then = Date.now();
    let delta;
    let progress = 0
    const interval = 1000 / fps;
    return new Promise(resolve => {
      const step = (timestamp) => {
        progress = new Date().getTime() - start
        if (progress >= duration) {
          for (const key in options) {
            const value = parseFloat(prevStyle[key] || 0) + options[key]
            element.style[key] = pxList.indexOf(key) != -1 ? `${value}px` : value
          }
          prevStyle = Object.assign({}, element.style)
          progress = 0
          return resolve(element)
        }
        requestAnimationFrame(step)
        now = new Date().getTime()
        delta = now - then;
        if(delta > interval) {
          then = now - (delta % interval)
          for (const key in options) {
            const value = parseFloat(prevStyle[key] || 0) + options[key] * progress / duration
            element.style[key] = pxList.indexOf(key) != -1 ? `${value}px` : value
          }
        }
      	
      }
      requestAnimationFrame(step)
    })
  }
  
  
  const rectangle = document.querySelector('#rectangle')
  animation({ top: 50, right: 50 }, 0, rectangle)
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