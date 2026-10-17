import type { NetValuePoint } from '@/types/gold'
import { formatDate } from '@/utils/date'
import { roundTo } from '@/utils/money'
import { loadJSON, saveJSON } from '@/utils/storage'

const STORAGE_KEY = 'net-values'

/** 净值记录（按日期升序保存） */
const points = ref<NetValuePoint[]>(loadJSON<NetValuePoint[]>(STORAGE_KEY, []))

watch(
  points,
  (value) => {
    saveJSON(STORAGE_KEY, value)
  },
  { deep: true },
)

function sortPoints(list: NetValuePoint[]): NetValuePoint[] {
  return [...list].sort((a, b) => (a.date < b.date ? -1 : 1))
}

/** 基金净值（元/克）与日涨幅 */
export function useQuoteStore() {
  /** 净值历史，按日期升序 */
  const history = computed(() => sortPoints(points.value))

  /** 最新一条净值记录 */
  const latestPoint = computed(() => history.value[history.value.length - 1])

  /** 上一条净值记录 */
  const prevPoint = computed(() => history.value[history.value.length - 2])

  /** 最新净值，元/克 */
  const netValue = computed(() => latestPoint.value?.netValue ?? 0)

  /** 较上次净值的涨跌额 */
  const change = computed(() => {
    if (!latestPoint.value || !prevPoint.value) return 0
    return roundTo(latestPoint.value.netValue - prevPoint.value.netValue, 4)
  })

  /** 日涨幅（小数），没有上一条记录时无法计算 */
  const changeRate = computed(() => {
    if (!prevPoint.value || prevPoint.value.netValue <= 0) return 0
    return change.value / prevPoint.value.netValue
  })

  /** 是否可以计算日涨幅 */
  const hasChange = computed(() => Boolean(latestPoint.value && prevPoint.value))

  /** 更新某天（默认今天）的净值，同一天覆盖 */
  function updateNetValue(value: number, date = formatDate(new Date())): void {
    const index = points.value.findIndex((point) => point.date === date)
    if (index >= 0) {
      points.value[index] = { date, netValue: value }
    } else {
      points.value = sortPoints([...points.value, { date, netValue: value }])
    }
  }

  /** 首次记账时用交易的确认净值兜底，避免没有净值时持仓金额为 0 */
  function ensureNetValue(value: number, date: string): void {
    if (points.value.length || value <= 0) return
    points.value = [{ date, netValue: value }]
  }

  /** 清空净值记录 */
  function clearNetValues(): void {
    points.value = []
  }

  return {
    points,
    history,
    latestPoint,
    prevPoint,
    netValue,
    change,
    changeRate,
    hasChange,
    updateNetValue,
    ensureNetValue,
    clearNetValues,
  }
}
