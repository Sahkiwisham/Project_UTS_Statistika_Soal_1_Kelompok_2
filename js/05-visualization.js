// ==========================================
// TABEL DISTRIBUSI FREKUENSI & GRAFIK PLOTLY (LANGKAH 3)
// ==========================================
function generateFrequencyDistribution(sorted, stats) {
  const n = sorted.length;
  const min = stats.min;
  const max = stats.max;
  const range = stats.range;

  if (range === 0) {
    return {
      k: 1,
      classWidth: 1,
      rows: [{
        classNumber: 1,
        interval: `${min} - ${max}`,
        boundaries: `${min - 0.5} - ${max + 0.5}`,
        midpoint: min,
        frequency: n,
        relFrequency: 100,
        cumFreqLess: n,
        cumFreqMore: n
      }],
      totalFreq: n,
      totalRelFreq: 100
    };
  }

  let k = Math.round(1 + 3.322 * Math.log10(n));
  if (k < 3) k = 3;
  if (k > 10) k = 10;

  let c = range / k;
  const isAllInteger = sorted.every(x => Number.isInteger(x));
  if (isAllInteger && c >= 1) {
    c = Math.ceil(c);
  } else {
    c = Math.ceil(c * 10000) / 10000;
  }

  const rows = [];
  let currentLower = min;
  let cumLess = 0;

  for (let i = 0; i < k; i++) {
    const isLastClass = (i === k - 1);
    const lower = currentLower;
    let upper = lower + c;
    if (isAllInteger && c >= 1) {
      upper = lower + c - 1;
    }

    if (isLastClass && upper < max) {
      upper = max;
    }

    let fi = 0;
    for (const val of sorted) {
      if (isLastClass) {
        if (val >= lower && val <= (upper + 0.000001)) fi++;
      } else {
        if (isAllInteger) {
          if (val >= lower && val <= upper) fi++;
        } else {
          if (val >= lower && val < upper) fi++;
        }
      }
    }

    cumLess += fi;
    const midpoint = (lower + upper) / 2;
    const boundaryLower = isAllInteger ? lower - 0.5 : lower;
    const boundaryUpper = isAllInteger ? upper + 0.5 : upper;

    rows.push({
      classNumber: i + 1,
      lowerLimit: lower,
      upperLimit: upper,
      interval: `${formatNum(lower)} - ${formatNum(upper)}`,
      boundaries: `${formatNum(boundaryLower)} - ${formatNum(boundaryUpper)}`,
      midpoint: midpoint,
      frequency: fi,
      relFrequency: (fi / n) * 100,
      cumFreqLess: cumLess,
      cumFreqMore: 0
    });

    currentLower = isAllInteger ? upper + 1 : upper;
  }

  let cumMore = n;
  for (let i = 0; i < rows.length; i++) {
    rows[i].cumFreqMore = cumMore;
    cumMore -= rows[i].frequency;
  }

  return {
    k,
    classWidth: c,
    rows,
    totalFreq: n,
    totalRelFreq: 100
  };
}

const PLOTLY_DARK_LAYOUT = {
  font: { family: 'Plus Jakarta Sans, sans-serif', color: '#94a3b8', size: 12 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#0f172a',
  margin: { l: 55, r: 35, t: 40, b: 50 },
  autosize: true,
  xaxis: {
    gridcolor: 'rgba(255, 255, 255, 0.07)',
    zerolinecolor: 'rgba(255, 255, 255, 0.15)',
    tickfont: { color: '#94a3b8' }
  },
  yaxis: {
    gridcolor: 'rgba(255, 255, 255, 0.07)',
    zerolinecolor: 'rgba(255, 255, 255, 0.15)',
    tickfont: { color: '#94a3b8' }
  }
};

const PLOTLY_CONFIG = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'stat_prototype_group2_chart',
    height: 600,
    width: 900,
    scale: 2
  }
};

