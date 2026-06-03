// Grafici ibridi: i principali andamenti annuali sono resi con Chart.js
// (interattivi e ricalcolati dal dataset corrente); gli sparkline minori e le
// barre entrate/uscite restano negli SVG originali del modello.
import Chart from 'chart.js/auto'
import { SAMPLE } from '../data/cellValues.js'
import { parseNum, fmtCurrency } from './format.js'

const ING = { purple: '#6b5bce', teal: '#2fae9b', blue: '#4f7ec9', green: '#34c08a', bad: '#cf3b30', ink: '#15233a' }

// definizione dei grafici dinamici: match sul testo dell'<h3> della card
const DEFS = [
  {
    match: /evoluzione pfn|posizione finanziaria netta/i,
    type: 'line',
    labels: ['2022', '2023', '2024', '2025', '2026*'],
    keys: ['PFN!D19', 'PFN!E19', 'PFN!F19', 'PFN!G19', 'PFN!I19'],
    color: ING.purple,
  },
  {
    match: /ricavi netti/i,
    type: 'bar',
    labels: ['2021', '2022', '2023', '2024', '2025'],
    keys: ['CE!C10', 'CE!D10', 'CE!E10', 'CE!F10', 'CE!G10'],
    color: ING.teal,
  },
  {
    match: /margine operativo lordo|^mol/i,
    type: 'bar',
    labels: ['2021', '2022', '2023', '2024', '2025'],
    keys: ['CE!C33', 'CE!D33', 'CE!E33', 'CE!F33', 'CE!G33'],
    signed: true,
  },
  {
    match: /flusso netto di liquidità/i,
    type: 'bar',
    labels: ['2022', '2023', '2024', '2025', '2026*'],
    keys: ['RF!C50', 'RF!D50', 'RF!E50', 'RF!F50', 'RF (2)!C50'],
    signed: true,
  },
]

const series = (model, keys) => keys.map((k) => {
  const v = (model && model[k] != null) ? model[k] : SAMPLE[k]
  return parseNum(v) ?? 0
})

function euroTicks(value) {
  const a = Math.abs(value)
  if (a >= 1e6) return (value / 1e6).toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' M'
  if (a >= 1e3) return Math.round(value / 1e3) + ' k'
  return String(value)
}

export function mountCharts(root, model) {
  if (!root) return
  root.querySelectorAll('.card').forEach((card) => {
    const h3 = card.querySelector('h3')
    if (!h3) return
    const def = DEFS.find((d) => d.match.test(h3.textContent || ''))
    if (!def) return
    const slot = card.querySelector('svg.spark, svg.bars, canvas.ing-chart')
    if (!slot) return

    // sostituisci lo slot con un canvas (una volta sola)
    let canvas = card.querySelector('canvas.ing-chart')
    if (!canvas) {
      const box = document.createElement('div')
      box.className = 'chart-box'
      canvas = document.createElement('canvas')
      canvas.className = 'ing-chart'
      box.appendChild(canvas)
      slot.replaceWith(box)
    }
    if (canvas._chart) { canvas._chart.destroy(); canvas._chart = null }

    const data = series(model, def.keys)
    const colors = def.signed ? data.map((v) => (v >= 0 ? ING.teal : ING.bad)) : data.map(() => def.color)

    canvas._chart = new Chart(canvas.getContext('2d'), {
      type: def.type,
      data: {
        labels: def.labels,
        datasets: [{
          data,
          backgroundColor: def.type === 'line' ? 'rgba(107,91,206,.12)' : colors,
          borderColor: def.type === 'line' ? def.color : colors,
          borderWidth: def.type === 'line' ? 2.4 : 0,
          borderRadius: def.type === 'bar' ? 5 : 0,
          fill: def.type === 'line',
          pointBackgroundColor: def.color,
          pointRadius: 3,
          tension: 0.32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: ING.ink,
            padding: 10,
            callbacks: { label: (c) => fmtCurrency(c.parsed.y) },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8a93a4', font: { size: 11 } } },
          y: {
            grid: { color: '#eef0f4' },
            ticks: { color: '#8a93a4', font: { size: 10 }, callback: euroTicks },
          },
        },
      },
    })
  })
}
