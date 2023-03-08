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

function move(element, direction, step) {
  var pos = parseInt(getComputedStyle(element).top)
  if (direction === 'left' || direction === 'right') pos = parseInt(getComputedStyle(element).left)
  var moveStep = step
  if (direction === 'left' || direction === 'up') moveStep = -step
  var destination = pos + moveStep
  switch (direction) {
    case 'up':
      if (moveIsOk(destination)) element.style.top = `${destination}px`
      break
    case 'down':
      if (moveIsOk(destination)) element.style.top = `${destination}px`
      break
    case 'left':
      if (moveIsOk(destination)) element.style.left = `${destination}px`
      break
    case 'right':
      if (moveIsOk(destination)) element.style.left = `${destination}px`
      break
    default:
      break
  }
}

function moveDoctor(event) {
  const key = event.key
  switch (key) {
    case 'a':
      move(doctor, 'left', stepDoctor)
      break
    case 'd':
      move(doctor, 'right', stepDoctor)
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

function addZombie() {
  const zombie = document.createElement('div')
  zombie.classList.add('zombie')
  zombie.style.left = `${randomPos()}px`
  game.appendChild(zombie)
}

function removeZombie(zombie) {
  zombie.remove()
}

var score = 0

function moveAllZombies() {
  const zombies = game.getElementsByClassName('zombie')
  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i]
    if (parseInt(zombie.style.top) > heightGame) {
      removeZombie(zombie)
      continue
    }
    move(zombie, 'down', 20 + Math.floor(score / 10))
  }
}

function initializeGame() {
  document.addEventListener('keypress', moveDoctor)
  var addZombies = setInterval(addZombie, 2000)
  var moveZombies = setInterval(moveAllZombies, 1000)
  // test
  const scorehtml = document.getElementById('score')
  document.addEventListener('keypress', (event) => {
    if (event.key === ' ') {
      score += 10
      scorehtml.innerHTML = score
    }
  })
  // ftest
}

window.onload = function () {
  initializeGame()
}
