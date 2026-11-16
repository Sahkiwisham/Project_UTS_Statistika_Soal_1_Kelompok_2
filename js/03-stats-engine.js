// ==========================================
// MESIN PERHITUNGAN 14 PARAMETER STATISTIK
// ==========================================
function calculateDescriptiveStats(rawData) {
  const sorted = [...rawData].sort((a, b) => a - b);
  const n = sorted.length;

  const count = n;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Median
  let median;
  if (n % 2 === 1) {
    median = sorted[Math.floor(n / 2)];
  } else {
    const mid1 = sorted[(n / 2) - 1];
    const mid2 = sorted[n / 2];
    median = (mid1 + mid2) / 2;
  }

  // Modus & Klasifikasinya
  const freqMap = new Map();
  for (const num of sorted) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  let maxFreq = 0;
  for (const freq of freqMap.values()) {
    if (freq > maxFreq) maxFreq = freq;
  }

  let modes = [];
  const uniqueFreqs = new Set(freqMap.values());
  const hasMode = maxFreq > 1 && uniqueFreqs.size > 1;

  let modeText = 'Tidak ada modus';
  let modeClassification = 'Semua nilai muncul dengan jumlah frekuensi yang sama';

  if (hasMode) {
    for (const [val, freq] of freqMap.entries()) {
      if (freq === maxFreq) modes.push(val);
    }
    modes.sort((a, b) => a - b);

    if (modes.length === 1) {
      modeClassification = `Unimodal (Muncul ${maxFreq} kali)`;
      modeText = modes.map(m => formatNum(m)).join(', ');
    } else if (modes.length === 2) {
      modeClassification = `Bimodal (Masing-masing muncul ${maxFreq} kali)`;
      modeText = modes.map(m => formatNum(m)).join(', ');
    } else {
      modeClassification = `Multimodal (Masing-masing muncul ${maxFreq} kali)`;
      modeText = modes.map(m => formatNum(m)).join(', ');
    }
  }

  // Minimum, Maksimum, Range
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // Varians & Standar Deviasi (Sampel & Populasi)
  const ss = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const sampleVariance = n > 1 ? ss / (n - 1) : 0;
  const populationVariance = ss / n;

  const sampleStdDev = Math.sqrt(sampleVariance);
  const populationStdDev = Math.sqrt(populationVariance);

  // Kuartil (Interpolasi Linier R-7) & IQR
  const calculatePercentile = (p) => {
    if (n === 1) return sorted[0];
    const index = p * (n - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;
    return sorted[lowerIndex] + weight * (sorted[upperIndex] - sorted[lowerIndex]);
  };

  const q1 = calculatePercentile(0.25);
  const q3 = calculatePercentile(0.75);
  const iqr = q3 - q1;

  // Deteksi Outlier (Tukey's Fences 1.5 * IQR)
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const lowerOutliers = [];
  const upperOutliers = [];
  const allOutliers = [];

  for (const num of sorted) {
    if (num < lowerFence) {
      lowerOutliers.push(num);
      allOutliers.push(num);
    } else if (num > upperFence) {
      upperOutliers.push(num);
      allOutliers.push(num);
    }
  }

  return {
    n: count,
    sum,
    mean,
    median,
    modeText,
    modeClassification,
    modes,
    maxFreq,
    hasMode,
    min,
    max,
    range,
    sampleVariance,
    populationVariance,
    sampleStdDev,
    populationStdDev,
    q1,
    q3,
    iqr,
    lowerFence,
    upperFence,
    lowerOutliers,
    upperOutliers,
    allOutliers,
    sortedData: sorted
  };
}