function renderHistogramPlot(data, stats) {
  const container = document.getElementById('plot-container');
  if (!container || !window.Plotly) return;

  const trace = {
    x: data,
    type: 'histogram',
    name: 'Frekuensi Data',
    marker: {
      color: 'rgba(99, 102, 241, 0.75)',
      line: { color: '#818cf8', width: 1.5 }
    },
    opacity: 0.9,
    hovertemplate: 'Rentang Nilai: %{x}<br>Jumlah Kemunculan: %{y}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    title: {
      text: '<b>Grafik Histogram Sebaran Frekuensi Data</b>',
      font: { color: '#f8fafc', size: 15 },
      x: 0.05
    },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Nilai Data', font: { color: '#cbd5e1', size: 12 } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      title: { text: 'Banyak Kemunculan (Frekuensi)', font: { color: '#cbd5e1', size: 12 } }
    },
    shapes: [
      {
        type: 'line',
        x0: stats.mean,
        x1: stats.mean,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#f97316', width: 2.5, dash: 'dash' }
      },
      {
        type: 'line',
        x0: stats.median,
        x1: stats.median,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#10b981', width: 2.5, dash: 'dot' }
      }
    ],
    annotations: [
      {
        x: stats.mean,
        y: 1,
        yref: 'paper',
        text: `Mean: ${formatNum(stats.mean)}`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: '#f97316',
        ax: 35,
        ay: -25,
        font: { color: '#ffffff', size: 11, family: 'Plus Jakarta Sans, sans-serif' },
        bgcolor: '#ea580c',
        bordercolor: '#f97316',
        borderwidth: 1,
        borderpad: 4
      },
      {
        x: stats.median,
        y: 0.85,
        yref: 'paper',
        text: `Median: ${formatNum(stats.median)}`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: '#10b981',
        ax: -40,
        ay: -20,
        font: { color: '#ffffff', size: 11, family: 'Plus Jakarta Sans, sans-serif' },
        bgcolor: '#059669',
        bordercolor: '#10b981',
        borderwidth: 1,
        borderpad: 4
      }
    ]
  };

  Plotly.react(container, [trace], layout, PLOTLY_CONFIG);
}

function renderBoxplotPlot(data, stats, orientation = 'h') {
  const container = document.getElementById('plot-container');
  if (!container || !window.Plotly) return;

  const isHorizontal = orientation === 'h';

  const trace = {
    [isHorizontal ? 'x' : 'y']: data,
    type: 'box',
    name: 'Sebaran Data',
    boxpoints: 'all',
    jitter: 0.35,
    pointpos: -1.8,
    boxmean: 'sd',
    marker: { color: '#818cf8', size: 6, outliercolor: '#ef4444' },
    line: { color: '#6366f1', width: 2 },
    fillcolor: 'rgba(99, 102, 241, 0.25)',
    hoveron: 'boxes+points',
    hovertemplate: isHorizontal ? 'Nilai: %{x}<extra></extra>' : 'Nilai: %{y}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    title: {
      text: `<b>Grafik Kotak (Boxplot) Lima Serangkai & Outlier (${isHorizontal ? 'Horizontal' : 'Vertikal'})</b>`,
      font: { color: '#f8fafc', size: 15 },
      x: 0.05
    },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: isHorizontal ? 'Nilai Data' : '', font: { color: '#cbd5e1', size: 12 } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      title: { text: !isHorizontal ? 'Nilai Data' : '', font: { color: '#cbd5e1', size: 12 } }
    },
    annotations: [
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.98,
        y: 0.05,
        text: `Q1: ${formatNum(stats.q1)} | Median: ${formatNum(stats.median)} | Q3: ${formatNum(stats.q3)} | Outlier: ${stats.allOutliers.length}`,
        showarrow: false,
        font: { color: '#cbd5e1', size: 11, family: 'JetBrains Mono, monospace' },
        bgcolor: '#1e293b',
        bordercolor: '#334155',
        borderwidth: 1
      }
    ]
  };

  Plotly.react(container, [trace], layout, PLOTLY_CONFIG);
}

