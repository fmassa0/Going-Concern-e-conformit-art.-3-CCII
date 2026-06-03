// Formattazione numerica in stile italiano, coerente col modello originale.
// currency: "€ 1.234" / "−€ 1.234"  ·  percent: "26,2%"  ·  number: "1.234"
const MINUS = '−' // − (minus tipografico, come nell'originale)

const nf0 = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function fmtCurrency(v) {
  if (v == null || v === '' || isNaN(v)) return '—'
  const n = Math.round(Number(v))
  const abs = nf0.format(Math.abs(n))
  return n < 0 ? `${MINUS}€ ${abs}` : `€ ${abs}`
}

export function fmtPercent(v, decimals = 1) {
  if (v == null || v === '' || isNaN(v)) return '—'
  const n = Number(v)
  const f = decimals === 1 ? nf1 : nf2
  const s = f.format(Math.abs(n)).replace('.', ',')
  return (n < 0 ? MINUS : '') + s + '%'
}

export function fmtNumber(v) {
  if (v == null || v === '') return '—'
  if (typeof v === 'string' && isNaN(Number(v.replace(',', '.')))) return v
  const n = Number(typeof v === 'string' ? v.replace('.', '').replace(',', '.') : v)
  if (isNaN(n)) return String(v)
  return (Number.isInteger(n) ? nf0 : nf2).format(n)
}

export function fmtMultiple(v) {
  if (v == null || v === '' || isNaN(v)) return '—'
  const n = Number(v)
  return (n < 0 ? MINUS : '') + nf2.format(Math.abs(n)).replace('.', ',') + 'x'
}

// Formattazione per tipo di cella (data-excel-type)
export function fmtByType(type, value) {
  switch (type) {
    case 'currency': return fmtCurrency(value)
    case 'percent': return fmtPercent(value)
    case 'number': return fmtNumber(value)
    case 'date':
    case 'text':
    default: return value == null ? '—' : String(value)
  }
}

// Parsing inverso: da stringa visualizzata (it) a numero. Tollera €, %, x, −, spazi.
export function parseNum(s) {
  if (s == null) return null
  if (typeof s === 'number') return s
  let t = String(s).trim()
  if (!t || t === '—') return null
  t = t.replace(/−/g, '-')             // − → -
       .replace(/[€%x\s ]/gi, '')      // simboli e spazi
       .replace(/\.(?=\d{3}(\D|$))/g, '')   // separatore migliaia .
       .replace(',', '.')                   // decimale ,
  const n = Number(t)
  return isNaN(n) ? null : n
}
