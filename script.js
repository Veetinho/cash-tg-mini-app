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

const moneyRefundApplicationData = [
  {
    timestamp: '1728296529786',
    status: 'Oczekuje',
    invoiceRefundAmount: 320,
    invoiceRefundNote: 'замена Резины Varanets Valerii',
    fileId: '1zPZQ-82u2b82_Nou5XIXsL9xaaXgSpHq',
  },
  {
    timestamp: '1728296529786',
    status: 'Odrzucone',
    invoiceRefundAmount: 38.99,
    invoiceRefundNote: 'пистолет для пены (Kruk Nazar)',
    fileId: '1jdFEVEapGZynhgBaf6ErvUCNdF32yRDz',
  },
  {
    timestamp: '1728296529786',
    status: 'Zaakceptowane',
    invoiceRefundAmount: 219,
    invoiceRefundNote: 'полоса металла для кафара YESIMCHYK MIKHAIL',
    fileId: '1Uw5uESIycX1T_QJJoPImDdo_9gMhkVGI',
  },
]

const fvs = [
  {
    number: '1/10/2024',
    sell_date: '2024-10-01',
    payment_to: '2024-10-04',
    status: 'paid',
    paid_date: '2024-10-14',
    buyer_name: 'FIRMA HANDLOWO-USŁUGOWA ROBERT IWASZKO',
    price_gross: '13475.0',
    currency: 'PLN',
  },
  {
    number: '1/10/2024',
    sell_date: '2024-10-01',
    payment_to: '2024-10-08',
    status: 'issued',
    buyer_name: 'FUDA JAROSŁAW ŁAZARSKI',
    price_gross: '26309.7',
    currency: 'PLN',
  },
]

const userInfo = {
  name: 'Test User',
  card: 'User 4619',
}

const _ = (id) => document.getElementById(id)
const moneyTransferForm = _('moneyTransferForm')
const toggleApplicationFormButton = _('toggleApplicationFormButton')
const toggleRefundFormButton = _('toggleRefundFormButton')
const fvSearchResults = _('fvSearchResults')
const loader = _('loader')

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
      scrollToTop(blocks[currentIndex])
    } else if (deltaX > 100 && currentIndex > 0) {
      blocks[currentIndex].style.transform = 'translateX(100%)'
      currentIndex--
      blocks[currentIndex].style.transform = 'translateX(0)'
      scrollToTop(blocks[currentIndex])
    } else {
      blocks[currentIndex].style.transform = 'translateX(0)'
    }

    container.removeEventListener('mousemove', onDrag)
    container.removeEventListener('touchmove', onDrag)
    container.removeEventListener('mouseup', endDrag)
    container.removeEventListener('touchend', endDrag)
  }

  setTimeout(() => {
    _('swiper').classList.add('hidden')
  }, 6000)
})

function startLoading() {
  loader.style.visibility = 'visible'
}

function endLoading() {
  loader.style.visibility = 'hidden'
}

moneyTransferForm.querySelector('select').addEventListener('change', (el) => {
  if (el.target.value === 'Inne') {
    _('moneyTransferObject').classList.remove('hidden')
  } else {
    _('moneyTransferObject').classList.add('hidden')
    document.querySelector('[name="moneyTransferObject"]').selectedIndex = 0
  }
})

toggleApplicationFormButton.addEventListener('click', (e) => {
  toggleApplicationForm(
    e.target.parentElement.parentElement.querySelector('form')
  )
})

toggleRefundFormButton.addEventListener('click', (e) => {
  toggleApplicationForm(
    e.target.parentElement.parentElement.querySelector('form')
  )
})

_('submitFvStatusForm').addEventListener('submit', (e) => getFvStatusInfo(e))

moneyTransferForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = getDataFromForm(moneyTransferForm)
  addNewApplicationToList(data)
  toggleApplicationForm(moneyTransferForm)
  scrollToTop(moneyTransferForm.parentElement.parentElement)
})

invoiceRefundForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = getDataFromForm(invoiceRefundForm)
  addNewRefundApplicationToList(data)
  toggleApplicationForm(invoiceRefundForm)
  scrollToTop(invoiceRefundForm.parentElement.parentElement)
})

async function getFvStatusInfo(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const fvNrInputValue = formData.get('fvNrInput')
  fvSearchResults.innerHTML = ''
  startLoading()
  const fvs = await fetchFvStatusInfo(fvNrInputValue)
  fvs.forEach((fv) => {
    const newDiv = createFvStatusCard(fv)
    const firstDiv = fvSearchResults.querySelector('div')
    fvSearchResults.insertBefore(newDiv, firstDiv)
  })
  e.target.reset()
  endLoading()
}

async function fetchFvStatusInfo(nr) {
  const res = new Promise((resolve) => {
    setTimeout(() => {
      resolve(fvs)
    }, 2000)
  })
  return await res
}

