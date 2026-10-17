import type { GoldTrade, Holdings, TradePayload, TradeStats } from '@/types/gold'
import { getMonthKey } from '@/utils/date'
import { roundTo } from '@/utils/money'
import { loadJSON, saveJSON } from '@/utils/storage'

const STORAGE_KEY = 'trades'

/** 全部交易（模块级单例） */
const trades = ref<GoldTrade[]>(loadJSON<GoldTrade[]>(STORAGE_KEY, []))

watch(
  trades,
  (value) => {
    saveJSON(STORAGE_KEY, value)
  },
  { deep: true },
)

function createId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/** 按日期倒序，同一天按创建时间倒序 */
function compareTrade(a: GoldTrade, b: GoldTrade): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return b.createdAt - a.createdAt
}

/** 统计一组交易的买入、卖出、手续费与份额 */
export function summarize(list: GoldTrade[]): TradeStats {
  let buyAmount = 0
  let sellAmount = 0
  let buyShares = 0
  let sellShares = 0
  let fee = 0

  for (const trade of list) {
    fee += trade.fee
    if (trade.type === 'buy') {
      buyAmount += trade.amount
      buyShares += trade.shares
    } else {
      sellAmount += trade.amount
      sellShares += trade.shares
    }
  }

  return {
    buyAmount: roundTo(buyAmount, 2),
    sellAmount: roundTo(sellAmount, 2),
    fee: roundTo(fee, 2),
    buyShares: roundTo(buyShares, 4),
    sellShares: roundTo(sellShares, 4),
    count: list.length,
  }
}

/**
 * 按持仓口径计算持仓统计
 * - 持有份额 = 买入份额 − 卖出份额
 * - 持有成本 = 买入实际支付 − 卖出实际收到（净投入）
 * - 持有金额 = 持有份额 × 最新净值
 * - 持有收益 = 持有金额 − 持有成本
 */
export function holdingsOf(list: GoldTrade[], netValue: number): Holdings {
  const stats = summarize(list)
  const shares = roundTo(stats.buyShares - stats.sellShares, 4)
  const cost = roundTo(stats.buyAmount - stats.sellAmount, 2)
  const amount = roundTo(shares * netValue, 2)
  const profit = roundTo(amount - cost, 2)

  return {
    shares,
    amount,
    cost,
    profit,
    profitRate: cost > 0 ? profit / cost : 0,
  }
}

export function useTradeStore() {
  /** 全部交易，按日期倒序 */
  const sortedTrades = computed(() => [...trades.value].sort(compareTrade))

  /** 最近的若干笔交易 */
  function recentTrades(limit = 10): GoldTrade[] {
    return sortedTrades.value.slice(0, limit)
  }

  /** 某个月的交易，month 格式 YYYY-MM */
  function tradesOfMonth(month: string): GoldTrade[] {
    return sortedTrades.value.filter((trade) => trade.date.startsWith(month))
  }

  /** 某个月（或全部）的统计 */
  function statsOf(list?: GoldTrade[]): TradeStats {
    return summarize(list ?? trades.value)
  }

  /** 某个月的统计 */
  function monthStats(month: string): TradeStats {
    return summarize(tradesOfMonth(month))
  }

  /** 持仓统计，需要传入最新净值（元/克） */
  function holdings(netValue: number): Holdings {
    return holdingsOf(trades.value, netValue)
  }

  function getTrade(id: string): GoldTrade | undefined {
    return trades.value.find((trade) => trade.id === id)
  }

  /** 新增一笔交易 */
  function addTrade(payload: TradePayload): GoldTrade {
    const trade: GoldTrade = { ...payload, id: createId(), createdAt: Date.now() }
    trades.value.unshift(trade)
    return trade
  }

  /** 更新一笔交易 */
  function updateTrade(id: string, payload: TradePayload): GoldTrade | undefined {
    const index = trades.value.findIndex((trade) => trade.id === id)
    if (index < 0) return undefined

    const trade: GoldTrade = { ...trades.value[index], ...payload }
    trades.value[index] = trade
    return trade
  }

  /** 删除一笔交易 */
  function removeTrade(id: string): void {
    trades.value = trades.value.filter((trade) => trade.id !== id)
  }

  /** 清空全部交易 */
  function clearTrades(): void {
    trades.value = []
  }

  /** 所有出现过的月份（倒序，包含当前月） */
  function availableMonths(): string[] {
    const months = new Set(trades.value.map((trade) => trade.date.slice(0, 7)))
    months.add(getMonthKey())
    return [...months].sort((a, b) => (a < b ? 1 : -1))
  }

  return {
    trades,
    sortedTrades,
    recentTrades,
    tradesOfMonth,
    statsOf,
    monthStats,
    holdings,
    getTrade,
    addTrade,
    updateTrade,
    removeTrade,
    clearTrades,
    availableMonths,
  }
}
