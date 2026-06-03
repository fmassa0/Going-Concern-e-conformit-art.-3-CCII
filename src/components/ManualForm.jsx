// Form di inserimento manuale → ricalcolo formule (interpretazione Ingenia)
// → patch del modello applicato alla dashboard. Precompilato col dataset corrente.
import { useState } from 'react'
import { SAMPLE } from '../data/cellValues.js'
import { compute, MESI } from '../lib/formulas.js'

const n = (k, d = 0) => (typeof SAMPLE[k] === 'number' ? SAMPLE[k] : d)
const s = (k, d = '') => (SAMPLE[k] != null ? String(SAMPLE[k]) : d)

function initState(base) {
  const g = (k, d) => (base && base[k] != null ? base[k] : (SAMPLE[k] != null ? SAMPLE[k] : d))
  return {
    dataAnalisi: g('MENU!H8', '31/12/2025'),
    orizzonte: g('MENU!M8', '31/12/2026'),
    esercizio: g('MENU!H4', 2025),
    mese: g('MENU!H6', 'DIC'),
    data: { ro: n('ART3!G12'), amm: 32502, acc: 557112, flusso: n('ART3!G23'), pfn: n('ART3!G29'), pn: n('SP!G62') },
    prev: { ro: n('ART3!G57'), amm: 32502, acc: 557112, flusso: n('ART3!G60'), pfn: n('ART3!G64'), pn: n('SP!G62') },
    dscr: n('RF (2)!C62', -7.95),
    cassa: {
      saldoIniziale: 55444, fido: 0,
      flussi: MESI.map((_, i) => n(`ART3!E${72 + i}`)),
    },
    segnali: [
      { flag: s('ART3!J44', 'OK'), det: s('ART3!K44', 'NO DEBITI SCADUTI') },
      { flag: s('ART3!J45', 'OK'), det: s('ART3!K45', 'NO DEBITI SCADUTI') },
      { flag: s('ART3!J46', 'OK'), det: s('ART3!K46', 'NO ESPOSIZIONI DEBITORIE') },
      { flag: s('ART3!J47', 'OK'), det: s('ART3!K47', 'NO ESPOSIZIONI DEBITORIE') },
    ],
  }
}

const SEG_LABELS = [
  'a) Debiti per retribuzioni scaduti',
  'b) Debiti verso fornitori scaduti',
  'c) Esposizioni verso banche / intermediari',
  'd) Esposizioni verso creditori pubblici qualificati',
]