function setHtmlUserInfo() {
  _('userName').innerText = userInfo.name.toUpperCase()
  _('cardNumber').innerText = userInfo.card.replace(/\D+/, '')
  moneyApplicationData
    .sort((a, b) => +a.timestamp - +b.timestamp)
    .forEach(addNewApplicationToList)
  moneyRefundApplicationData
    .sort((a, b) => +a.timestamp - +b.timestamp)
    .forEach(addNewRefundApplicationToList)
}

function getDataFromForm(form) {
  const formData = new FormData(form)
  const obj = {}
  for (const [key, value] of formData.entries()) obj[key] = value
  obj.timestamp = Date.now()
  obj.status = 'Oczekuje'
  return obj
}

function toggleApplicationForm(form) {
  if (form.classList.contains('open')) {
    form.classList.remove('open')
  } else {
    form.classList.add('open')
    form.reset()
  }
}

function closeFVModal() {
  _('modalFV').classList.add('hidden')
}

function showFVModal(fileId) {
  _('modalFV').classList.remove('hidden')
  _('modalFV').innerHTML = createFVModalInnerHtml(fileId)
}

function addNewApplicationToList(data) {
  const recentRequestsBlock = _('recentRequests')
  const newDiv = createApplicationCard(data)
  const firstDiv = recentRequestsBlock.querySelector('div')
  recentRequestsBlock.insertBefore(newDiv, firstDiv)
}

function addNewRefundApplicationToList(data) {
  const recentRequestsBlock = _('recentRefundRequests')
  const newDiv = createRefundApplicationCard(data)
  const firstDiv = recentRequestsBlock.querySelector('div')
  recentRequestsBlock.insertBefore(newDiv, firstDiv)
}

function scrollToTop(el) {
  el.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function formatToCurrency(num, currency = 'PLN') {
  return new Intl.NumberFormat('pl', {
    style: 'currency',
    currency,
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

function getCardClassesByFvStatus(status) {
  if (status === 'partial' || status === 'paid')
    return new CardColors(
      'from-green-300',
      'to-teal-100',
      'bg-green-900',
      'bg-green-300',
      'text-green-900'
    )
  if (status === 'rejected')
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

function createRefundApplicationCard(data) {
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
  newDiv.id = data.fileId
  newDiv.ondblclick = () => showFVModal(data.fileId)
  newDiv.ontouchend = () => showFVModal(data.fileId)
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
            data.invoiceRefundAmount
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
      <p class="pt-2">
        <b>Uwagi:</b> ${data.invoiceRefundNote}
      </p>
    </div>`
  return newDiv
}

function createFvStatusCard(res) {
  const colorClasses = getCardClassesByFvStatus(res.status)
  const statuses = {
    paid: 'Opłacona',
    rejected: 'Odrzucona ',
    issued: 'Wystawiona ',
    partial: 'Częściowo opłacona',
  }
  const status = statuses[res.status] ?? 'Nieznany'
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
      <div class="flex gap-2 px-2 py-1 items-center ${
        colorClasses.bg
      } rounded-full">
        <div class="w-3 h-3 rounded-full ${colorClasses.bgCircle}"></div>
        <p class="text-sm font-sans font-semibold">${status}</p>
      </div>
    </div>
    <div class="text-md">
      <p class="pt-2"><b>Nr faktury:</b> ${res.number}</p>
      <p class="pt-2">
        <b>Data wystawienia:</b> ${getFormatedDate(new Date(res.sell_date))}
      </p>
      <p class="pt-2">
        <b>Termin płatności:</b> ${getFormatedDate(new Date(res.payment_to))}
      </p>
      ${
        status === 'Opłacona' || status === 'Częściowo opłacona'
          ? `<p class="pt-2">
            <b>Data płatności:</b> 
            ${getFormatedDate(new Date(res.payment_to))}
          </p>`
          : ''
      }
      ${
        status === 'Częściowo opłacona'
          ? `<p class="pt-2">
            <b>Suma opłat:</b> $ ${res.price_tax} ${res.currency}
          </p>`
          : ''
      }
      <p class="pt-2">
        <b>Sprzedawca:</b> ${res.buyer_name}
      </p>
      <p class="pt-2">
        <b>Wartość brutto:</b> ${formatToCurrency(
          res.price_gross,
          res.currency
        )}
      </p>
    </div>`
  return newDiv
}

function createFVModalInnerHtml(fileId) {
  return `<div
      class="relative px-4 rounded-lg shadow-lg h-screen flex flex-col items-center justify-center"
    >
      <div class="static">
        <button
          onclick="closeFVModal()"
          class="absolute right-0 top-0 p-1 m-3 bg-red-500 text-white rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#fff"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
            />
          </svg>
        </button>
      </div>
      <img
        class="overflow-auto"
        src="https://drive.google.com/thumbnail?sz=h1000&id=${fileId}"
        alt="Faktura"
        loading="lazy"
      />
    </div>`
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
