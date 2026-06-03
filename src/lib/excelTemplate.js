// Generatore dei template Excel Ingenia.
//  · ESSENZIALE  — calcolatore: pochi input + formule che producono gli output
//                  di testa sulle coordinate lette dalla dashboard.
//  · COMPLETO    — data-entry: tutte le ~294 celle del modello mappate 1:1,
//                  pre-compilate con l'esempio, etichettate e annotate.
// Entrambi includono fogli Istruzioni e un disclaimer per l'utente.
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { SAMPLE, TYPES } from '../data/cellValues.js'
import { LABELS } from '../data/cellLabels.js'
import { MESI } from './formulas.js'
import { LAYOUT, FIELD_ROW } from '../data/essentialLayout.js'

const IN = (id) => `Input!B${FIELD_ROW[id]}`

const ING = '6B5BCE'
const ING2 = '2FAE9B'
const INK = '15233A'

const DISCLAIMER = [
  'DISCLAIMER — Strumento Ingenia S.r.l. a supporto del monitoraggio della continuità aziendale ex art. 3 D.Lgs. 14/2019 (CCII).',
  'I valori e le formule costituiscono un modello di analisi: non sostituiscono il giudizio professionale dell\'organo amministrativo, del revisore o del consulente.',
  'Le soglie (es. PFN/MOL = 4, DSCR ≥ 1) sono prassi di mercato/normativa recepite dal modello; verificarne l\'applicabilità al caso concreto.',
  'I dati di esempio si riferiscono a un\'azienda fittizia e vanno integralmente sostituiti con quelli reali.',
  'Ingenia S.r.l. non risponde di decisioni assunte sulla base dei risultati prodotti dallo strumento.',
]

function styleHeader(ws, row, cells) {
  cells.forEach((c) => {
    const cell = ws.getCell(c.col + row)
    cell.value = c.v
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + INK } }
    cell.alignment = { vertical: 'middle' }
  })
}

function addIstruzioni(wb, kind) {
  const ws = wb.addWorksheet('Istruzioni', { properties: { tabColor: { argb: 'FF' + ING } } })
  ws.columns = [{ width: 4 }, { width: 100 }]
  let r = 1
  const line = (t, opts = {}) => {
    const cell = ws.getCell(`B${r}`)
    cell.value = t
    cell.font = { size: opts.size || 11, bold: !!opts.bold, color: { argb: 'FF' + (opts.color || '1C2230') }, italic: !!opts.italic }
    cell.alignment = { wrapText: true, vertical: 'top' }
    if (opts.h) ws.getRow(r).height = opts.h
    r++
  }
  line('INGENIA · Monitoraggio Continuità Aziendale & Art. 3 CCII', { bold: true, size: 16, color: ING })
  line(kind === 'essenziale' ? 'Template ESSENZIALE — calcolatore' : 'Template COMPLETO — data-entry', { bold: true, size: 12, color: ING2 })
  r++
  if (kind === 'essenziale') {
    line('Come si usa:', { bold: true })
    line('1. Apri il foglio "Input" e compila solo le celle gialle con i dati della tua azienda.')
    line('2. I fogli del modello (MENU, ART3, CE, RF (2)) contengono FORMULE che ricalcolano automaticamente equilibri, MOL, PFN/MOL, proiezione di cassa e segnali.')
    line('3. Salva il file (mantieni .xlsx) e caricalo nella dashboard con "Importa Excel".')
    line('Nota: lascia che Excel ricalcoli (apri e salva) prima di caricare, così i risultati delle formule vengono memorizzati.')
  } else {
    line('Come si usa:', { bold: true })
    line('1. Ogni foglio replica la struttura del modello: ogni cella valorizzata corrisponde 1:1 a un dato della dashboard.')
    line('2. Sostituisci i valori di esempio con quelli reali, mantenendo le posizioni (le coordinate non vanno spostate).')
    line('3. Passa il mouse su una cella per vedere la descrizione (commento). Il foglio "Legenda" elenca tutte le celle.')
    line('4. Salva (.xlsx) e caricalo nella dashboard con "Importa Excel": l\'intera dashboard verrà popolata.')
    line('I valori derivati (totali, indici, verdetti) qui sono numeri di esempio: vanno coerentemente aggiornati o ricalcolati col tuo gestionale/bilancio.')
  }
  r++
  line('— DISCLAIMER —', { bold: true, color: 'B8362B' })
  DISCLAIMER.forEach((d) => line(d, { italic: true, color: '5B6678', h: 30 }))
  return ws
}

