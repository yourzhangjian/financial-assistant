/** 四舍五入保留两位小数，返回字符串（规避浮点误差） */
export function toFixed2(value: number): string {
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2)
}

/** 金额展示：千分位 + 两位小数，如 1,234.56 */
export function formatAmount(value: number): string {
  const [integer, decimal] = toFixed2(value).split('.')
  return `${integer.replace(/\B(?=(\d{3})+$)/g, ',')}.${decimal}`
}

/** 把输入框 / 数字键盘中的金额字符串转成数字，非法输入返回 0 */
export function parseAmount(value: string): number {
  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100) / 100
}
