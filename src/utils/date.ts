const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const pad = (value: number) => String(value).padStart(2, '0')

/** 把 Date / 时间戳 / 日期字符串统一转成 Date 对象 */
export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return new Date(value)
  if (typeof value === 'number') return new Date(value)
  // iOS 不支持 YYYY-MM-DD 格式，需要替换成 YYYY/MM/DD
  return new Date(value.replace(/-/g, '/'))
}

/** 格式化日期，支持 YYYY / MM / DD / HH / mm / ss 占位符 */
export function formatDate(value: Date | string | number, format = 'YYYY-MM-DD'): string {
  const date = toDate(value)
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (key) => map[key] ?? key)
}

/** 月份标识，格式 YYYY-MM */
export function getMonthKey(value: Date | string | number = new Date()): string {
  return formatDate(value, 'YYYY-MM')
}

/** 在指定日期上增减月份，返回新的 Date */
export function addMonths(value: Date | string | number, offset: number): Date {
  const date = toDate(value)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + offset)
  // 处理 1 月 31 日加一个月这类越界情况
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return date
}

/** 月份展示文案，如 2026年10月 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  return `${year}年${Number(month)}月`
}

/** 日期展示文案：今天 / 昨天 / 10月17日 周六 */
export function formatDateLabel(value: Date | string | number): string {
  const date = toDate(value)
  const now = new Date()
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const diffDays = Math.round((today - target) / 86400000)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return formatDayLabel(date)
}

/** 账单分组头文案，如 10月17日 周六 */
export function formatDayLabel(value: Date | string | number): string {
  const date = toDate(value)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEK_DAYS[date.getDay()]}`
}
