// ==========================================
// RENDER DASHBOARD HASIL & DATA VIEWER (LANGKAH 2)
// ==========================================
function renderPlainLanguageSummary(stats) {
  const summaryContainer = document.getElementById('plain-summary-content');
  if (!summaryContainer) return;

  let outlierStory = '';
  if (stats.allOutliers.length === 0) {
    outlierStory = `<span class="text-emerald-400 font-semibold">Semua data berada dalam batas wajar</span> (antara ${formatNum(stats.lowerFence)} sampai ${formatNum(stats.upperFence)}). Tidak terdeteksi angka ekstrem / outlier.`;
  } else {
    outlierStory = `Ditemukan <span class="text-rose-400 font-bold">${stats.allOutliers.length} angka tidak wajar (outlier)</span> yang berada di luar rentang wajar (${formatNum(stats.lowerFence)} s/d ${formatNum(stats.upperFence)}), yaitu angka: <strong class="text-rose-300 font-mono">${stats.allOutliers.map(formatNum).join(', ')}</strong>. Angka ini patut diperiksa apakah salah ketik atau data khusus.`;
  }

  summaryContainer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50">
        <div class="text-xs font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Nilai Khas / Rata-rata
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Dari total <strong class="text-white">${stats.n} data</strong> yang Anda masukkan, nilai rata-ratanya adalah <strong class="text-indigo-300">${formatNum(stats.mean)}</strong> dengan nilai persis di posisi tengah yaitu <strong class="text-indigo-300">${formatNum(stats.median)}</strong>.
        </p>
      </div>

      <div class="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50">
        <div class="text-xs font-semibold text-blue-300 mb-1.5 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Rentang & Sebaran
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Angka paling kecil adalah <strong class="text-white">${formatNum(stats.min)}</strong> dan terbesar <strong class="text-white">${formatNum(stats.max)}</strong> (rentang selisih <strong class="text-white">${formatNum(stats.range)}</strong>). Separuh data inti berada di kisaran <strong class="text-blue-300">${formatNum(stats.q1)}</strong> hingga <strong class="text-blue-300">${formatNum(stats.q3)}</strong>.
        </p>
      </div>

      <div class="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50">
        <div class="text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Deteksi Kejanggalan Data
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          ${outlierStory}
        </p>
      </div>
    </div>
  `;
}

function renderDashboardStats(stats) {
  setText('stat-n', formatNum(stats.n));
  setText('stat-sum', formatNum(stats.sum));
  setText('stat-mean', formatNum(stats.mean));
  setText('stat-median', formatNum(stats.median));

  setText('stat-mode', stats.modeText);
  setText('stat-mode-sub', stats.modeClassification);

  setText('stat-min', formatNum(stats.min));
  setText('stat-max', formatNum(stats.max));
  setText('stat-range', formatNum(stats.range));

  setText('stat-variance-sample', formatNum(stats.sampleVariance));
  setText('stat-variance-pop', `Varians Populasi: ${formatNum(stats.populationVariance)}`);

  setText('stat-std-sample', formatNum(stats.sampleStdDev));
  setText('stat-std-pop', `Deviasi Populasi: ${formatNum(stats.populationStdDev)}`);

  setText('stat-q1', formatNum(stats.q1));
  setText('stat-q3', formatNum(stats.q3));
  setText('stat-iqr', formatNum(stats.iqr));

  setText('stat-outlier-lb', formatNum(stats.lowerFence));
  setText('stat-outlier-ub', formatNum(stats.upperFence));

  const outlierBadgeContainer = document.getElementById('stat-outlier-badges');
  if (outlierBadgeContainer) {
    if (stats.allOutliers.length === 0) {
      outlierBadgeContainer.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          Bagus! Tidak ada angka yang aneh atau outlier terdeteksi
        </span>
      `;
    } else {
      let badgesHtml = `<div class="flex flex-wrap gap-2 items-center">`;
      badgesHtml += `<span class="text-xs font-bold text-rose-400 mr-1">${stats.allOutliers.length} Angka Outlier:</span>`;

      if (stats.lowerOutliers.length > 0) {
        badgesHtml += stats.lowerOutliers.map(val =>
          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800" title="Terlalu kecil (< ${formatNum(stats.lowerFence)})">
            ↓ ${formatNum(val)} (Terlalu Kecil)
          </span>`
        ).join('');
      }

      if (stats.upperOutliers.length > 0) {
        badgesHtml += stats.upperOutliers.map(val =>
          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800" title="Terlalu besar (> ${formatNum(stats.upperFence)})">
            ↑ ${formatNum(val)} (Terlalu Besar)
          </span>`
        ).join('');
      }

      badgesHtml += `</div>`;
      outlierBadgeContainer.innerHTML = badgesHtml;
    }
  }

  renderPlainLanguageSummary(stats);
  renderSortedDataViewer(stats.sortedData, stats);

  const resultsContainer = document.getElementById('results-section');
  if (resultsContainer) {
    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderSortedDataViewer(sortedData, stats) {
  const container = document.getElementById('sorted-data-list');
  if (!container) return;

  setText('sorted-count', `${sortedData.length} data`);

  container.innerHTML = sortedData.map((val, idx) => {
    const isOutlier = val < stats.lowerFence || val > stats.upperFence;
    const isMin = idx === 0;
    const isMax = idx === sortedData.length - 1;

    let badgeClass = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700/80';
    let extraLabel = '';

    if (isOutlier) {
      badgeClass = 'bg-rose-950/80 border-rose-700 text-rose-300 font-bold ring-2 ring-rose-500/50';
      extraLabel = '<span class="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.2 rounded ml-1 font-sans">OUTLIER</span>';
    } else if (isMin) {
      badgeClass = 'bg-sky-950/80 border-sky-700 text-sky-300 font-semibold';
      extraLabel = '<span class="text-[10px] bg-sky-900/60 text-sky-300 px-1.5 py-0.2 rounded ml-1 font-sans">MIN</span>';
    } else if (isMax) {
      badgeClass = 'bg-purple-950/80 border-purple-700 text-purple-300 font-semibold';
      extraLabel = '<span class="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded ml-1 font-sans">MAX</span>';
    }

    return `
      <div class="px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between ${badgeClass} transition-all">
        <span class="text-slate-400 text-[10px] mr-1.5">#${idx + 1}</span>
        <span class="font-bold">${formatNum(val)}</span>
        ${extraLabel}
      </div>
    `;
  }).join('');
}
