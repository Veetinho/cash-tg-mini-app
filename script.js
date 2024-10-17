const moneyApplicationData = [
  {
    timestamp: '1728296529786',
    status: 'Zaakceptowane Konto osobiste',
    moneyTransferDepartment: 'Batkowo',
    moneyTransferAmount: 1160,
    moneyTransferNote: 'штраф за повреждения мусорного контейнера PV BATKOWO',
  },
  {
    timestamp: '1728401745838',
    status: 'Zaakceptowane BLIK',
    moneyTransferDepartment: 'Auta',
    moneyTransferAmount: 500,
    moneyTransferNote:
      'заміна пильника шруса та проходження техосмотру для VW T5 номер CB629MY',
  },
  {
    timestamp: '1727430165446',
    status: 'Zaakceptowane',
    moneyTransferDepartment: 'Hostele',
    moneyTransferAmount: 2120,
    moneyTransferNote: 'на хостел',
  },
  {
    timestamp: '1727068371747',
    status: 'Odrzucone',
    moneyTransferDepartment: 'Dobiegniew 40',
    moneyTransferAmount: 585,
    moneyTransferNote:
      'на паливо (на випадок як не буде діяти карта для заправки) і матеріали.',
  },
]

const userInfo = {
  name: 'Test User',
  card: 'User 4619',
}

const _ = (id) => document.getElementById(id)
const moneyTransferForm = _('moneyTransferForm')
const toggleFormButton = _('toggleFormButton')

document.addEventListener('DOMContentLoaded', () => {
  window.Telegram.WebApp.expand()
  setHtmlUserInfo()
  let currentIndex = 0
  const blocks = document.querySelectorAll('.screen__block')
  const container = _('container')
  let startX = 0
  let isDragging = false

  blocks.forEach((block, index) => {
    block.style.transform = `translateX(${index === currentIndex ? 0 : 100}%)`
    if (index !== currentIndex) block.style.visibility = 'collapse'
    block.style.visibility = 'visible'
  })

  container.addEventListener('mousedown', startDrag)
  container.addEventListener('touchstart', startDrag)

  function startDrag(event) {
    if (event.target.tagName === 'SELECT') return
    startX = event.touches ? event.touches[0].clientX : event.clientX
    isDragging = true
    container.addEventListener('mousemove', onDrag)
    container.addEventListener('touchmove', onDrag)
    container.addEventListener('mouseup', endDrag)
    container.addEventListener('touchend', endDrag)
  }

  function onDrag(event) {
    if (!isDragging) return
    const currentX = event.touches ? event.touches[0].clientX : event.clientX
    const deltaX = currentX - startX
    blocks[currentIndex].style.transform = `translateX(${deltaX}px)`
  }

  function endDrag(event) {
    if (!isDragging) return
    isDragging = false
    const currentX = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX
    const deltaX = currentX - startX

    if (deltaX < -100 && currentIndex < blocks.length - 1) {
      blocks[currentIndex].style.transform = 'translateX(-100%)'
      currentIndex++
      blocks[currentIndex].style.transform = 'translateX(0)'
      blocks[currentIndex].scrollTo({ top: 0, behavior: 'smooth' })
    } else if (deltaX > 100 && currentIndex > 0) {
      blocks[currentIndex].style.transform = 'translateX(100%)'
      currentIndex--
      blocks[currentIndex].style.transform = 'translateX(0)'
      blocks[currentIndex].scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      blocks[currentIndex].style.transform = 'translateX(0)'
    }

    container.removeEventListener('mousemove', onDrag)
    container.removeEventListener('touchmove', onDrag)
    container.removeEventListener('mouseup', endDrag)
    container.removeEventListener('touchend', endDrag)
  }
})

moneyTransferForm.querySelector('select').addEventListener('change', (el) => {
  if (el.target.value === 'Inne') {
    _('moneyTransferObject').classList.remove('hidden')
  } else {
    _('moneyTransferObject').classList.add('hidden')
    document.querySelector('[name="moneyTransferObject"]').selectedIndex = 0
  }
})

toggleFormButton.addEventListener('click', toggleMoneyApplicationForm)

moneyTransferForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = getDataFromForm()
  addNewApplicationToList(data)
  toggleMoneyApplicationForm()
})

