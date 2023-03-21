// *** CONSTANTES *** //

// Game container
const game = document.getElementById('game-container')
const styleGame = getComputedStyle(game)
const widthGame = parseInt(styleGame.width)
const heightGame = parseInt(styleGame.height)

// Doctor
const doctor = document.getElementById('doctor')
const styleDoctor = getComputedStyle(doctor)
const widthDoctor = parseInt(styleDoctor.width)
const stepDoctor = 20

// Zombies
const widthZombie = widthDoctor
const zombies = game.getElementsByClassName('zombie')

// Bullets
const shootArea = document.getElementById('shot-area')

// *** VARIABLES GLOBALES *** //

// Logica
var highScore = getLocalScore()
var score = 0
let gameOver = false

// Doctor
var posDoctor = parseInt(styleDoctor.left)

// Zombies
let bufferAddLimit = 1500
let bufferAdd = 0
let bufferMoveLimit = 1000
let bufferMove = 0
let addZombies
let moveZombies

// *** FUNCIONES *** //

// Logica
function move(element, dir, step) {
  var pos = parseInt(getComputedStyle(element).top)
  if (dir === 'left' || dir === 'right') pos = parseInt(getComputedStyle(element).left)
  var moveStep = step
  if (dir === 'left' || dir === 'up') moveStep = -step
  var dest = pos + moveStep
  if (dir === 'left' || dir === 'right') element.style.left = `${dest}px`
  else element.style.top = `${dest}px`
}

function vector(xM, yM, xD, yD, step) {
  const x = xM - xD
  const y = yM - yD
  const orModule = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  const xFinal = Math.floor((x / orModule) * step)
  const yFinal = Math.floor((y / orModule) * step)
  return [xFinal, yFinal]
}

function calculateStepDoctor(side) {
  let x = parseInt(doctor.style.left)
  if (side === 'left') {
    if (x === 0) return 0
    if (x - stepDoctor < 0) return -(x - stepDoctor)
    return stepDoctor
  } else {
    x += widthDoctor
    if (x === widthGame) return 0
    if (x + stepDoctor > widthGame) return -(widthGame - x - stepDoctor)
    return stepDoctor
  }
}

function checkGameOver(zombieArray) {
  for (let i = 0; i < zombieArray.length; i++) {
    const zombie = zombies[i]
    if (checkCollision(doctor, zombie)) {
      clearInterval(moveZombies)
      clearInterval(addZombies)
      console.log('[!] Game over!')
      gameOver = true
      showGameOver()
      updateLocalHighScore()
    }
  }
}

function showGameOver() {
  const gameOver = document.getElementById('game-over')
  gameOver.style.visibility = 'visible'
}

function hideGameOver() {
  const gameOver = document.getElementById('game-over')
  gameOver.style.visibility = 'hidden'
}

function isOut(element) {
  const style = getComputedStyle(element)
  const width = parseInt(style.width)
  const height = parseInt(style.height)
  const top = parseInt(element.style.top)
  const left = parseInt(element.style.left)
  return top + height < 0 || top > heightGame || left + width < 0 || left > widthGame
}

function checkCollision(element1, element2) {
  const rect1 = element1.getBoundingClientRect()
  const rect2 = element2.getBoundingClientRect()
  return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom
}

function getLocalScore() {
  return localStorage.getItem('doctor-rush-score')
}

function setLocalScore(score) {
  localStorage.setItem('doctor-rush-score', score)
}

function updateLocalHighScore() {
  if (score > highScore) setLocalScore(score)
}

function initHighScore() {
  const highscorehtml = document.getElementById('high-score')
  highscorehtml.innerHTML = getLocalScore() ?? 0
}

function updateScore(inc, newScore = score) {
  const scorehtml = document.getElementById('score')
  score = newScore + inc
  scorehtml.innerHTML = score
}

function restartGame(event) {
  const key = event.key
  if (gameOver && key == 'r') {
    gameOver = false
    addZombies = setInterval(addZombie, 20)
    moveZombies = setInterval(moveAllZombies, 10)
    // Clear zombies
    while (zombies.length !== 0) {
      zombies[0].remove()
    }
    // Restart score
    updateScore(0, 0)
    initHighScore()
    // Remove game-over
    hideGameOver()
  }
}

// Doctor
function moveDoctor(event) {
  if (gameOver) return
  const key = event.key
  let step = stepDoctor
  switch (key) {
    case 'a':
      step = calculateStepDoctor('left')
      move(doctor, 'left', step)
      checkGameOver(zombies)
      break
    case 'd':
      step = calculateStepDoctor('right')
      move(doctor, 'right', step)
      checkGameOver(zombies)
      break
    default:
      break
  }
}

// Zombie
function randomZombiePos() {
  const min = 0
  const max = widthGame - widthZombie
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
  return randomNum
}

function addZombie() {
  const limit = bufferAddLimit - Math.sqrt((bufferAddLimit * score) / 2)
  if (bufferAdd < limit) {
    bufferAdd += 20
    return
  }
  bufferAdd = 0
  const zombie = document.createElement('div')
  zombie.classList.add('zombie')
  zombie.style.left = `${randomZombiePos()}px`
  zombie.setAttribute('data-hp', 3)
  game.appendChild(zombie)
}

function moveAllZombies() {
  const limit = bufferMoveLimit - Math.sqrt((bufferMoveLimit * score) / 2)
  if (bufferMove < limit) {
    bufferMove += 10
    return
  }
  bufferMove = 0
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (isOut(zombie)) {
      zombie.remove()
      i--
      continue
    }
    move(zombie, 'down', 20)
  }
  checkGameOver(zombies)
}

// Bullet
function addBullet() {
  const bullet = document.createElement('div')
  bullet.classList.add('bullet')
  bullet.style.left = `${parseInt(styleDoctor.left)}px`
  bullet.style.top = `${parseInt(styleDoctor.top)}px`
  game.appendChild(bullet)
  return bullet
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

// MAIN
function moveIsOk(destination) {
  return true
  // return destination >= 0 && destination <= widthGame - widthDoctor
}

function initializeGame() {
  initHighScore()
  document.addEventListener('keypress', moveDoctor)
  shootArea.addEventListener('click', shoot)
  addZombies = setInterval(addZombie, 20)
  moveZombies = setInterval(moveAllZombies, 10)
  document.addEventListener('keypress', restartGame)
}

window.onload = function () {
  initializeGame()

  document.addEventListener('keypress', (event) => {
    const key = event.key
    if (key === ' ') score += 10
  })
}