function renderFrequencyBarChart(freqTable) {
  const container = document.getElementById('plot-container');
  if (!container || !window.Plotly || !freqTable) return;

  const categories = freqTable.rows.map(r => r.interval);
  const frequencies = freqTable.rows.map(r => r.frequency);

  const trace = {
    x: categories,
    y: frequencies,
    type: 'bar',
    name: 'Banyak Data per Interval',
    marker: {
      color: '#6366f1',
      line: { color: '#818cf8', width: 1.5 }
    },
    textposition: 'auto',
    textfont: {
      family: 'JetBrains Mono, monospace',
      size: 12,
      color: '#ffffff'
    },
    hovertemplate: 'Interval Kelas: %{x}<br>Banyak Data: %{y}<br>Persentase: %{text}%<extra></extra>',
    text: freqTable.rows.map(r => formatNum(r.relFrequency))
  };

  const layout = {
    ...PLOTLY_DARK_LAYOUT,
    title: {
      text: '<b>Diagram Batang Frekuensi (Berdasarkan Kelompok Interval)</b>',
      font: { color: '#f8fafc', size: 15 },
      x: 0.05
    },
    xaxis: {
      ...PLOTLY_DARK_LAYOUT.xaxis,
      title: { text: 'Kelompok Interval Nilai', font: { color: '#cbd5e1', size: 12 } }
    },
    yaxis: {
      ...PLOTLY_DARK_LAYOUT.yaxis,
      title: { text: 'Frekuensi (Jumlah Data)', font: { color: '#cbd5e1', size: 12 } }
    }
  };

  Plotly.react(container, [trace], layout, PLOTLY_CONFIG);
}

function renderFrequencyTable(freqTable) {
  const tbody = document.getElementById('freq-table-body');
  if (!tbody || !freqTable) return;

  tbody.innerHTML = freqTable.rows.map(row => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
      <td class="py-2.5 px-3 font-mono text-center text-slate-400 font-semibold">${row.classNumber}</td>
      <td class="py-2.5 px-3 font-mono font-bold text-indigo-400">${row.interval}</td>
      <td class="py-2.5 px-3 font-mono text-slate-300">${row.boundaries}</td>
      <td class="py-2.5 px-3 font-mono text-slate-300 text-center font-medium">${formatNum(row.midpoint)}</td>
      <td class="py-2.5 px-3 font-mono font-bold text-white text-center bg-indigo-950/30">${row.frequency}</td>
      <td class="py-2.5 px-3 font-mono text-emerald-400 text-center font-semibold">${formatNum(row.relFrequency)}%</td>
      <td class="py-2.5 px-3 font-mono text-sky-400 text-center">${row.cumFreqLess}</td>
      <td class="py-2.5 px-3 font-mono text-amber-400 text-center">${row.cumFreqMore}</td>
    </tr>
  `).join('');

  setText('freq-total-fi', freqTable.totalFreq);
  setText('freq-total-fr', `${freqTable.totalRelFreq}%`);
  setText('sturges-k-info', `Aturan Sturges: k = ${freqTable.k} kelompok kelas, Lebar Kelas (c) ≈ ${formatNum(freqTable.classWidth)}`);
}

function updateActiveChart() {
  if (!AppState.stats || !AppState.currentData.length) return;

  const chartContainer = document.getElementById('plot-container');
  const tableContainer = document.getElementById('frequency-table-wrapper');
  const boxplotControls = document.getElementById('boxplot-controls');

  if (AppState.activeChartTab === 'histogram') {
    if (chartContainer) chartContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (boxplotControls) boxplotControls.classList.add('hidden');
    renderHistogramPlot(AppState.currentData, AppState.stats);
  } else if (AppState.activeChartTab === 'boxplot') {
    if (chartContainer) chartContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (boxplotControls) boxplotControls.classList.remove('hidden');
    renderBoxplotPlot(AppState.currentData, AppState.stats, AppState.boxplotOrientation);
  } else if (AppState.activeChartTab === 'frequency') {
    if (chartContainer) chartContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');
    if (boxplotControls) boxplotControls.classList.add('hidden');
    renderFrequencyBarChart(AppState.frequencyTable);
    renderFrequencyTable(AppState.frequencyTable);
  }
}

function setChartTab(tabName) {
  AppState.activeChartTab = tabName;

  ['histogram', 'boxplot', 'frequency'].forEach(t => {
    const btn = document.getElementById(`tab-chart-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all';
      } else {
        btn.className = 'px-4 py-2 text-xs md:text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all';
      }
    }
  });

  updateActiveChart();
}

function setBoxplotOrientation(orient) {
  AppState.boxplotOrientation = orient;

  const btnH = document.getElementById('btn-orient-h');
  const btnV = document.getElementById('btn-orient-v');

  if (btnH && btnV) {
    if (orient === 'h') {
      btnH.className = 'px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white shadow-xs';
      btnV.className = 'px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white';
    } else {
      btnH.className = 'px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white';
      btnV.className = 'px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white shadow-xs';
    }
  }

  if (AppState.activeChartTab === 'boxplot') {
    renderBoxplotPlot(AppState.currentData, AppState.stats, orient);
  }
}
