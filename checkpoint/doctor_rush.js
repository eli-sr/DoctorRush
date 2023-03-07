const doctor = document.getElementById('doctor')
const styleDoctor = getComputedStyle(doctor)
var posDoctor = parseInt(styleDoctor.left)
var widthDoctor = parseInt(styleDoctor.width)

function moveDoctor(event) {
  const key = event.key
  switch (key) {
    case 'a':
      posDoctor -= 10
      doctor.style.left = `${posDoctor}px`
      break
    case 'd':
      posDoctor += 10
      doctor.style.left = `${posDoctor}px`
      break
    default:
      break
  }
}

document.addEventListener('keypress', moveDoctor)
