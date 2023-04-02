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
const zombiesOutLimit = 5
const bufferAddLimit = 1500
const bufferMoveLimit = 1000

// Bullets
const shootArea = document.getElementById('shot-area')
const superBulletsLimit = 10
const bufferSuperBulletsLimit = 70

// *** VARIABLES GLOBALES *** //

// Logica
var highScore = getLocalScore()
var score = 0
let gameOver = false

// Doctor
var posDoctor = parseInt(styleDoctor.left)

// Zombies
let bufferAdd = 0
let bufferMove = 0
let addZombies
let moveZombies
let zombiesOutCounter = 0

// Bullets
let superBullets = 0
let bufferSuperBullets = 0

// *** AUDIO*** //
const audioShoot = new Audio('assets/audio/bullet.wav')
const audioZombieDie = new Audio('assets/audio/zombie_die.wav')
const audioMusic = new Audio('assets/audio/background_music.mp3')
audioShoot.volume = 0.6
audioZombieDie.volume = 0.5
audioMusic.volume = 0.3
audioMusic.loop = true

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
  const min = 80
  const max = widthGame - 60
  if (side === 'left') {
    if (x === min) return 0
    if (x - stepDoctor < min) return x - min
    return stepDoctor
  } else {
    x += widthDoctor
    if (x === widthGame) return 0
    if (x + stepDoctor > max) return max - x
    return stepDoctor
  }
}

function checkGameOver() {
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (checkCollision(doctor, zombie) || zombiesOutCounter == zombiesOutLimit) {
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
  // gameOver.style.visibility = 'visible'
  gameOver.style.display = 'flex'
}

function hideGameOver() {
  const gameOver = document.getElementById('game-over')
  // gameOver.style.visibility = 'hidden'
  gameOver.style.display = 'none'
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

function updateZombiesOutCounter(inc, count = zombiesOutCounter) {
  const zombieshtml = document.getElementById('zombies-out-counter')
  zombiesOutCounter = count + inc
  zombieshtml.innerHTML = zombiesOutCounter
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
    // Restart doctor pos
    restartDoctorPos()
    // Restart score
    updateScore(0, 0)
    initHighScore()
    // Restart zombiesOut
    updateZombiesOutCounter(0, 0)
    // Restart super bullets
    clearSuperBullets()
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

function restartDoctorPos() {
  doctor.style.left = `${(widthGame - widthDoctor) / 2}px`
}

// Zombie
function randomZombiePos() {
  const min = 70
  const max = widthGame - widthZombie - 70
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min
  return randomNum
}

function setZombieSkin(zombie) {
  const N = 15
  let i = Math.floor(Math.random() * N) + 1
  zombie.style.backgroundImage = `url("assets/npc_${i}.png")`
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
  setZombieSkin(zombie)
  zombie.setAttribute('data-hp', 3)
  game.appendChild(zombie)
}

function moveAllZombies() {
  const limit = bufferMoveLimit - Math.sqrt((bufferMoveLimit * score) / 2)
  if (bufferMove < limit) {
    bufferMove += 20
    return
  }
  bufferMove = 0
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (isOut(zombie)) {
      zombie.remove()
      updateZombiesOutCounter(1)
      checkGameOver()
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
  audioShoot.play()
  return bullet
}

function addSuperBullet() {
  const bullet = document.createElement('div')
  bullet.classList.add('super-bullet')
  bullet.style.left = `${parseInt(styleDoctor.left)}px`
  bullet.style.top = `${parseInt(styleDoctor.top)}px`
  game.appendChild(bullet)
  audioShoot.play()
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
    if (bulletHitZombie(bullet, 1) || isOut(bullet)) {
      clearInterval(moveBullet)
      bullet.remove()
      return
    }
    move(bullet, 'right', x)
    move(bullet, 'down', y)
  }
  var moveBullet = setInterval(moveBulletXY, 40)
}

function superShoot(event) {
  event.preventDefault()
  if (gameOver) return
  if (superBullets === 0) return
  superBullets -= 1
  const xMouse = event.layerX
  const yMouse = event.layerY
  const xDoc = parseInt(styleDoctor.left)
  const yDoc = parseInt(styleDoctor.top)
  const [x, y] = vector(xMouse, yMouse, xDoc, yDoc, 15)
  const bullet = addSuperBullet()
  const moveBulletXY = () => {
    bulletHitZombie(bullet, 10)
    if (isOut(bullet)) {
      bullet.remove()
      return
    }
    move(bullet, 'right', x)
    move(bullet, 'down', y)
  }
  var moveBullet = setInterval(moveBulletXY, 40)
}

function clearSuperBullets() {
  superBullets = 0
  bufferSuperBullets = 0
}

function updateSuperBullets(inc) {
  const sbhtml = document.getElementById('sb-counter')
  bufferSuperBullets += inc
  if (bufferSuperBullets === bufferSuperBulletsLimit) {
    if (superBullets < superBulletsLimit) {
      superBullets += 1
      bufferSuperBullets = 0
    }
  }
  sbhtml.innerHTML = superBullets
}

function bulletHitZombie(bullet, power) {
  const zombies = game.getElementsByClassName('zombie')
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (checkCollision(bullet, zombie)) {
      const newHp = zombie.getAttribute('data-hp') - power
      zombie.setAttribute('data-hp', newHp)
      if (newHp <= 0) {
        updateScore(10)
        updateSuperBullets(10)
        audioZombieDie.play()
        zombie.remove()
      }
      return true
    }
  }
}

// MAIN
function startGame() {
  document.addEventListener('keypress', moveDoctor)
  shootArea.addEventListener('click', shoot)
  shootArea.addEventListener('contextmenu', superShoot)
  addZombies = setInterval(addZombie, 20)
  moveZombies = setInterval(moveAllZombies, 10)
  document.addEventListener('keypress', restartGame)
  //
  document.removeEventListener('keypress', startGame)
  document.getElementById('home').style.display = 'none'
}

function initializeGame() {
  initHighScore()
  audioMusic.play()
  document.addEventListener('keypress', startGame)
}

window.onload = function () {
  initializeGame()

  document.addEventListener('keypress', (event) => {
    const key = event.key
    if (key === ' ') score += 10
    if (key === ' ') bufferSuperBullets += 10
  })
}
