# Going Concern & Conformità Art. 3 CCII — Cruscotto direzionale

Cruscotto direzionale per la **verifica della continuità aziendale** e la **conformità
all'art. 3 del Codice della Crisi d'Impresa e dell'Insolvenza** (D.Lgs. 14/2019), a cura di
**Ingenia S.r.l.**

Verifica i tre equilibri (economico, finanziario, patrimoniale) alla data di bilancio e in
proiezione rolling a 12 mesi, i segnali di allarme ex art. 3 comma 4, la sostenibilità dei
debiti (proiezione di cassa mese per mese con extra-fido e test di insolvenza), PFN/leva,
rendiconto finanziario, indici di redditività e stato patrimoniale. Genera inoltre la
**Relazione sulla continuità aziendale** esportabile in Word.

## Stack

Vite + React 18 + Chart.js. Import/export Excel con ExcelJS, export Word/PDF lato client.
Nessun backend: gira interamente nel browser.

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # build di produzione in dist/
npm run preview  # anteprima del build
```

## Come funziona (dati dinamici)

Ogni valore della dashboard è agganciato a una coordinata `FOGLIO!CELLA`. Sono previste tre
modalità per alimentare il cruscotto:

1. **Importa Excel** — carica un workbook compilato. L'app legge le celle mappate e ripopola
   dashboard, semafori e grafici.
2. **Template** (due varianti, entrambe con foglio *Istruzioni* e *disclaimer*):
   - **Essenziale** — un *calcolatore*: compili poche celle nel foglio `Input` e le formule
     del modello producono automaticamente equilibri, MOL, PFN/MOL, proiezione di cassa e
     segnali. L'import lo riconosce e ricalcola anche senza che Excel abbia rigenerato le
     formule.
   - **Completo** — *data-entry*: tutte le ~294 celle del modello mappate 1:1, pre-compilate
     con un esempio, etichettate e con note. Sostituendo i valori e ricaricando si popola
     l'intera dashboard.
3. **Dati manuali** — form guidato che ricalcola in tempo reale gli output di testa.

All'avvio è caricato un **dataset di esempio** (azienda fittizia), così il cruscotto è
immediatamente esplorabile.

## Metriche e formule

- **MOL** = Reddito operativo + Ammortamenti + Accantonamenti
- **PFN / MOL** con soglia di mercato = 4 (oltre la quale → squilibrio patrimoniale)
- **Equilibrio economico**: segno del reddito operativo
- **Equilibrio finanziario**: segno del flusso monetario della gestione corrente
- **Equilibrio patrimoniale**: PN < 0, oppure MOL ≤ 0, oppure |PFN/MOL| > soglia
- **Proiezione di cassa**: `Saldo[mese] = Saldo precedente + Flusso`,
  `Extra-fido = min(0, Saldo + Fido)`, `Verifica = INSOLVENZA se Saldo + Fido < 0`
- **DSCR** a 12 mesi, soglia di sostenibilità ≥ 1
- **Segnali di allarme** (art. 3 comma 4, lett. a–d), inclusi i rinvii all'art. 25-novies

> **Nota metodologica.** La via fedele al 100% è l'import del workbook compilato (template
> completo): i valori provengono dal modello/gestionale. Il template essenziale e il form
> usano una **interpretazione esplicita e documentata** delle formule: alcune celle-verdetto
> dell'export originale risultavano opache, qui si privilegia una logica trasparente e
> ripetibile. Le soglie (PFN/MOL = 4, DSCR ≥ 1) sono prassi recepite dal modello: verificarne
> l'applicabilità al caso concreto. Lo strumento non sostituisce il giudizio professionale.

## Struttura

```
src/
  App.jsx                  shell: header Ingenia, toolbar, modali, stato
  components/
    IngeniaMark.jsx        marchio ">_" gradiente viola→teal
    ManualForm.jsx         form di inserimento dati + ricalcolo
  data/
    dashboardMarkup.js     markup sezioni 01-08 (rebrandizzato)
    relazioneMarkup.js     Relazione continuità (rebrandizzata)
    cellValues.js          dataset di esempio + tipi cella
    cellLabels.js          etichette best-effort per cella (note template)
    essentialLayout.js     layout del foglio Input (condiviso template/import)
  lib/
    format.js              formattazione € / % / numeri (it)
    formulas.js            formule del modello (MOL, PFN/MOL, cassa, equilibri…)
    bind.js                bind valori + semafori sul markup
    charts.js              grafici Chart.js (andamenti annuali)
    excelTemplate.js       generatore template Essenziale + Completo
    excelImport.js         import workbook → modello
    wordExport.js          export Relazione in .doc
  styles.css               tema Ingenia
```

---

© Ingenia S.r.l. — Powering Future.