function setHtmlUserInfo() {
  _('userName').innerText = userInfo.name.toUpperCase()
  _('cardNumber').innerText = userInfo.card.replace(/\D+/, '')
  moneyApplicationData
    .sort((a, b) => +a.timestamp - +b.timestamp)
    .forEach(addNewApplicationToList)
}

function getDataFromForm() {
  const formData = new FormData(moneyTransferForm)
  const obj = {}
  for (const [key, value] of formData.entries()) obj[key] = value
  obj.timestamp = Date.now()
  obj.status = 'Oczekuje'
  return obj
}

function toggleMoneyApplicationForm() {
  if (moneyTransferForm.classList.contains('open')) {
    moneyTransferForm.classList.remove('open')
  } else {
    moneyTransferForm.classList.add('open')
    moneyTransferForm.reset()
  }
}

function addNewApplicationToList(data) {
  const recentRequestsBlock = _('recentRequests')
  const newDiv = createApplicationCard(data)
  const firstDiv = recentRequestsBlock.querySelector('div')
  recentRequestsBlock.insertBefore(newDiv, firstDiv)
}

function formatToCurrency(num) {
  return new Intl.NumberFormat('pl', {
    style: 'currency',
    currency: 'PLN',
  }).format(num)
}

function getPolishMonthName(num) {
  return [
    'sty',
    'lut',
    'mar',
    'kwi',
    'maj',
    'cze',
    'lip',
    'sie',
    'wrz',
    'paź',
    'lis',
    'gru',
  ][num]
}

function getFormatedDate(date) {
  return `${date.getDate()} ${getPolishMonthName(
    date.getMonth()
  )} ${date.getFullYear()}`
}

function getFormatedTime(date) {
  return `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }`
}

function getCardClassesByApplicationStatus(status) {
  if (status.startsWith('Zaakceptowane'))
    return new CardColors(
      'from-green-300',
      'to-teal-100',
      'bg-green-900',
      'bg-green-300',
      'text-green-900'
    )
  if (status.startsWith('Odrzucone'))
    return new CardColors(
      'from-red-200',
      'to-orange-50',
      'bg-red-950',
      'bg-red-200',
      'text-red-950'
    )
  return new CardColors()
}

function createApplicationCard(data) {
  const colorClasses = getCardClassesByApplicationStatus(data.status)
  const now = new Date(+data.timestamp)
  const newDiv = document.createElement('div')
  newDiv.classList.add(
    'w-full',
    'mb-2',
    'p-3',
    'bg-gradient-to-tr',
    colorClasses.grFrom,
    colorClasses.grTo,
    colorClasses.txt,
    'rounded-2xl',
    'overflow-hidden',
    'shadow-lg'
  )
  newDiv.innerHTML = `
    <div class="flex justify-between">
      <div class="flex flex-col justify-between">
        <div class="flex gap-2 px-2 py-1 items-center ${
          colorClasses.bg
        } rounded-full">
          <div class="w-3 h-3 rounded-full ${colorClasses.bgCircle}"></div>
          <p class="text-sm font-sans font-semibold">${data.status}</p>
        </div>
        <div>
          <p class="text-2xl font-mono font-semibold">${formatToCurrency(
            data.moneyTransferAmount
          )}</p>
        </div>
      </div>
      <div class="flex flex-col justify-between text-right rounded-xl p-1">
        <div><p class="text-xl font-mono">${getFormatedTime(now)}</p></div>
        <div>
          <p class="text-lg font-mono">${getFormatedDate(now)}</p>
        </div>
      </div>
    </div>
    <div class="text-md">
      <p class="pt-2"><b>Kategoria (obiekt):</b> ${
        data.moneyTransferObject || data.moneyTransferDepartment
      }</p>
      <p class="pt-2">
        <b>Uwagi:</b> ${data.moneyTransferNote}
      </p>
    </div>`
  return newDiv
}

class CardColors {
  constructor(
    grFrom = 'from-yellow-200',
    grTo = 'to-amber-50',
    bgCircle = 'bg-yellow-900',
    bg = 'bg-yellow-200',
    txt = 'text-yellow-900'
  ) {
    this.grFrom = grFrom
    this.grTo = grTo
    this.bgCircle = bgCircle
    this.bg = bg
    this.txt = txt
  }
}