// ---------------- TEMPLATE ESSENZIALE ----------------
export async function downloadEssentialTemplate() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Ingenia S.r.l.'
  addIstruzioni(wb, 'essenziale')

  // --- Foglio Input (da LAYOUT condiviso con l'import) ---
  const inp = wb.addWorksheet('Input', { properties: { tabColor: { argb: 'FF' + ING2 } } })
  inp.columns = [{ width: 42 }, { width: 18 }, { width: 60 }]
  inp.getCell('A1').value = 'COMPILA LE CELLE GIALLE'
  inp.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FF' + ING } }
  const YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7CC' } }
  const GREY = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEEF5' } }
  for (const it of LAYOUT) {
    if (it.sec) {
      const c = inp.getCell(`A${it.row}`); c.value = it.sec; c.font = { bold: true, color: { argb: 'FF' + INK } }
      ;['A', 'B', 'C'].forEach((col) => { inp.getCell(`${col}${it.row}`).fill = GREY })
      continue
    }
    inp.getCell(`A${it.row}`).value = it.label
    const b = inp.getCell(`B${it.row}`)
    b.value = it.value; b.fill = YELLOW
    b.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, color: { argb: 'FFCFD5E0' } }
    if (it.fmt) b.numFmt = it.fmt
    const c = inp.getCell(`C${it.row}`); c.value = it.desc; c.font = { italic: true, size: 9, color: { argb: 'FF8A93A4' } }
  }

  // --- Fogli modello con formule verso Input ---
  const menu = wb.addWorksheet('MENU')
  menu.getCell('H8').value = { formula: IN('dataAnalisi') }
  menu.getCell('M8').value = { formula: IN('orizzonte') }
  menu.getCell('H4').value = { formula: IN('esercizio') }
  menu.getCell('H6').value = { formula: IN('mese') }
  menu.getCell('B8').value = 'OK'
  menu.getCell('D1').value = 'Ingenia · ed. 2025'

  const art3 = wb.addWorksheet('ART3')
  const F = (cell, formula) => { art3.getCell(cell).value = { formula } }
  // consuntivo
  F('G12', IN('roD'))
  F('J12', `IF(${IN('roD')}>=0,"EQUILIBRIO ECONOMICO","SQUILIBRIO ECONOMICO")`)
  F('G23', IN('flussoD'))
  F('J23', `IF(${IN('flussoD')}>=0,"EQUILIBRIO FINANZIARIO","SQUILIBRIO FINANZIARIO")`)
  F('G29', IN('pfnD'))
  F('G30', `${IN('roD')}+${IN('ammD')}+${IN('accD')}`)
  F('J31', `IF(OR(${IN('pnD')}<0,G30<=0,ABS(G29/G30)>4),"SQUILIBRIO PATRIMONIALE","EQUILIBRIO PATRIMONIALE")`)
  F('G31', `IF(G30>0,TEXT(G29/G30,"0.00")&"x","n.s.")`)
  // prospettico
  F('G57', IN('roP'))
  F('J57', `IF(${IN('roP')}>=0,"EQUILIBRIO ECONOMICO","SQUILIBRIO ECONOMICO")`)
  F('G60', IN('flussoP'))
  F('J60', `IF(${IN('flussoP')}>=0,"EQUILIBRIO FINANZIARIO","SQUILIBRIO FINANZIARIO")`)
  F('G64', IN('pfnP'))
  F('G65', `${IN('roP')}+${IN('ammP')}+${IN('accP')}`)
  F('J66', `IF(OR(${IN('pnP')}<0,G65<=0,ABS(G64/G65)>4),"SQUILIBRIO PATRIMONIALE","EQUILIBRIO PATRIMONIALE")`)
  F('G66', `IF(G65>0,G64/G65,"n.s.")`)
  // cassa mensile righe 72..83
  for (let i = 0; i < 12; i++) {
    const r = 72 + i
    F(`C${r}`, `${IN('esercizio')}+1`)
    art3.getCell(`D${r}`).value = MESI[i]
    F(`E${r}`, IN('flusso_' + MESI[i]))
    if (i === 0) F(`F${r}`, `${IN('saldoIniz')}+E${r}`)
    else F(`F${r}`, `F${r - 1}+E${r}`)
    F(`G${r}`, `IF(F${r}+${IN('fido')}<0,F${r}+${IN('fido')},0)`)
    F(`H${r}`, `IF(F${r}+${IN('fido')}<0,"INSOLVENZA","OK")`)
  }
  // segnali
  const segDet = ['NO DEBITI SCADUTI', 'NO DEBITI SCADUTI', 'NO ESPOSIZIONI DEBITORIE', 'NO ESPOSIZIONI DEBITORIE']
  const segIds = ['segA', 'segB', 'segC', 'segD']
  ;[44, 45, 46, 47].forEach((rr, i) => {
    F(`J${rr}`, IN(segIds[i]))
    F(`K${rr}`, `IF(${IN(segIds[i])}="OK","${segDet[i]}","SEGNALE ATTIVO ALLA DATA")`)
  })

  const rf2 = wb.addWorksheet('RF (2)')
  rf2.getCell('C62').value = { formula: IN('dscr') }

  await save(wb, 'Template_Essenziale_Continuita_Ingenia.xlsx')
}

