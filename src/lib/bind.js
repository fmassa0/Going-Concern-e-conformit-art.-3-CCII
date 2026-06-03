// Bind dei valori del modello sul markup della dashboard.
// Ogni <span data-excel-sheet=.. data-excel-cell=..> viene riempito con il
// valore del modello formattato per tipo. I semafori (verde/rosso) delle card
// equilibrio e dei segnali sono derivati dal testo del verdetto bind-ato.
import { fmtByType } from './format.js'
import { TYPES } from '../data/cellValues.js'

export function keyOf(el) {
  const s = el.getAttribute('data-excel-sheet')
  const c = el.getAttribute('data-excel-cell')
  return s && c ? `${s}!${c}` : null
}

export function applyModel(root, model) {
  if (!root || !model) return
  // 1) valori testuali
  root.querySelectorAll('[data-excel-cell]').forEach((el) => {
    const key = keyOf(el)
    if (key == null) return
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const type = el.getAttribute('data-excel-type') || TYPES[key] || 'text'
      el.textContent = fmtByType(type, model[key])
    }
  })
  // 2) semafori derivati
  refreshSemaphores(root)
}

const isBad = (t) => /SQUILIBRIO|RISCHIO|INSOLVEN|ALLERTA|ALLARME|SUPER|NO CONTIN/i.test(t)
const isGood = (t) => /EQUILIBRIO|OK|SOSTENIBIL|NESSUN|CONTINU|NO ESPOS|NO DEBITI/i.test(t)

function setState(el, bad) {
  el.classList.remove('good', 'bad', 'neutral')
  el.classList.add(bad ? 'bad' : 'good')
}

function refreshSemaphores(root) {
  // card equilibrio
  root.querySelectorAll('.eq-card').forEach((card) => {
    const flag = card.querySelector('.eq-flag .val, .eq-flag')
    const t = (flag?.textContent || '').toUpperCase()
    if (isBad(t)) setState(card, true)
    else if (isGood(t)) setState(card, false)
  })
  // segnali a-d: "OK" → verde, qualsiasi altro flag → rosso
  root.querySelectorAll('.seg').forEach((seg) => {
    const flag = seg.querySelector('.seg-flag .val, .seg-flag')
    const t = (flag?.textContent || '').toUpperCase().trim()
    if (t) setState(seg, t !== 'OK')
  })
}
