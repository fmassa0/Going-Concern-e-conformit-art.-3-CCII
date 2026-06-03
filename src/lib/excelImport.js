// Import di un workbook Excel → modello { "FOGLIO!CELLA": valore }.
//  · Template ESSENZIALE (ha foglio "Input"): legge gli input e ricalcola in JS
//    con le formule del modello — funziona anche senza che Excel abbia ricalcolato.
//  · Template COMPLETO / altri: legge i valori (anche risultati di formula) dalle
//    celle mappate. I valori mancanti restano sul dataset di riferimento.
import ExcelJS from 'exceljs'
import { SAMPLE, TYPES } from '../data/cellValues.js'
import { FIELD_ROW } from '../data/essentialLayout.js'
import { compute, MESI } from './formulas.js'

function cellValue(cell) {
  const v = cell?.value
  if (v == null) return null
  if (typeof v === 'object') {
    if ('result' in v) return v.result
    if ('text' in v) return v.text
    if (v instanceof Date) return v
    if ('error' in v) return null
  }
  return v
}

export async function importWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buf)

  const inputWs = wb.getWorksheet('Input')
  if (inputWs) {
    const model = fromEssential(inputWs)
    return { model, count: Object.keys(model).length, mode: 'essenziale' }
  }

  // lettura diretta delle celle mappate (template completo / export)
  const read = {}
  let count = 0
  for (const key of Object.keys(TYPES)) {
    const [sheet, addr] = key.split('!')
    const ws = wb.getWorksheet(sheet)
    if (!ws) continue
    const raw = cellValue(ws.getCell(addr))
    if (raw == null || raw === '') continue
    read[key] = raw instanceof Date ? raw.toLocaleDateString('it-IT') : raw
    count++
  }
  if (count === 0) throw new Error('nessun foglio/cella riconosciuto — usa un template Ingenia')
  return { model: { ...SAMPLE, ...read }, count, mode: 'diretto' }
}

function fromEssential(ws) {
  const B = (id) => cellValue(ws.getCell(`B${FIELD_ROW[id]}`))
  const inp = {
    dataAnalisi: B('dataAnalisi'),
    orizzonte: B('orizzonte'),
    esercizio: B('esercizio'),
    mese: B('mese'),
    data: { ro: B('roD'), amm: B('ammD'), acc: B('accD'), flusso: B('flussoD'), pfn: B('pfnD'), pn: B('pnD') },
    prev: { ro: B('roP'), amm: B('ammP'), acc: B('accP'), flusso: B('flussoP'), pfn: B('pfnP'), pn: B('pnP') },
    dscr: B('dscr'),
    cassa: {
      saldoIniziale: B('saldoIniz'),
      fido: B('fido'),
      flussi: MESI.map((m) => B('flusso_' + m)),
    },
    segnali: ['segA', 'segB', 'segC', 'segD'].map((id) => ({ flag: B(id) || 'OK' })),
  }
  const patch = compute(inp)
  return { ...SAMPLE, ...patch }
}