// ---------------- TEMPLATE COMPLETO ----------------
export async function downloadCompleteTemplate() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Ingenia S.r.l.'
  addIstruzioni(wb, 'completo')

  // raggruppa le chiavi per foglio
  const bySheet = {}
  for (const key of Object.keys(TYPES)) {
    const [sheet, addr] = key.split('!')
    ;(bySheet[sheet] ||= []).push({ key, addr, type: TYPES[key] })
  }

  // Legenda
  const leg = wb.addWorksheet('Legenda', { properties: { tabColor: { argb: 'FF' + ING } } })
  leg.columns = [{ header: 'Foglio', width: 14 }, { header: 'Cella', width: 9 }, { header: 'Descrizione', width: 52 }, { header: 'Tipo', width: 12 }, { header: 'Esempio', width: 18 }]
  styleHeader(leg, 1, [{ col: 'A', v: 'Foglio' }, { col: 'B', v: 'Cella' }, { col: 'C', v: 'Descrizione' }, { col: 'D', v: 'Tipo' }, { col: 'E', v: 'Esempio' }])
  let lr = 2

  for (const [sheet, cells] of Object.entries(bySheet)) {
    const ws = wb.addWorksheet(sheet)
    for (const { key, addr, type } of cells) {
      const cell = ws.getCell(addr)
      cell.value = SAMPLE[key]
      cell.numFmt = numFmtFor(type)
      const desc = (LABELS[key] && LABELS[key].label) || sheet
      cell.note = `${desc}\n(${type})`
      // legenda
      leg.getCell(`A${lr}`).value = sheet
      leg.getCell(`B${lr}`).value = addr
      leg.getCell(`C${lr}`).value = desc
      leg.getCell(`D${lr}`).value = type
      leg.getCell(`E${lr}`).value = SAMPLE[key]
      leg.getCell(`E${lr}`).numFmt = numFmtFor(type)
      lr++
    }
  }

  await save(wb, 'Template_Completo_Continuita_Ingenia.xlsx')
}

// ---------------- helpers ----------------
function numFmtFor(type) {
  if (type === 'currency') return '#,##0'
  if (type === 'percent') return '0.0"%"'
  if (type === 'number') return '#,##0.##'
  return undefined
}
async function save(wb, name) {
  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name)
}

// retro-compat (toolbar usa direttamente le due funzioni)
export const downloadTemplate = downloadEssentialTemplate