function Num({ label, hint, value, onChange }) {
  return (
    <div className="frow">
      <label>{label}</label>
      <input type="text" inputMode="decimal" value={value}
        onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export default function ManualForm({ initial, onClose, onApply }) {
  const [st, setSt] = useState(() => initState(initial))
  const upd = (patch) => setSt((p) => ({ ...p, ...patch }))
  const updObj = (key, patch) => setSt((p) => ({ ...p, [key]: { ...p[key], ...patch } }))
  const updFlusso = (i, v) => setSt((p) => {
    const flussi = [...p.cassa.flussi]; flussi[i] = v
    return { ...p, cassa: { ...p.cassa, flussi } }
  })
  const updSeg = (i, patch) => setSt((p) => {
    const segnali = p.segnali.map((x, j) => (j === i ? { ...x, ...patch } : x))
    return { ...p, segnali }
  })

  const apply = () => {
    const patch = compute(st)
    const base = initial && Object.keys(initial).length ? initial : SAMPLE
    onApply({ ...base, ...patch })
  }

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-h">
          <h3>Inserimento dati manuale</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="form-intro">
            Compila i valori e premi <b>Applica</b>: la dashboard ricalcola equilibri, proiezione di
            cassa e segnali secondo le formule del modello (interpretazione Ingenia). Per un
            aggiornamento integrale e 1:1 usa invece <b>Template completo</b> → <b>Importa Excel</b>.
          </p>

          <div className="form-grp">
            <h4>Contesto</h4>
            <div className="form-rows">
              <Num label="Data di analisi" value={st.dataAnalisi} onChange={(v) => upd({ dataAnalisi: v })} />
              <Num label="Orizzonte rolling" value={st.orizzonte} onChange={(v) => upd({ orizzonte: v })} />
              <Num label="Esercizio" value={st.esercizio} onChange={(v) => upd({ esercizio: v })} />
              <Num label="Mese" value={st.mese} onChange={(v) => upd({ mese: v })} />
            </div>
          </div>

          {[['data', 'Equilibri alla data (consuntivo)'], ['prev', 'Equilibri prospettici (12 mesi)']].map(([key, title]) => (
            <div className="form-grp" key={key}>
              <h4>{title}</h4>
              <p className="gd">MOL = Reddito operativo + Ammortamenti + Accantonamenti. Verdetti calcolati su segno e soglia PFN/MOL = 4.</p>
              <div className="form-rows">
                <Num label="Reddito operativo €" value={st[key].ro} onChange={(v) => updObj(key, { ro: v })} />
                <Num label="Ammortamenti €" value={st[key].amm} onChange={(v) => updObj(key, { amm: v })} />
                <Num label="Accantonamenti €" value={st[key].acc} onChange={(v) => updObj(key, { acc: v })} />
                <Num label="Flusso monetario gest. corrente €" value={st[key].flusso} onChange={(v) => updObj(key, { flusso: v })} />
                <Num label="PFN €" value={st[key].pfn} onChange={(v) => updObj(key, { pfn: v })} />
                <Num label="Patrimonio netto €" value={st[key].pn} onChange={(v) => updObj(key, { pn: v })} />
              </div>
            </div>
          ))}

          <div className="form-grp">
            <h4>Sostenibilità dei debiti — proiezione di cassa 12 mesi</h4>
            <p className="gd">Saldo[mese] = Saldo precedente + Flusso. Extra-fido = min(0, Saldo + Fido). Verifica = INSOLVENZA se Saldo + Fido &lt; 0.</p>
            <div className="form-rows">
              <Num label="Saldo banca iniziale €" value={st.cassa.saldoIniziale} onChange={(v) => updObj('cassa', { saldoIniziale: v })} />
              <Num label="Fido accordato €" value={st.cassa.fido} onChange={(v) => updObj('cassa', { fido: v })} />
              <Num label="DSCR a 12 mesi" hint="soglia ≥ 1" value={st.dscr} onChange={(v) => upd({ dscr: v })} />
            </div>
            <p className="gd" style={{ marginTop: 12 }}>Flusso finanziario netto mensile (entrate − uscite):</p>
            <div className="form-rows">
              {MESI.map((m, i) => (
                <Num key={m} label={`${m} €`} value={st.cassa.flussi[i]} onChange={(v) => updFlusso(i, v)} />
              ))}
            </div>
          </div>

          <div className="form-grp">
            <h4>Segnali di allarme (art. 3, comma 4)</h4>
            <div className="form-rows">
              {SEG_LABELS.map((lab, i) => (
                <div className="frow" key={i}>
                  <label>{lab}</label>
                  <select value={st.segnali[i].flag} onChange={(e) => updSeg(i, { flag: e.target.value, det: e.target.value === 'OK' ? st.segnali[i].det : 'SEGNALE ATTIVO' })}
                    style={{ fontFamily: 'var(--mono)', fontSize: 13, padding: '8px 10px', border: '1px solid var(--line2)', borderRadius: 8 }}>
                    <option value="OK">OK — nessun segnale</option>
                    <option value="ALLERTA">ALLERTA — segnale attivo</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn" onClick={onClose}>Annulla</button>
            <button className="btn primary" onClick={apply}>Applica alla dashboard</button>
          </div>
        </div>
      </div>
    </div>
  )
}
