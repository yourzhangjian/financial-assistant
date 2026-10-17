/** 四舍五入到指定小数位，返回数字 */
export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** 四舍五入保留两位小数，返回字符串（用于金额输入框） */
export function toFixed2(value: number): string {
  return roundTo(value, 2).toFixed(2)
}

/** 字符串转数字，不做四舍五入，非法输入返回 0（用于净值 / 份额） */
export function toNumber(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** 金额转数字，保留两位小数 */
export function parseAmount(value: string): number {
  return roundTo(toNumber(value), 2)
}

/** 金额展示：千分位 + 两位小数，如 1,234.56 */
export function formatAmount(value: number): string {
  const [integer, decimal] = roundTo(value, 2).toFixed(2).split('.')
  return `${integer.replace(/\B(?=(\d{3})+$)/g, ',')}.${decimal}`
}

/** 净值 / 份额展示：固定小数位 + 千分位，如 828.4000、10.5864 */
export function formatNumber(value: number, digits = 4): string {
  const [integer, decimal] = roundTo(value, digits).toFixed(digits).split('.')
  return `${integer.replace(/\B(?=(\d{3})+$)/g, ',')}.${decimal}`
}

/** 净值 / 份额输入框回填：去掉多余的 0，如 828.4 */
export function toInputString(value: number, digits = 4): string {
  return String(roundTo(value, digits))
}

/** 涨跌幅 / 收益率展示，带正负号，如 +0.25%、-1.30% */
export function formatRate(rate: number, digits = 2): string {
  const percent = roundTo(rate * 100, digits)
  return `${percent > 0 ? '+' : ''}${percent.toFixed(digits)}%`
}

/** 金额展示，带正负号，如 +1,690.35 / -5,000.50 */
export function formatSignedAmount(value: number): string {
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatAmount(Math.abs(value))}`
}
