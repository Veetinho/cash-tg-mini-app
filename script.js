const _ = (id) => document.getElementById(id)
const modal = document.querySelector('.modal')
const loader = _('loader')
const toast = _('toast')

document.addEventListener('DOMContentLoaded', async () => {
  window.Telegram.WebApp.expand()
  // const data = await fetchData()
  // if (data.status == 200) refreshLocalStorage(data)

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
    const currentX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
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

function refreshLocalStorage(data) {
  localStorage.setItem('refunds', JSON.stringify(data.refunds))
  localStorage.setItem('applications', JSON.stringify(data.applications))
  localStorage.setItem('user', JSON.stringify(data.user))
}

async function fetchData() {
  const url = 'https://script.google.com/macros/s/AKfycbyTc5QX3Ua80SV2zLvXF8g76TLPle-ADCdwmqGfIL73xhHle3j8a4fw4cYoQ6VtmEUVzg/exec?id=5692813294'
  const res = await fetch(url)
  const json = await res.json()
  return json
}

function showLoader() {
  loader.style.visibility = 'visible'
}

function hideLoader() {
  loader.style.visibility = 'hidden'
}

function showModal(title = 'Uwaga', body = 'Coś poszło nie tak') {
  modal.querySelector('#modalHeader').innerText = title
  modal.querySelector('#modalBody').innerHTML = body
  modal.classList.remove('hidden')
}

function closeModal() {
  modal.classList.add('hidden')
}

function showToast(msg = 'Pomyślnie zapisane', status = 'success') {
  toast.querySelector('.toast-body').innerHTML = msg
  const toastBody = toast.querySelector('.toast-body')
  const color = getToastColorByStatus(status)
  toastBody.classList.add(`bg-${color}-200`, `border-${color}-300`)
  toast.classList.remove('hide-complete')
  toast.classList.add('show')
  setTimeout(hideToast, 5000)
}

function hideToast() {
  const colorRegexp = new RegExp(/^.+\d{3}$/, 'gm')
  const toastBody = toast.querySelector('.toast-body')
  toast.classList.remove('show')
  toast.classList.add('hide')
  setTimeout(() => {
    toast.classList.remove('hide')
    toast.classList.add('hide-complete')
    for (let i = 0; i < toastBody.classList.length; i++) if (toastBody.classList[i].match(colorRegexp)) toastBody.classList.remove(toastBody.classList[i])
  }, 500)
}

function getToastColorByStatus(status) {
  switch (status) {
    case 'danger':
      return 'red'
    case 'warning':
      return 'orange'
    case 'info':
      return 'blue'
    default:
      return 'emerald'
  }
}

function showNewApplicationModal() {
  showModal('Nowy wniosek o przelew', 'Tu bedzie formularz')
}

function showNewRefundModal() {
  showModal('Nowy wniosek o odszkodowanie', 'Tu bedzie formularz')
}

_('submitFvStatusForm').addEventListener('submit', (e) => getFvStatusInfo(e))

// _('moneyTransferForm').addEventListener('submit', (e) => {
//   e.preventDefault()
//   const moneyTransferForm = _('moneyTransferForm')
//   const data = getDataFromForm(moneyTransferForm)
//   addNewApplicationToList(data)
//   toggleApplicationForm(moneyTransferForm)
//   scrollToTop(moneyTransferForm.parentElement.parentElement)
// })

// _('invoiceRefundForm').addEventListener('submit', (e) => {
//   e.preventDefault()
//   const data = getDataFromForm(invoiceRefundForm)
//   addNewRefundApplicationToList(data)
//   toggleApplicationForm(invoiceRefundForm)
//   scrollToTop(invoiceRefundForm.parentElement.parentElement)
// })

async function getFvStatusInfo(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const fvNrInputValue = formData.get('fvNrInput')
  const fvSearchResults = _('fvSearchResults')
  fvSearchResults.innerHTML = ''
  showLoader()
  const fvs = await fetchFvStatusInfo('https://ispik.fakturownia.pl/invoices.json?', fvNrInputValue)
  fvs.length === 0
    ? (fvSearchResults.innerHTML = `<p>Brak wyników dla ${fvNrInputValue}</p>`)
    : fvs.forEach((fv) => {
        const newDiv = createFvStatusCard(fv)
        const firstDiv = fvSearchResults.querySelector('div')
        fvSearchResults.insertBefore(newDiv, firstDiv)
      })
  e.target.reset()
  hideLoader()
}

async function fetchFvStatusInfo(url, nr) {
  const res = await fetch(`${url}api_token=iHDlh5qsdbXgWtR5xxg&number=${nr}&income=no`)
  return await res.json()
}

function setHtmlUserInfo() {
  const user = JSON.parse(localStorage.getItem('user'))
  const applications = JSON.parse(localStorage.getItem('applications'))
  const refunds = JSON.parse(localStorage.getItem('refunds'))

  _('userFullName').innerText = `${user.firstName} ${user.lastName}`
  _('userPosition').innerText = user.position

  if (user.card !== '0000') {
    _('userName').innerText = `${user.lastName.toUpperCase()} ${user.firstName.toUpperCase()}`
    _('cardNumber').innerText = user.card.replace(/\D+/, '')
  }

  applications.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).forEach(addNewApplicationToList)
  refunds.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).forEach(addNewRefundApplicationToList)
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

function addNewApplicationToList(data) {
  _('recentRequests').appendChild(createApplicationCard(data))
}

function addNewRefundApplicationToList(data) {
  _('recentRefundRequests').appendChild(createRefundApplicationCard(data))
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
  return ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][num]
}

