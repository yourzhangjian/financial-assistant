import type { Bill, BillPayload, BillSummary } from '@/types/bill'
import { getMonthKey } from '@/utils/date'
import { loadJSON, saveJSON } from '@/utils/storage'

const STORAGE_KEY = 'bills'

/** 全部账单（模块级单例，登录态与账单分离存储） */
const bills = ref<Bill[]>(loadJSON<Bill[]>(STORAGE_KEY, []))

watch(
  bills,
  (value) => {
    saveJSON(STORAGE_KEY, value)
  },
  { deep: true },
)

function createId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/** 按日期倒序，同一天按创建时间倒序 */
function compareBill(a: Bill, b: Bill): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return b.createdAt - a.createdAt
}

/** 统计一组账单的收支情况 */
export function summarize(list: Bill[]): BillSummary {
  let expense = 0
  let income = 0

  for (const bill of list) {
    if (bill.type === 'income') income += bill.amount
    else expense += bill.amount
  }

  return {
    expense: Math.round(expense * 100) / 100,
    income: Math.round(income * 100) / 100,
    balance: Math.round((income - expense) * 100) / 100,
    count: list.length,
  }
}

export function useBillStore() {
  /** 全部账单，按日期倒序 */
  const sortedBills = computed(() => [...bills.value].sort(compareBill))

  /** 最近的若干条账单 */
  function recentBills(limit = 10): Bill[] {
    return sortedBills.value.slice(0, limit)
  }

  /** 某个月的账单，month 格式 YYYY-MM */
  function billsOfMonth(month: string): Bill[] {
    return sortedBills.value.filter((bill) => bill.date.startsWith(month))
  }

  /** 某个月的收支统计 */
  function monthSummary(month: string): BillSummary {
    return summarize(billsOfMonth(month))
  }

  /** 全部账单的收支统计 */
  function totalSummary(): BillSummary {
    return summarize(bills.value)
  }

  function getBill(id: string): Bill | undefined {
    return bills.value.find((bill) => bill.id === id)
  }

  /** 新增一条账单 */
  function addBill(payload: BillPayload): Bill {
    const bill: Bill = { ...payload, id: createId(), createdAt: Date.now() }
    bills.value.unshift(bill)
    return bill
  }

  /** 更新一条账单 */
  function updateBill(id: string, payload: BillPayload): Bill | undefined {
    const index = bills.value.findIndex((bill) => bill.id === id)
    if (index < 0) return undefined

    const bill: Bill = { ...bills.value[index], ...payload }
    bills.value[index] = bill
    return bill
  }

  /** 删除一条账单 */
  function removeBill(id: string): void {
    bills.value = bills.value.filter((bill) => bill.id !== id)
  }

  /** 清空全部账单 */
  function clearBills(): void {
    bills.value = []
  }

  /** 所有出现过的月份（倒序，包含当前月） */
  function availableMonths(): string[] {
    const months = new Set(bills.value.map((bill) => bill.date.slice(0, 7)))
    months.add(getMonthKey())
    return [...months].sort((a, b) => (a < b ? 1 : -1))
  }

  return {
    bills,
    sortedBills,
    recentBills,
    billsOfMonth,
    monthSummary,
    totalSummary,
    getBill,
    addBill,
    updateBill,
    removeBill,
    clearBills,
    availableMonths,
  }
}
