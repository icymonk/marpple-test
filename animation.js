const pxList = ['left', 'top', 'right', 'bottom']
const isPixel = key => pxList.indexOf(key) != -1
const buildStyle = ([key, value]) => [key, isPixel(key) ? value + 'px' : value]
const getStyleValue = curry2((prevStyle, ratio, [key, value]) => [key, parseFloat(prevStyle[key] || 0) + value * ratio])
const getNow = () => Date.now()
const setStyles = (el, prevStyle, options, ratio = 1) => go(
  options,
  entries,
  map(getStyleValue(prevStyle, ratio)),
  map(buildStyle),
  map(set2(el.style)),
  take(Infinity)
)
const isOver = (progress, duration) => progress >= duration

async function animation(options = {}, duration, element, fps = 60) {  
  const interval = 1000 / fps
  let start = getNow()
  let then = getNow()
  let prevStyle = copy(element.style)
  let now
  let delta
  let progress = 0

  const initNextTick = () => {
    now = getNow()
    delta = now - then;
    if(delta > interval) {
      then = now - (delta % interval)
      setStyles(element, prevStyle, options, progress / duration)
    }
    progress = getNow() - start
  }

  const onOver = (resolve) => {
    setStyles(element, prevStyle, options)
    prevStyle = copy(element.style)
    progress = 0
    return resolve(element)
  }

  if(duration == 0) return setStyles(element, prevStyle, options)
  return new Promise(resolve => {
    const step = () => isOver(progress, duration) ? onOver(resolve) : requestAnimationFrame(step) && initNextTick()
    requestAnimationFrame(step)
  })
}
