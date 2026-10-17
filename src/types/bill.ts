/** 账单类型：支出 / 收入 */
export type BillType = 'expense' | 'income'

/** 一条账单记录 */
export interface Bill {
  id: string
  type: BillType
  /** 金额，单位：元 */
  amount: number
  /** 分类 id */
  categoryId: string
  /** 备注 */
  note: string
  /** 记账日期，格式 YYYY-MM-DD */
  date: string
  /** 创建时间戳 */
  createdAt: number
}

/** 新增 / 编辑账单时提交的数据 */
export type BillPayload = Omit<Bill, 'id' | 'createdAt'>

/** 账单分类 */
export interface Category {
  id: string
  name: string
  type: BillType
  /** vant 图标名 */
  icon: string
  /** 主题色 */
  color: string
}

/** 收支统计结果 */
export interface BillSummary {
  /** 支出合计 */
  expense: number
  /** 收入合计 */
  income: number
  /** 结余 = 收入 - 支出 */
  balance: number
  /** 账单笔数 */
  count: number
}
