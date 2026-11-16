// ==========================================
// PARSER INPUT MANUAL & UNGGAH CSV (LANGKAH 1)
// ==========================================
function setInputTab(tab) {
  AppState.activeTab = tab;

  const btnManual = document.getElementById('tab-btn-manual');
  const btnCsv = document.getElementById('tab-btn-csv');
  const panelManual = document.getElementById('panel-input-manual');
  const panelCsv = document.getElementById('panel-input-csv');

  if (tab === 'manual') {
    if (btnManual) btnManual.className = 'flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs md:text-sm bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all';
    if (btnCsv) btnCsv.className = 'flex-1 py-2.5 px-4 rounded-lg font-medium text-xs md:text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center justify-center gap-2 transition-all';
    if (panelManual) panelManual.classList.remove('hidden');
    if (panelCsv) panelCsv.classList.add('hidden');
  } else {
    if (btnManual) btnManual.className = 'flex-1 py-2.5 px-4 rounded-lg font-medium text-xs md:text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center justify-center gap-2 transition-all';
    if (btnCsv) btnCsv.className = 'flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs md:text-sm bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all';
    if (panelManual) panelManual.classList.add('hidden');
    if (panelCsv) panelCsv.classList.remove('hidden');
  }
}

function parseManualText(text) {
  if (!text || text.trim() === '') {
    return { valid: false, numbers: [], errors: ['Kolom input data masih kosong. Silakan ketik deret angka atau klik tombol "Coba Pakai Data Contoh".'] };
  }

  const tokens = text
    .split(/[\s,;]+/)
    .map(t => t.trim())
    .filter(t => t !== '');

  if (tokens.length === 0) {
    return { valid: false, numbers: [], errors: ['Tidak ada angka yang ditemukan dalam teks yang Anda masukkan.'] };
  }

  const numbers = [];
  const invalidTokens = [];

  for (const token of tokens) {
    const num = Number(token);
    if (!isNaN(num) && isFinite(num)) {
      numbers.push(num);
    } else {
      invalidTokens.push(token);
    }
  }

  if (invalidTokens.length > 0) {
    const previewInvalid = invalidTokens.slice(0, 5).map(t => `"${t}"`).join(', ');
    const moreText = invalidTokens.length > 5 ? ` dan ${invalidTokens.length - 5} lainnya` : '';
    return {
      valid: false,
      numbers: [],
      errors: [
        `Ditemukan karakter bukan angka: ${previewInvalid}${moreText}. Harap masukkan hanya angka. Untuk pemisah desimal gunakan tanda titik (contoh: 75.5).`
      ]
    };
  }

  if (numbers.length < 2) {
    return {
      valid: false,
      numbers: numbers,
      errors: ['Data Anda baru ada 1 angka. Minimal dibutuhkan minimal 2 angka untuk menghitung varians dan persebaran statistik.']
    };
  }

  return { valid: true, numbers, errors: [] };
}

function handleCsvUpload(file) {
  dismissAlert();
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    showAlert('Pilih berkas berekstensi .csv yang valid.', 'error');
    return;
  }

  if (!window.Papa) {
    showAlert('Komponen pembaca CSV gagal dimuat. Periksa koneksi internet Anda.', 'error');
    return;
  }

  const infoEl = document.getElementById('csv-file-info');
  const nameEl = document.getElementById('csv-file-name');
  const sizeEl = document.getElementById('csv-file-size');
  if (infoEl && nameEl && sizeEl) {
    nameEl.textContent = file.name;
    sizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    infoEl.classList.remove('hidden');
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors.length > 0 && results.data.length === 0) {
        showAlert(`Gagal membaca berkas CSV: ${results.errors[0].message}`, 'error');
        return;
      }

      AppState.csvData = results;
      AppState.csvHeaders = results.meta.fields || [];

      if (AppState.csvHeaders.length === 0) {
        showAlert('Berkas CSV tidak memiliki baris judul (header) kolom.', 'error');
        return;
      }

      populateCsvColumnSelect(AppState.csvHeaders, results.data);
      showAlert(`File CSV berhasil dibaca (${results.data.length} baris). Silakan pilih kolom angka pada dropdown lalu klik "Analisis Data".`, 'info');
    },
    error: function (err) {
      showAlert(`Terjadi kesalahan membaca CSV: ${err.message}`, 'error');
    }
  });
}

function populateCsvColumnSelect(headers, dataRows) {
  const select = document.getElementById('csv-column-select');
  const wrapper = document.getElementById('csv-column-selector-wrapper');
  if (!select || !wrapper) return;

  select.innerHTML = '';
  wrapper.classList.remove('hidden');

  let defaultNumericCol = '';

  headers.forEach(header => {
    let numCount = 0;
    const sampleSize = Math.min(dataRows.length, 50);

    for (let i = 0; i < sampleSize; i++) {
      const val = dataRows[i][header];
      if (val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(Number(val))) {
        numCount++;
      }
    }

    const isNumericCandidate = numCount / sampleSize > 0.6;
    if (isNumericCandidate && !defaultNumericCol) {
      defaultNumericCol = header;
    }

    const option = document.createElement('option');
    option.value = header;
    option.textContent = `${header} ${isNumericCandidate ? '(Kolom Angka ✓)' : '(Teks/Lainnya)'}`;
    select.appendChild(option);
  });

  if (defaultNumericCol) {
    select.value = defaultNumericCol;
    AppState.selectedCsvColumn = defaultNumericCol;
  } else if (headers.length > 0) {
    select.value = headers[0];
    AppState.selectedCsvColumn = headers[0];
  }

  updateCsvPreview(dataRows, headers);
}

function updateCsvPreview(rows, headers) {
  const previewContainer = document.getElementById('csv-preview-container');
  const previewThead = document.getElementById('csv-preview-thead');
  const previewTbody = document.getElementById('csv-preview-tbody');

  if (!previewContainer || !previewThead || !previewTbody) return;

  previewThead.innerHTML = `<tr>${headers.map(h => `<th class="py-2 px-3 text-left font-mono text-xs font-semibold text-slate-300 bg-slate-800">${h}</th>`).join('')}</tr>`;

  const previewRows = rows.slice(0, 3);
  previewTbody.innerHTML = previewRows.map(r => `
    <tr class="border-t border-slate-800">
      ${headers.map(h => `<td class="py-2 px-3 text-xs font-mono text-slate-400 truncate max-w-[140px]">${r[h] ?? ''}</td>`).join('')}
    </tr>
  `).join('');

  previewContainer.classList.remove('hidden');
}
