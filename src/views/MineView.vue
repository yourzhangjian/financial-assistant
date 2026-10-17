<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import type { TradePayload } from '@/types/gold'
import { useTradeStore } from '@/stores/trade'
import { useQuoteStore } from '@/stores/quote'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import { formatAmount, formatNumber, formatRate } from '@/utils/money'

const router = useRouter()
const { user, logout } = useUserStore()
const { trades, statsOf, holdings, addTrade, clearTrades } = useTradeStore()
const quote = useQuoteStore()

const stats = computed(() => statsOf())
const holdingInfo = computed(() => holdings(quote.netValue.value))

/** 载入示例数据，方便快速体验 */
function loadSample() {
  const now = Date.now()
  const dayAgo = (days: number) => formatDate(new Date(now - days * 86400000))

  const samples: TradePayload[] = [
    { type: 'buy', amount: 5000, netValue: 780.25, shares: 6.4076, fee: 0.5, note: '首次建仓', date: dayAgo(9) },
    { type: 'buy', amount: 3000, netValue: 796.8, shares: 3.7647, fee: 0.3, note: '定期买入', date: dayAgo(7) },
    { type: 'sell', amount: 1690.35, netValue: 845.6, shares: 2, fee: 0.85, note: '部分止盈', date: dayAgo(5) },
    { type: 'buy', amount: 2000, netValue: 828.4, shares: 2.4141, fee: 0.2, note: '回调补仓', date: dayAgo(3) },
  ]

  samples.forEach((item) => addTrade(item))

  // 最近三天的净值，用于展示日涨幅
  quote.updateNetValue(824.1, dayAgo(2))
  quote.updateNetValue(826.35, dayAgo(1))
  quote.updateNetValue(828.4, dayAgo(0))

  showToast('示例数据已载入')
}

async function onClear() {
  try {
    await showConfirmDialog({ title: '清空数据', message: '将删除全部交易记录与净值记录，且无法恢复' })
  } catch {
    return
  }

  clearTrades()
  quote.clearNetValues()
  showToast('已清空')
}

async function onLogout() {
  try {
    await showConfirmDialog({ title: '退出登录', message: '确定要退出当前账号吗？' })
  } catch {
    return
  }

  logout()
  router.replace('/login')
}
</script>

<template>
  <div class="mine">
    <section class="profile">
      <div class="profile__avatar">
        <van-icon name="user-o" />
      </div>
      <div class="profile__info">
        <p class="profile__name">{{ user?.nickname || '未登录' }}</p>
        <p class="profile__account">账号：{{ user?.username || '-' }}</p>
      </div>
    </section>

    <section class="stats">
      <div class="stats__item">
        <b>{{ stats.count }}</b>
        <span>交易笔数</span>
      </div>
      <div class="stats__item">
        <b class="stats__value--buy">¥{{ formatAmount(stats.buyAmount) }}</b>
        <span>累计买入</span>
      </div>
      <div class="stats__item">
        <b class="stats__value--sell">¥{{ formatAmount(stats.sellAmount) }}</b>
        <span>累计卖出</span>
      </div>
      <div class="stats__item">
        <b>¥{{ formatAmount(stats.fee) }}</b>
        <span>手续费合计</span>
      </div>
    </section>

    <van-cell-group inset class="mine__cells">
      <van-cell title="持有份额" :value="`${formatNumber(holdingInfo.shares, 4)} 克`" />
      <van-cell title="持有金额" :value="`¥${formatAmount(holdingInfo.amount)}`" />
      <van-cell title="持有成本" :value="`¥${formatAmount(holdingInfo.cost)}`" />
      <van-cell title="基金净值" :value="`${formatNumber(quote.netValue.value, 4)} 元/克`" />
      <van-cell
        title="日涨幅"
        :value="quote.hasChange.value ? formatRate(quote.changeRate.value) : '--'"
      />
    </van-cell-group>

    <van-cell-group inset class="mine__cells">
      <van-cell title="交易明细" :value="`共 ${trades.length} 笔`" is-link @click="router.push('/trades')" />
      <van-cell title="载入示例数据" is-link @click="loadSample" />
      <van-cell title="清空全部数据" is-link @click="onClear" />
    </van-cell-group>

    <div class="mine__logout">
      <van-button block round plain type="danger" @click="onLogout">退出登录</van-button>
    </div>

    <p class="mine__version">财务助理 v1.0.0 · 数据仅保存在本机</p>
  </div>
</template>

<style scoped lang="scss">
.mine {
  padding: 12px 16px 0;
}

.profile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, #5b8cff 0%, #7a5cff 100%);
  box-shadow: 0 8px 20px rgba(91, 140, 255, 0.28);

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    font-size: 30px;
    background-color: rgba(255, 255, 255, 0.22);
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
  }

  &__account {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.86;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 0;
  margin-top: 12px;
  padding: 16px 0;
  border-radius: 12px;
  background-color: #fff;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--fa-text-color-secondary);

    &:nth-child(even) {
      border-left: 1px solid #f2f3f5;
    }

    b {
      font-size: 16px;
      font-weight: 600;
      color: var(--fa-text-color);
    }
  }

  &__value--buy {
    color: var(--fa-buy-color) !important;
  }

  &__value--sell {
    color: var(--fa-sell-color) !important;
  }
}

.mine__cells {
  margin: 12px 0 0;
}

.mine__logout {
  margin: 20px 0 0;
}

.mine__version {
  margin-top: 16px;
  font-size: 12px;
  text-align: center;
  color: var(--fa-text-color-secondary);
}
</style>
