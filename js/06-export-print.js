// ==========================================
// EKSPOR LAPORAN & CETAK PDF
// ==========================================
function copySummaryToClipboard() {
  if (!AppState.stats) {
    showAlert('Belum ada data hasil perhitungan untuk disalin.', 'warning');
    return;
  }

  const s = AppState.stats;
  const report = `=========================================
LAPORAN STATISTIK DESKRIPTIF (Kalkulator Data Deskriptif Kelompok 2)
=========================================
Jumlah Data (n)              : ${s.n}
Total Nilai (Σx)             : ${formatNum(s.sum)}
Mean (Rata-rata, x̄)          : ${formatNum(s.mean)}
Median (Nilai Tengah, Me)    : ${formatNum(s.median)}
Modus (Mo)                   : ${s.modeText} (${s.modeClassification})
Nilai Minimum (Xmin)         : ${formatNum(s.min)}
Nilai Maksimum (Xmax)        : ${formatNum(s.max)}
Jangkauan / Range (R)        : ${formatNum(s.range)}
Varians Sampel (s²)          : ${formatNum(s.sampleVariance)}
Varians Populasi (σ²)        : ${formatNum(s.populationVariance)}
Standar Deviasi Sampel (s)   : ${formatNum(s.sampleStdDev)}
Standar Deviasi Populasi (σ) : ${formatNum(s.populationStdDev)}
Kuartil 1 (Q1, 25%)          : ${formatNum(s.q1)}
Kuartil 3 (Q3, 75%)          : ${formatNum(s.q3)}
Interquartile Range (IQR)    : ${formatNum(s.iqr)}
-----------------------------------------
DETEKSI OUTLIER (Metode 1.5 × IQR):
Batas Bawah (Q1 - 1.5×IQR)   : ${formatNum(s.lowerFence)}
Batas Atas (Q3 + 1.5×IQR)    : ${formatNum(s.upperFence)}
Jumlah Outlier               : ${s.allOutliers.length} data
Daftar Outlier               : ${s.allOutliers.length > 0 ? s.allOutliers.join(', ') : 'Tidak ada'}
=========================================`;

  navigator.clipboard.writeText(report).then(() => {
    showAlert('Ringkasan statistik berhasil disalin ke clipboard!', 'success');
  }).catch(() => {
    showAlert('Gagal menyalin ke clipboard. Silakan salin manual.', 'error');
  });
}

function exportSummaryCsv() {
  if (!AppState.stats) {
    showAlert('Belum ada data untuk diekspor.', 'warning');
    return;
  }

  const s = AppState.stats;
  const csvRows = [
    ['Parameter Statistik', 'Simbol/Notasi', 'Nilai', 'Keterangan'],
    ['Jumlah Data', 'n', s.n, 'Total elemen data'],
    ['Total Nilai', 'Σx', formatNum(s.sum), 'Penjumlahan seluruh data'],
    ['Mean (Rata-rata)', 'x̄', formatNum(s.mean), 'Rata-rata hitung'],
    ['Median', 'Me', formatNum(s.median), 'Nilai tengah data terurut'],
    ['Modus', 'Mo', `"${s.modeText}"`, s.modeClassification],
    ['Nilai Minimum', 'Xmin', formatNum(s.min), 'Nilai terendah'],
    ['Nilai Maksimum', 'Xmax', formatNum(s.max), 'Nilai tertinggi'],
    ['Jangkauan (Range)', 'R', formatNum(s.range), 'Xmax - Xmin'],
    ['Varians Sampel', 's²', formatNum(s.sampleVariance), 'Derajat bebas n-1'],
    ['Varians Populasi', 'σ²', formatNum(s.populationVariance), 'Dibagi n'],
    ['Standar Deviasi Sampel', 's', formatNum(s.sampleStdDev), 'Akar kuadrat varians sampel'],
    ['Standar Deviasi Populasi', 'σ', formatNum(s.populationStdDev), 'Akar kuadrat varians populasi'],
    ['Kuartil 1', 'Q1', formatNum(s.q1), 'Persentil ke-25'],
    ['Kuartil 3', 'Q3', formatNum(s.q3), 'Persentil ke-75'],
    ['Interquartile Range', 'IQR', formatNum(s.iqr), 'Q3 - Q1'],
    ['Batas Bawah Outlier', 'LB', formatNum(s.lowerFence), 'Q1 - 1.5×IQR'],
    ['Batas Atas Outlier', 'UB', formatNum(s.upperFence), 'Q3 + 1.5×IQR'],
    ['Outlier Terdeteksi', 'Outliers', `"${s.allOutliers.join(', ')}"`, `${s.allOutliers.length} data ditemukan`]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ringkasan_statistik_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printReport() {
  if (!AppState.stats) {
    showAlert('Belum ada data hasil analisis yang dapat dicetak. Silakan analisis data terlebih dahulu.', 'warning');
    return;
  }

  const timestampEl = document.getElementById('print-timestamp');
  if (timestampEl) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    timestampEl.textContent = `Dicetak pada: ${formattedDate}, ${formattedTime} WIB`;
  }

  window.print();
}
