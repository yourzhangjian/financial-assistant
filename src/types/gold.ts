/** 交易类型：买入 / 卖出 */
export type TradeType = 'buy' | 'sell'

/** 一笔黄金交易记录 */
export interface GoldTrade {
  id: string
  type: TradeType
  /** 实际支付：买入为实付金额、卖出为实收金额，单位：元 */
  amount: number
  /** 确认净值，单位：元/克 */
  netValue: number
  /** 确认份额，单位：克 */
  shares: number
  /** 手续费，单位：元 */
  fee: number
  /** 交易日期 YYYY-MM-DD */
  date: string
  /** 备注 */
  note: string
  /** 创建时间戳 */
  createdAt: number
}

/** 新增 / 编辑交易时提交的数据 */
export type TradePayload = Omit<GoldTrade, 'id' | 'createdAt'>

/** 交易统计（按全部或某个月） */
export interface TradeStats {
  /** 买入金额合计（实际支付） */
  buyAmount: number
  /** 卖出金额合计（实际收到） */
  sellAmount: number
  /** 手续费合计 */
  fee: number
  /** 买入份额合计（克） */
  buyShares: number
  /** 卖出份额合计（克） */
  sellShares: number
  /** 交易笔数 */
  count: number
}

/** 持仓统计 */
export interface Holdings {
  /** 持有份额（克） */
  shares: number
  /** 持有金额（元）= 持有份额 × 最新净值 */
  amount: number
  /** 持有成本（元）= 买入实际支付 − 卖出实际收到 */
  cost: number
  /** 持有收益（元）= 持有金额 − 持有成本 */
  profit: number
  /** 收益率（小数） */
  profitRate: number
}

/** 净值记录 */
export interface NetValuePoint {
  /** 日期 YYYY-MM-DD */
  date: string
  /** 净值（元/克） */
  netValue: number
}
