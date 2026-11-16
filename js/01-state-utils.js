// ==========================================
// 1. STATE & KONFIGURASI APLIKASI
// ==========================================
const AppState = {
  activeTab: 'manual',         // 'manual' | 'csv'
  activeChartTab: 'histogram', // 'histogram' | 'boxplot' | 'frequency'
  boxplotOrientation: 'h',     // 'h' | 'v'
  currentData: [],             // Array angka numerik terurut
  rawInputString: '',
  csvData: null,               // Objek PapaParse mentah
  csvHeaders: [],
  selectedCsvColumn: '',
  stats: null,                 // Objek hasil 14 parameter statistik
  frequencyTable: null         // Tabel distribusi frekuensi Sturges
};

// Dataset nilai ujian 22 siswa dengan outlier (15 di bawah, 115 & 120 di atas)
const SAMPLE_DATASET = [
  15, 48, 52, 55, 58, 60, 61, 62, 63, 65,
  66, 68, 70, 72, 75, 78, 80, 82, 85, 90,
  115, 120
];

// ==========================================
// 2. HELPER UTILITY & FORMATTER
// ==========================================
function formatNum(num, maxDecimals = 4) {
  if (num === null || num === undefined || isNaN(num)) return '-';
  if (Number.isInteger(num)) return num.toString();

  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;
  return rounded.toString();
}

function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

function showAlert(message, type = 'error') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;

  const bgStyles = {
    error: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
    info: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'
  };

  const icons = {
    error: `<svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    success: `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    warning: `<svg class="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    info: `<svg class="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  };

  alertContainer.innerHTML = `
    <div class="flex items-start gap-3 p-4 rounded-xl border ${bgStyles[type]} shadow-lg transition-all duration-300">
      ${icons[type]}
      <div class="flex-1 text-sm font-medium leading-relaxed">${message}</div>
      <button onclick="dismissAlert()" class="opacity-70 hover:opacity-100 p-1 -mr-1 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `;
  alertContainer.classList.remove('hidden');
}

function dismissAlert() {
  const alertContainer = document.getElementById('alert-container');
  if (alertContainer) {
    alertContainer.classList.add('hidden');
    alertContainer.innerHTML = '';
  }
}
