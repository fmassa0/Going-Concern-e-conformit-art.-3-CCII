// Layout deterministico del foglio "Input" del template ESSENZIALE.
// Condiviso tra generatore template e import, così le coordinate combaciano
// sempre e l'import può ricalcolare in JS senza dover aprire Excel.
import { MESI } from '../lib/formulas.js'

// Ogni voce: { id, label, value, desc, fmt }  · 'sec' = riga di sezione (senza input)
const RAW = [
  { sec: 'Contesto' },
  { id: 'dataAnalisi', label: 'Data di analisi', value: '31/12/2025', desc: "Data di chiusura/riferimento dell'analisi (consuntivo)." },
  { id: 'orizzonte', label: 'Orizzonte rolling', value: '31/12/2026', desc: 'Data finale dei 12 mesi di verifica prospettica.' },
  { id: 'esercizio', label: 'Esercizio', value: 2025, desc: "Anno dell'ultimo consuntivo." },
  { id: 'mese', label: 'Mese', value: 'DIC', desc: 'Mese di riferimento (es. DIC).' },
  { sec: 'Equilibri alla data (consuntivo)' },
  { id: 'roD', label: 'Reddito operativo €', value: -1105541, desc: 'Risultato della gestione caratteristica (EBIT).', fmt: '#,##0' },
  { id: 'ammD', label: 'Ammortamenti €', value: 32502, desc: 'Ammortamenti del periodo (per il MOL).', fmt: '#,##0' },
  { id: 'accD', label: 'Accantonamenti €', value: 557112, desc: 'Accantonamenti del periodo (per il MOL).', fmt: '#,##0' },
  { id: 'flussoD', label: 'Flusso monetario gest. corrente €', value: 574707, desc: 'Flusso di cassa della gestione corrente post-imposte.', fmt: '#,##0' },
  { id: 'pfnD', label: 'PFN €', value: 2937116, desc: 'Posizione Finanziaria Netta = debiti finanziari − liquidità.', fmt: '#,##0' },
  { id: 'pnD', label: 'Patrimonio netto €', value: -1106371, desc: 'Patrimonio netto contabile alla data.', fmt: '#,##0' },
  { sec: 'Equilibri prospettici (12 mesi)' },
  { id: 'roP', label: 'Reddito operativo € (prev.)', value: -1150915, desc: 'EBIT previsionale a 12 mesi.', fmt: '#,##0' },
  { id: 'ammP', label: 'Ammortamenti € (prev.)', value: 32502, desc: 'Ammortamenti previsionali.', fmt: '#,##0' },
  { id: 'accP', label: 'Accantonamenti € (prev.)', value: 557112, desc: 'Accantonamenti previsionali.', fmt: '#,##0' },
  { id: 'flussoP', label: 'Flusso monetario gest. corrente € (prev.)', value: -587117, desc: 'Flusso di cassa gestione corrente previsionale.', fmt: '#,##0' },
  { id: 'pfnP', label: 'PFN € (prev.)', value: 3558008, desc: 'PFN previsionale a 12 mesi.', fmt: '#,##0' },
  { id: 'pnP', label: 'Patrimonio netto € (prev.)', value: -1106371, desc: 'PN previsionale a 12 mesi.', fmt: '#,##0' },
  { sec: 'Sostenibilità debiti' },
  { id: 'dscr', label: 'DSCR a 12 mesi', value: -7.95, desc: 'Debt Service Coverage Ratio. Soglia ≥ 1.', fmt: '0.00' },
  { id: 'saldoIniz', label: 'Saldo banca iniziale €', value: 55444, desc: 'Saldo c/c di partenza della proiezione.', fmt: '#,##0' },
  { id: 'fido', label: 'Fido accordato €', value: 0, desc: "Affidamento bancario (per l'extra-fido).", fmt: '#,##0' },
  { sec: 'Flusso finanziario netto mensile (entrate − uscite)' },
  ...MESI.map((m) => ({ id: 'flusso_' + m, label: `${m} €`, value: 0, desc: `Flusso netto di cassa previsto a ${m}.`, fmt: '#,##0' })),
  { sec: 'Segnali di allarme (comma 4) — OK / ALLERTA' },
  { id: 'segA', label: 'a) Debiti per retribuzioni scaduti', value: 'OK', desc: 'ALLERTA se > 1/2 monte retributivo mensile, scaduti ≥ 30 gg.' },
  { id: 'segB', label: 'b) Debiti verso fornitori scaduti', value: 'OK', desc: 'ALLERTA se scaduti ≥ 90 gg e > dei non scaduti.' },
  { id: 'segC', label: 'c) Esposizioni verso banche', value: 'OK', desc: 'ALLERTA se scadute/sconfinate ≥ 60 gg e ≥ 5% del totale.' },
  { id: 'segD', label: 'd) Esposizioni v. creditori pubblici qualif.', value: 'OK', desc: 'ALLERTA se ricorre una soglia art. 25-novies.' },
]

// flussi di esempio (mensili) coerenti col dataset di riferimento
const SAMPLE_FLOWS = [-31810, -58132, -58133, -58135, -58136, -58138, -54162, -58141, -58142, -58144, -58146, -59125]

// assegna le righe (prima riga utile = 2; riga 1 = titolo)
export const LAYOUT = (() => {
  let r = 2
  return RAW.map((item) => {
    if (item.sec) return { ...item, row: r++ }
    const flowIdx = item.id.startsWith('flusso_') ? MESI.indexOf(item.id.slice(7)) : -1
    const value = flowIdx >= 0 ? SAMPLE_FLOWS[flowIdx] : item.value
    return { ...item, value, row: r++ }
  })
})()

export const FIELD_ROW = Object.fromEntries(LAYOUT.filter((x) => x.id).map((x) => [x.id, x.row]))
