// ============================================================
// Formule del modello di continuità (interpretazione Ingenia).
// Usate dal form manuale e rispecchiate nel template Excel "essenziale".
//
// NOTA METODOLOGICA: la proiezione di cassa segue esattamente la logica del
// modello (saldo cumulato, extra-fido, verifica insolvenza), verificata sui
// dati di riferimento. I verdetti sui tre equilibri adottano una regola
// esplicita e documentata: poiché alcune celle-verdetto dell'export originale
// risultano opache, qui si privilegia una logica trasparente e ripetibile.
// La via 100% fedele resta l'import del workbook compilato (template completo).
// ============================================================

export const MESI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']
export const SOGLIA_PFN_MOL = 4

// Righe ART3 della tabella tesoreria (GEN..DIC = 72..83)
const CASH_ROW0 = 72

const vEcon = (ro) => (ro >= 0 ? 'EQUILIBRIO ECONOMICO' : 'SQUILIBRIO ECONOMICO')
const vFin = (fl) => (fl >= 0 ? 'EQUILIBRIO FINANZIARIO' : 'SQUILIBRIO FINANZIARIO')
// Patrimoniale: squilibrio se PN<0, oppure MOL<=0 (leva non sostenibile),
// oppure |PFN/MOL| supera la soglia di mercato.
const vPatr = (pn, mol, pfn) => {
  const ratio = mol !== 0 ? pfn / mol : Infinity
  const bad = pn < 0 || mol <= 0 || Math.abs(ratio) > SOGLIA_PFN_MOL
  return bad ? 'SQUILIBRIO PATRIMONIALE' : 'EQUILIBRIO PATRIMONIALE'
}
const pfnMol = (pfn, mol) => (mol > 0 ? pfn / mol : 'n.s.')

// inputs: { dataAnalisi, orizzonte, esercizio, mese,
//   data:{ro,amm,acc,flusso,pfn,pn}, prev:{ro,amm,acc,flusso,pfn,pn},
//   dscr, cassa:{saldoIniziale, fido, flussi:[12]},
//   segnali:[{flag,det} x4] }
export function compute(inp) {
  const patch = {}
  const set = (k, v) => { patch[k] = v }

  // --- 01 · Equilibri alla data (2025) ---
  if (inp.data) {
    const d = inp.data
    const molD = num(d.ro) + num(d.amm) + num(d.acc)
    set('ART3!G12', num(d.ro)); set('ART3!J12', vEcon(num(d.ro)))
    set('ART3!G23', num(d.flusso)); set('ART3!J23', vFin(num(d.flusso)))
    set('ART3!G29', num(d.pfn)); set('ART3!G30', molD)
    set('ART3!J31', vPatr(num(d.pn), molD, num(d.pfn)))
    set('ART3!G31', fmtRatioText(pfnMol(num(d.pfn), molD)))
    // riflesso nel CE (reddito operativo 2025) e PFN
    set('CE!G39', num(d.ro))
  }
  // --- 01 · Equilibri prospettici (2026) ---
  if (inp.prev) {
    const p = inp.prev
    const molP = num(p.ro) + num(p.amm) + num(p.acc)
    set('ART3!G57', num(p.ro)); set('ART3!J57', vEcon(num(p.ro)))
    set('ART3!G60', num(p.flusso)); set('ART3!J60', vFin(num(p.flusso)))
    set('ART3!G64', num(p.pfn)); set('ART3!G65', molP)
    set('ART3!J66', vPatr(num(p.pn), molP, num(p.pfn)))
    set('ART3!G66', typeof pfnMol(num(p.pfn), molP) === 'number' ? pfnMol(num(p.pfn), molP) : 'n.s.')
  }

  // --- 03 · Proiezione di cassa mensile (logica fedele) ---
  if (inp.cassa) {
    const { saldoIniziale = 0, fido = 0, flussi = [] } = inp.cassa
    let saldo = num(saldoIniziale)
    for (let i = 0; i < 12; i++) {
      const fl = num(flussi[i])
      saldo += fl
      const disp = saldo + num(fido)
      const extra = disp < 0 ? disp : 0
      const verifica = disp < 0 ? 'INSOLVENZA' : 'OK'
      const r = CASH_ROW0 + i
      set(`ART3!C${r}`, num(inp.esercizio) ? num(inp.esercizio) + 1 : 2026)
      set(`ART3!D${r}`, MESI[i])
      set(`ART3!E${r}`, fl)
      set(`ART3!F${r}`, saldo)
      set(`ART3!G${r}`, extra)
      set(`ART3!H${r}`, verifica)
    }
    set('ART3!F83', saldo)
  }

  // --- 02 · Segnali di allarme (comma 4) ---
  if (inp.segnali) {
    const cells = [['J44', 'K44'], ['J45', 'K45'], ['J46', 'K46'], ['J47', 'K47']]
    inp.segnali.forEach((s, i) => {
      if (!s) return
      set(`ART3!${cells[i][0]}`, s.flag || 'OK')
      if (s.det) set(`ART3!${cells[i][1]}`, s.det)
    })
  }

  // --- DSCR (sez. 05) ---
  if (inp.dscr != null && inp.dscr !== '') set('RF (2)!C62', num(inp.dscr))

  // --- date / contesto (MENU) ---
  if (inp.dataAnalisi) set('MENU!H8', inp.dataAnalisi)
  if (inp.orizzonte) set('MENU!M8', inp.orizzonte)
  if (inp.esercizio) set('MENU!H4', num(inp.esercizio))
  if (inp.mese) set('MENU!H6', inp.mese)

  return patch
}

function num(v) {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  const n = Number(String(v).replace(/−/g, '-').replace(/[€%\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function fmtRatioText(r) {
  if (r === 'n.s.') return 'n.s. · MOL ≤ 0'
  return r
}
