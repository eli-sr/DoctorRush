// Game container
const game = document.getElementById('game-container')
const styleGame = getComputedStyle(game)
const widthGame = parseInt(styleGame.width)
const heightGame = parseInt(styleGame.height)

// Doctor
const doctor = document.getElementById('doctor')
const styleDoctor = getComputedStyle(doctor)
const widthDoctor = parseInt(styleDoctor.width)
var posDoctor = parseInt(styleDoctor.left)
const stepDoctor = 20

function moveIsOk(destination) {
  return true
  // return destination >= 0 && destination <= widthGame - widthDoctor
}

function move(element, dir, step) {
  var pos = parseInt(getComputedStyle(element).top)
  if (dir === 'left' || dir === 'right') pos = parseInt(getComputedStyle(element).left)
  var moveStep = step
  if (dir === 'left' || dir === 'up') moveStep = -step
  var dest = pos + moveStep
  if (dir === 'left' || dir === 'right') element.style.left = `${dest}px`
  else element.style.top = `${dest}px`
}

function moveDoctor(event) {
  if (gameOver) return
  const key = event.key
  switch (key) {
    case 'a':
      move(doctor, 'left', stepDoctor)
      checkGameOver(zombies)
      break
    case 'd':
      move(doctor, 'right', stepDoctor)
      checkGameOver(zombies)
      break
    default:
      break
  }
}

// Zombies

const widthZombie = widthDoctor

function randomPos() {
  const min = 0
  const max = widthGame - widthZombie
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
  return randomNum
}

let bufferAddLimit = 1500
let bufferAdd = 0
function addZombie() {
  const limit = bufferAddLimit - Math.sqrt((bufferAddLimit * score) / 2)
  if (bufferAdd < limit) {
    bufferAdd += 20
    return
  }
  bufferAdd = 0
  // console.log('add', bufferAddLimit - score, ':', limit)
  const zombie = document.createElement('div')
  zombie.classList.add('zombie')
  zombie.style.left = `${randomPos()}px`
  zombie.setAttribute('data-hp', 3)
  game.appendChild(zombie)
}

var score = 0
const zombies = game.getElementsByClassName('zombie')

let bufferMoveLimit = 1000
let bufferMove = 0
function moveAllZombies() {
  const limit = bufferMoveLimit - Math.sqrt((bufferMoveLimit * score) / 2)
  if (bufferMove < limit) {
    bufferMove += 10
    return
  }
  bufferMove = 0
  // console.log('move', bufferMove, ':', limit)
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (isOut(zombie)) {
      zombie.remove()
      continue
    }
    move(zombie, 'down', 20)
  }
  checkGameOver(zombies)
}

// Game Over

let gameOver = false
function checkGameOver(zombieArray) {
  for (let i = 0; i < zombieArray.length; i++) {
    const zombie = zombies[i]
    if (checkCollision(doctor, zombie)) {
      clearInterval(moveZombies)
      clearInterval(addZombies)
      console.log('[!] Game over!')
      gameOver = true
    }
  }
}

// Bullet

function vector(xM, yM, xD, yD, step) {
  const x = xM - xD
  const y = yM - yD
  const orModule = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  const xFinal = Math.floor((x / orModule) * step)
  const yFinal = Math.floor((y / orModule) * step)
  return [xFinal, yFinal]
}

function addBullet() {
  const bullet = document.createElement('div')
  bullet.classList.add('bullet')
  bullet.style.left = `${parseInt(styleDoctor.left)}px`
  bullet.style.top = `${parseInt(styleDoctor.top)}px`
  game.appendChild(bullet)
  return bullet
}

function isOut(element) {
  const style = getComputedStyle(element)
  const width = parseInt(style.width)
  const height = parseInt(style.height)
  const top = parseInt(element.style.top)
  const left = parseInt(element.style.left)
  return top + height < 0 || top > heightGame || left + width < 0 || left > widthGame
}

function shoot(event) {
  if (gameOver) return
  const xMouse = event.layerX
  const yMouse = event.layerY
  const xDoc = parseInt(styleDoctor.left)
  const yDoc = parseInt(styleDoctor.top)
  const [x, y] = vector(xMouse, yMouse, xDoc, yDoc, 20)
  const bullet = addBullet()
  const moveBulletXY = () => {
    if (isCollidingBullet(bullet) || isOut(bullet)) {
      clearInterval(moveBullet)
      bullet.remove()
      return
    }
    move(bullet, 'right', x)
    move(bullet, 'down', y)
  }
  var moveBullet = setInterval(moveBulletXY, 40)
}

const shootArea = document.getElementById('shot-area')
let addZombies
let moveZombies

function initializeGame() {
  document.addEventListener('keypress', moveDoctor)
  shootArea.addEventListener('click', shoot)
  addZombies = setInterval(addZombie, 20)
  moveZombies = setInterval(moveAllZombies, 10)
}

// Score
function updateScore(inc) {
  const scorehtml = document.getElementById('score')
  score += inc
  scorehtml.innerHTML = score
}

// Collision

function isCollidingBullet(bullet) {
  const zombies = game.getElementsByClassName('zombie')
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (checkCollision(bullet, zombie)) {
      const newHp = zombie.getAttribute('data-hp') - 1
      zombie.setAttribute('data-hp', newHp)
      if (newHp === 0) {
        updateScore(10)
        zombie.remove()
      }
      return true
    }
  }
}

function checkCollision(element1, element2) {
  const rect1 = element1.getBoundingClientRect()
  const rect2 = element2.getBoundingClientRect()
  return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom
}

window.onload = function () {
  initializeGame()

  document.addEventListener('keypress', (event) => {
    const key = event.key
    if (key === ' ') score += 10
  })
}