function getFormatedDate(date) {
  return `${date.getDate()} ${getPolishMonthName(date.getMonth())} ${date.getFullYear()}`
}

function getFormatedTime(date) {
  return `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
}

function createApplicationCard(data) {
  const colors = getCardColorsByStatus(data.status)
  const now = new Date(data.modifiedAt)
  const newDiv = document.createElement('div')
  newDiv.classList.add('w-full', 'p-3', 'bg-gradient-to-tr', `from-${colors[0]}-200`, `to-${colors[1]}-50`, `text-${colors[0]}-900`, 'rounded-xl', 'overflow-hidden')
  newDiv.innerHTML = `<div class="flex justify-between">
      <div class="flex flex-col justify-between">
        <div class="flex gap-2 px-2 py-1 items-center bg-${colors[0]}-200 rounded-full">
          <div class="w-3 h-3 rounded-full bg-${colors[0]}-900"></div>
          <p class="text-sm font-sans font-semibold">${data.status}</p>
        </div>
        <div>
          <p class="text-2xl font-mono font-semibold">${formatToCurrency(data.amount)}</p>
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
      <p class="pt-2"><b>Kategoria: </b> ${data.category || 'Inne'}</p>
      <p class="pt-2"><b>Obiekt: </b> ${data.project || 'Inny'}</p>
      <p class="pt-2">
        <b>Uwagi:</b> ${data.note}
      </p>
    </div>`
  return newDiv
}

function createRefundApplicationCard(data) {
  const colors = getCardColorsByStatus(data.status)
  const now = new Date(data.modifiedAt)
  const newDiv = document.createElement('div')
  newDiv.classList.add('w-full', 'mb-2', 'p-3', 'bg-gradient-to-tr', `from-${colors[0]}-200`, `to-${colors[1]}-50`, `text-${colors[0]}-900`, 'rounded-xl', 'overflow-hidden', 'border', `border-${colors[0]}-300`)
  newDiv.innerHTML = `
    <div class="flex justify-between">
      <div class="flex flex-col justify-between">
        <div class="flex gap-2 px-2 py-1 items-center bg-${colors[0]}-200 rounded-full">
          <div class="w-3 h-3 rounded-full bg-${colors[0]}-900"></div>
          <p class="text-sm font-sans font-semibold">${data.status}</p>
        </div>
        <div>
          <p class="text-2xl font-mono font-semibold">${formatToCurrency(data.amount)}</p>
        </div>
      </div>
      <div class="flex flex-col justify-between text-right rounded-xl p-1">
        <div><p class="text-xl font-mono">${getFormatedTime(now)}</p></div>
        <div><p class="text-lg font-mono">${getFormatedDate(now)}</p></div>
      </div>
    </div>
    <div class="text-md">
      <p class="pt-2"><b>Uwagi:</b> ${data.note}</p>
    </div>
    <a href="https://drive.google.com/thumbnail?sz=h1000&id=${data.fileId}" target="_blank">
      <div class="flex gap-3 justify-center items-center w-full py-3 mt-2 border border-${colors[0]}-300 bg-${colors[0]}-200 font-semibold rounded-xl ">
        <svg class="fill-${colors[0]}-900" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
          <path d="M313-40q-24 0-46-9t-39-26L24-280l33-34q14-14 34-19t40 0l69 20v-327q0-17 11.5-28.5T240-680q17 0 28.5 11.5T280-640v433l-98-28 103 103q6 6 13 9t15 3h167q33 0 56.5-23.5T560-200v-160q0-17 11.5-28.5T600-400q17 0 28.5 11.5T640-360v160q0 66-47 113T480-40H313Zm7-280v-160q0-17 11.5-28.5T360-520q17 0 28.5 11.5T400-480v160h-80Zm120 0v-120q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440v120h-80Zm40 200H285h195Zm160-400q-91 0-168-48T360-700q35-84 112-132t168-48q91 0 168 48t112 132q-35 84-112 132t-168 48Zm0-80q57 0 107.5-26t82.5-74q-32-48-82.5-74T640-800q-57 0-107.5 26T450-700q32 48 82.5 74T640-600Zm0-40q-25 0-42.5-17.5T580-700q0-25 17.5-42.5T640-760q25 0 42.5 17.5T700-700q0 25-17.5 42.5T640-640Z"/>
        </svg>
        <p>Faktura VAT</p>
      </div>
    </a>
      `
  return newDiv
}

function createFvStatusCard(res) {
  const colors = getCardColorsByStatus(res.status)
  const statuses = {
    paid: 'Opłacona',
    rejected: 'Odrzucona ',
    issued: 'Wystawiona ',
    partial: 'Częściowo opłacona',
  }
  const status = statuses[res.status] ?? 'Nieznany'
  const newDiv = document.createElement('div')
  newDiv.classList.add('w-full', 'mb-2', 'p-3', 'bg-gradient-to-tr', `from-${colors[0]}-200`, `to-${colors[1]}-50`, `text-${colors[0]}-900`, 'rounded-2xl', 'overflow-hidden', 'shadow-lg')
  newDiv.innerHTML = `
    <div class="flex justify-between">
      <div class="flex gap-2 px-2 py-1 items-center bg-${colors[0]}-200 rounded-full">
        <div class="w-3 h-3 rounded-full bg-${colors[0]}-900"></div>
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
        <b>Wartość brutto:</b> ${formatToCurrency(res.price_gross, res.currency)}
      </p>
    </div>`
  return newDiv
}

// function createFVModalInnerHtml(fileId) {
//   return `<div
//       class="relative px-4 rounded-lg shadow-lg h-screen flex flex-col items-center justify-center"
//     >
//       <div class="static">
//         <button
//           onclick="closeFVModal()"
//           class="absolute right-0 top-0 p-1 m-3 bg-red-500 text-white rounded-full"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             height="30px"
//             viewBox="0 -960 960 960"
//             width="30px"
//             fill="#fff"
//           >
//             <path
//               d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
//             />
//           </svg>
//         </button>
//       </div>
//       <img
//         class="overflow-auto"
//         src="https://drive.google.com/thumbnail?sz=h1000&id=${fileId}"
//         alt="Faktura"
//       />
//     </div>`
// }

function getCardColorsByStatus(status) {
  if (status.startsWith('Zaakceptowane') || status === 'partial' || status === 'paid') return ['green', 'teal']
  if (status.startsWith('Odrzucone') || status === 'rejected') return ['red', 'orange']
  return ['yellow', 'amber']
}

class CardColors {
  constructor(grFrom = 'from-yellow-200', grTo = 'to-amber-50', bgCircle = 'bg-yellow-900', bg = 'bg-yellow-200', txt = 'text-yellow-900') {
    this.grFrom = grFrom
    this.grTo = grTo
    this.bgCircle = bgCircle
    this.bg = bg
    this.txt = txt
  }
}

//new CardColors('from-green-300', 'to-teal-100', 'bg-green-900', 'bg-green-300', 'text-green-900')
//new CardColors('from-red-200', 'to-orange-50', 'bg-red-950', 'bg-red-200', 'text-red-950')
