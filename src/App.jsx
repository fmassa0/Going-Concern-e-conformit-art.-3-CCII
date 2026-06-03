import { useEffect, useRef, useState, useCallback } from 'react'
import IngeniaMark from './components/IngeniaMark.jsx'
import ManualForm from './components/ManualForm.jsx'
import { DASHBOARD_HTML } from './data/dashboardMarkup.js'
import { RELAZIONE_HTML } from './data/relazioneMarkup.js'
import { exportRelazioneDoc } from './lib/wordExport.js'
import { applyModel } from './lib/bind.js'
import { mountCharts } from './lib/charts.js'
// exceljs è pesante: i moduli che lo usano sono caricati on-demand (code-split).

const ANCHORS = [
  ['art3', 'Esito Art. 3'], ['allarmi', 'Segnali'], ['cassa', 'Sostenibilità'],
  ['pfn', 'PFN'], ['rf', 'Rendiconto'], ['redd', 'Redditività'],
  ['ce', 'Conto Economico'], ['sp', 'Patrimoniale'],
]

export default function App() {
  const [model, setModel] = useState(null)     // null = dataset sample (markup verbatim)
  const [showRel, setShowRel] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showTpl, setShowTpl] = useState(false)
  const [toast, setToast] = useState(null)
  const dashRef = useRef(null)
  const relRef = useRef(null)
  const fileRef = useRef(null)

  const notify = useCallback((msg, kind = '') => {
    setToast({ msg, kind })
    window.clearTimeout(notify._t)
    notify._t = window.setTimeout(() => setToast(null), 3600)
  }, [])

  // Bind dei valori + grafici a ogni cambio dataset.
  useEffect(() => {
    if (!dashRef.current) return
    if (model) applyModel(dashRef.current, model)
    mountCharts(dashRef.current, model)
  }, [model])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { importWorkbook } = await import('./lib/excelImport.js')
      const { model: m, count } = await importWorkbook(file)
      setModel(m)
      notify(`Workbook importato · ${count} valori aggiornati`, 'good')
    } catch (err) {
      console.error(err)
      notify('Import non riuscito: ' + (err?.message || 'file non valido'), 'bad')
    }
  }

  const onTemplate = async (kind) => {
    setShowTpl(false)
    try {
      const mod = await import('./lib/excelTemplate.js')
      if (kind === 'completo') await mod.downloadCompleteTemplate()
      else await mod.downloadEssentialTemplate()
      notify(`Template ${kind === 'completo' ? 'completo' : 'essenziale'} scaricato`, 'good')
    } catch (err) {
      console.error(err)
      notify('Generazione template non riuscita', 'bad')
    }
  }

  const onRelExport = () => {
    exportRelazioneDoc(relRef.current)
    notify('Relazione esportata in Word (.doc)', 'good')
  }

  return (
    <>
      <header className="top">
        <div className="top-in">
          <a className="ing-logo" href="https://www.ingenia.cloud" target="_blank" rel="noreferrer">
            <IngeniaMark />
            <span className="brand">
              <span className="ey">Ingenia · Codice della Crisi</span>
              <span className="nm">Continuità Aziendale &amp; Art. 3 CCII</span>
            </span>
          </a>
          <nav className="anchors">
            {ANCHORS.map(([id, label]) => (
              <a key={id} href={'#' + id}>{label}</a>
            ))}
          </nav>
          <div className="tools">
            <button className="btn" onClick={() => fileRef.current?.click()} title="Carica un workbook compilato">
              <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              Importa Excel
            </button>
            <div style={{ position: 'relative' }}>
              <button className="btn" onClick={() => setShowTpl((v) => !v)} title="Scarica il modello da compilare">
                <svg viewBox="0 0 24 24"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5" /></svg>
                Template ▾
              </button>
              {showTpl && (
                <div className="tpl-menu" onMouseLeave={() => setShowTpl(false)}>
                  <button onClick={() => onTemplate('essenziale')}>
                    <b>Essenziale</b><span>Calcolatore: pochi input + formule</span>
                  </button>
                  <button onClick={() => onTemplate('completo')}>
                    <b>Completo</b><span>Tutte le celle del modello, mappate 1:1</span>
                  </button>
                </div>
              )}
            </div>
            <button className="btn" onClick={() => setShowForm(true)} title="Inserisci i dati manualmente">
              <svg viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              Dati manuali
            </button>
            <button className="btn" onClick={() => window.print()} title="Stampa / salva in PDF">
              <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
              PDF
            </button>
            <button className="relbtn" onClick={() => setShowRel(true)} title="Apri ed esporta la relazione">
              <svg viewBox="0 0 24 24"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 13h6M9 17h4" /></svg>
              Relazione
            </button>
          </div>
        </div>
      </header>

      <input ref={fileRef} type="file" accept=".xlsx,.xlsm" hidden onChange={onFile} />

      {/* Dashboard (sezioni 01-08) — markup del modello, valori bind-ati */}
      <div className="wrap-host" ref={dashRef} dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }} />

      <div className="wrap">
        <div className="ing-foot">
          <IngeniaMark />
          <span>
            Cruscotto direzionale a cura di <b>Ingenia S.r.l.</b> · Monitoraggio della continuità
            aziendale e conformità all'art. 3 D.Lgs. 14/2019 (CCII). Strumento di analisi: non
            sostituisce il giudizio professionale.
          </span>
        </div>
      </div>

      {/* Sorgente nascosta della Relazione (per export Word) */}
      <div ref={relRef} style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: RELAZIONE_HTML }} />

      {/* Modale Relazione */}
      {showRel && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setShowRel(false)}>
          <div className="modal">
            <div className="modal-h">
              <h3>Relazione sulla continuità aziendale</h3>
              <button className="relbtn" onClick={onRelExport}>
                <svg viewBox="0 0 24 24"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /></svg>
                Esporta Word
              </button>
              <button className="x" onClick={() => setShowRel(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="rel-render" dangerouslySetInnerHTML={{ __html: RELAZIONE_HTML }} />
            </div>
          </div>
        </div>
      )}

      {/* Modale dati manuali */}
      {showForm && (
        <ManualForm
          initial={model}
          onClose={() => setShowForm(false)}
          onApply={(m) => { setModel(m); setShowForm(false); notify('Dati applicati alla dashboard', 'good') }}
        />
      )}

      {toast && <div className={'toast show ' + (toast.kind || '')}>{toast.msg}</div>}
    </>
  )
}
