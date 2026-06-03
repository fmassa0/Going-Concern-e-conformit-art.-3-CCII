// Export della "Relazione sulla continuità aziendale" in formato .doc (Word).
// Derivato dal meccanismo originale, con foglio di stile rebrandizzato Ingenia
// (accento oro → teal/viola Ingenia).
const WORD_CSS = "@page{size:A4;margin:2.4cm 2.2cm}body{font-family:'Cambria','Garamond',serif;font-size:11.5pt;color:#1a1a1a;line-height:1.5}.rel-eyebrow{color:#246b60;font-variant:small-caps;letter-spacing:1px;font-size:9pt;margin:0}.rel-title{font-size:23pt;color:#15233a;margin:6pt 0 4pt;font-weight:700}.rel-meta{color:#555;font-size:9.5pt;margin:0 0 6pt}h1{font-size:15pt;color:#15233a;border-bottom:1.5pt solid #2f9c8e;padding-bottom:3pt;margin:0 0 8pt;page-break-before:always}h2{font-size:12.5pt;color:#15233a;margin:0 0 6pt;page-break-before:always}h1.rel-title{page-break-before:auto;border-bottom:none;margin:6pt 0 4pt}table.rt tr{page-break-inside:avoid}p{margin:5pt 0;text-align:justify}p.li{margin:3pt 0 3pt 18pt}p.li2{margin:2pt 0 2pt 34pt;font-size:11pt}p.li3{margin:2pt 0 2pt 48pt;font-size:10.5pt}p.psub{font-weight:700;margin-top:2pt}p.psmall{font-size:9.5pt;color:#555}p.pdca{margin:4pt 0 4pt 14pt}hr{border:none;border-top:.5pt solid #ccc;margin:14pt 0}table.rt{border-collapse:collapse;width:100%;margin:6pt 0 13pt;font-size:9pt}table.rt th{background:#15233a;color:#fff;text-align:right;padding:4pt 7pt;font-size:8pt;font-weight:600;letter-spacing:.2pt;border:none}table.rt th:first-child{text-align:left}table.rt td{padding:3pt 7pt;border:none;border-bottom:.5pt solid #e2e6ec;vertical-align:top;font-size:9pt;color:#222}table.rt td:first-child{color:#1b2330}table.rt td.num{text-align:right;white-space:nowrap;font-family:'Consolas','Courier New',monospace;font-size:7.5pt;color:#2b3440}table.rt tr.alt td{background:#f5f8fc}table.rt tr.tot td{font-weight:700;background:#eaeef5;border-top:.5pt solid #aeb9c9;border-bottom:.5pt solid #aeb9c9;color:#15233a}table.rt tr.tot td.num{color:#15233a;font-size:8.5pt}table.rt tr:last-child td{border-bottom:1.2pt solid #15233a}table.rt.mini{width:64%;margin-top:2pt}table.rt.mini td{font-size:9.5pt}table.rt.mini td.num{font-size:9pt}table.rt.mini td:first-child{width:58%}h3.tlab{font-size:10pt;color:#15233a;margin:17pt 0 5pt;padding:2pt 0 2pt 8pt;border-left:3pt solid #2f9c8e;text-transform:uppercase;letter-spacing:.5pt;font-weight:700}p.tnote{font-size:8.5pt;color:#777;margin:0 0 5pt;font-style:italic}tr.esitorow td{font-weight:700;border-top:1pt solid #15233a;border-bottom:1pt solid #15233a;background:#fff}td.esito{font-weight:700;text-align:right}td.esito.good{color:#1f7a52}td.esito.bad{color:#b8362b}small{color:#666}.rel-foot{font-size:8.5pt;color:#777;margin-top:10pt}"

export function exportRelazioneDoc(relSourceEl) {
  if (!relSourceEl) return
  const src = relSourceEl.cloneNode(true)
  src.querySelectorAll('[data-excel-sheet]').forEach((el) => {
    el.removeAttribute('data-excel-sheet')
    el.removeAttribute('data-excel-cell')
    el.removeAttribute('data-excel-type')
    el.removeAttribute('class')
  })
  const head =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>Relazione sulla continuità aziendale — Ingenia</title>" +
    "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->" +
    '<style>' + WORD_CSS + '</style></head><body>'
  const htmlDoc = head + src.innerHTML + '</body></html>'
  const blob = new Blob(['﻿', htmlDoc], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Relazione_Continuita_Aziendale_Ingenia.doc'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
