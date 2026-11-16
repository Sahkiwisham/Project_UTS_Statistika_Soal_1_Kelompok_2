// ==========================================
// CONTROLLER UTAMA & INISIALISASI HALAMAN
// ==========================================
function processData() {
  dismissAlert();
  let numbers = [];

  if (AppState.activeTab === 'manual') {
    const textarea = document.getElementById('manual-data-input');
    const rawText = textarea ? textarea.value : '';
    const parseResult = parseManualText(rawText);

    if (!parseResult.valid) {
      showAlert(parseResult.errors.join('<br>'), 'error');
      return;
    }
    numbers = parseResult.numbers;
  } else if (AppState.activeTab === 'csv') {
    if (!AppState.csvData || !AppState.csvData.data) {
      showAlert('Silakan pilih berkas CSV terlebih dahulu.', 'error');
      return;
    }

    const columnSelect = document.getElementById('csv-column-select');
    const selectedCol = columnSelect ? columnSelect.value : '';
    if (!selectedCol) {
      showAlert('Pilih kolom angka dari file CSV yang ingin dianalisis.', 'error');
      return;
    }

    const colValues = [];
    const nonNumericValues = [];

    for (const row of AppState.csvData.data) {
      if (row[selectedCol] !== undefined && row[selectedCol] !== null && String(row[selectedCol]).trim() !== '') {
        const valStr = String(row[selectedCol]).trim();
        const num = Number(valStr);
        if (!isNaN(num) && isFinite(num)) {
          colValues.push(num);
        } else {
          nonNumericValues.push(valStr);
        }
      }
    }

    if (colValues.length < 2) {
      showAlert(`Kolom "${selectedCol}" hanya memiliki ${colValues.length} angka valid. Minimal dibutuhkan 2 angka.`, 'error');
      return;
    }

    if (nonNumericValues.length > 0) {
      showAlert(`Info: ${nonNumericValues.length} baris teks non-angka dilewati secara otomatis. Menganalisis ${colValues.length} data angka.`, 'info');
    }

    numbers = colValues;
  }

  AppState.currentData = numbers;
  const stats = calculateDescriptiveStats(numbers);
  AppState.stats = stats;

  const freqTable = generateFrequencyDistribution(stats.sortedData, stats);
  AppState.frequencyTable = freqTable;

  renderDashboardStats(stats);
  updateActiveChart();

  showAlert(`Berhasil menganalisis ${stats.n} data angka! Seluruh parameter dan visualisasi telah diperbarui.`, 'success');
}

function loadSampleData() {
  dismissAlert();
  setInputTab('manual');

  const textarea = document.getElementById('manual-data-input');
  if (textarea) {
    textarea.value = SAMPLE_DATASET.join(', ');
  }

  processData();
}

function resetAll() {
  dismissAlert();
  AppState.currentData = [];
  AppState.stats = null;
  AppState.csvData = null;
  AppState.csvHeaders = [];
  AppState.selectedCsvColumn = '';

  const textarea = document.getElementById('manual-data-input');
  if (textarea) textarea.value = '';

  const countBadge = document.getElementById('manual-count-badge');
  if (countBadge) countBadge.textContent = '0 angka terdeteksi';

  const fileInput = document.getElementById('csv-file-input');
  if (fileInput) fileInput.value = '';

  const csvInfo = document.getElementById('csv-file-info');
  if (csvInfo) csvInfo.classList.add('hidden');

  const csvColWrapper = document.getElementById('csv-column-selector-wrapper');
  if (csvColWrapper) csvColWrapper.classList.add('hidden');

  const resultsSection = document.getElementById('results-section');
  if (resultsSection) resultsSection.classList.add('hidden');

  const chartContainer = document.getElementById('plot-container');
  if (chartContainer && window.Plotly) {
    Plotly.purge(chartContainer);
  }

  showAlert('Formulir berhasil direset. Silakan masukkan data baru.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('csv-dropzone');
  const fileInput = document.getElementById('csv-file-input');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500', 'bg-indigo-950/20');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleCsvUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCsvUpload(e.target.files[0]);
      }
    });
  }

  const manualInput = document.getElementById('manual-data-input');
  const countBadge = document.getElementById('manual-count-badge');
  if (manualInput && countBadge) {
    manualInput.addEventListener('input', () => {
      const tokens = manualInput.value.split(/[\s,;]+/).filter(t => t.trim() !== '' && !isNaN(Number(t)));
      countBadge.textContent = `${tokens.length} angka terdeteksi`;
    });
  }

  window.addEventListener('resize', () => {
    const plotContainer = document.getElementById('plot-container');
    if (plotContainer && window.Plotly && !plotContainer.classList.contains('hidden')) {
      Plotly.Plots.resize(plotContainer);
    }
  });

  loadSampleData();
});
