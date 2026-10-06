/**
 * Tính thu nhập phụ dự kiến dựa trên tiến độ học tập
 * Công thức: progressPct × INCOME_PER_PERCENT
 * Ví dụ: 100% tiến độ = 1.850.000 VND/tháng
 */

const INCOME_PER_PERCENT = 18500; // VND per 1%

/**
 * Calculate estimated monthly side income based on course progress
 * @param {Array} progressList - Array of progress objects with progressPct field
 * @returns {number} - Estimated income in VND
 */
export function calculateSideIncome(progressList) {
  if (!progressList || progressList.length === 0) {
    return 0;
  }

  const totalProgress = progressList.reduce((sum, progress) => {
    return sum + (progress.progressPct || 0);
  }, 0);

  const income = Math.round(totalProgress * INCOME_PER_PERCENT);
  return income;
}

/**
 * Format income as localized string
 * @param {number} income - Income in VND
 * @returns {string} - Formatted string like "1.850.000 VND"
 */
export function formatIncome(income) {
  return income.toLocaleString('vi-VN') + ' VND';
}

/**
 * Calculate income growth percentage
 * @param {number} currentIncome - Current monthly income
 * @param {number} baseIncome - Base income before side income
 * @returns {number} - Growth percentage
 */
export function calculateIncomeGrowth(currentIncome, baseIncome = 5000000) {
  if (baseIncome === 0) return 0;
  return Math.round(((currentIncome / baseIncome) * 100));
}
