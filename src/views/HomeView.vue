<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import TradeItem from '@/components/TradeItem.vue'
import type { GoldTrade } from '@/types/gold'
import { useTradeStore } from '@/stores/trade'
import { useQuoteStore } from '@/stores/quote'
import { formatAmount, formatNumber, formatRate, formatSignedAmount, toInputString, toNumber } from '@/utils/money'

const router = useRouter()
const { recentTrades, holdings, removeTrade } = useTradeStore()
const quote = useQuoteStore()

const holdingInfo = computed(() => holdings(quote.netValue.value))
const list = computed(() => recentTrades(10))

/** 收益率 / 盈亏配色：涨红跌绿 */
const profitClass = computed(() => {
  if (holdingInfo.value.profit > 0) return 'is-up'
  if (holdingInfo.value.profit < 0) return 'is-down'
  return ''
})

const changeClass = computed(() => {
  if (!quote.hasChange.value) return ''
  if (quote.change.value > 0) return 'is-up'
  if (quote.change.value < 0) return 'is-down'
  return ''
})

/** 更新今日净值 */
const showNetValue = ref(false)
const netValueInput = ref('')

function openNetValue() {
  netValueInput.value = quote.netValue.value > 0 ? toInputString(quote.netValue.value, 4) : ''
  showNetValue.value = true
}

function saveNetValue() {
  const value = toNumber(netValueInput.value)
  if (value <= 0) {
    showToast('请输入正确的净值')
    return
  }

  quote.updateNetValue(value)
  showToast('净值已更新')
}

function goTrade(type: 'buy' | 'sell') {
  router.push({ path: '/trade', query: { type } })
}

function goDetail(trade: GoldTrade) {
  router.push(`/trade/${trade.id}`)
}

async function onDelete(trade: GoldTrade) {
  try {
    await showConfirmDialog({ title: '删除交易', message: '确定要删除这条交易记录吗？' })
  } catch {
    return
  }

  removeTrade(trade.id)
  showToast('已删除')
}
</script>

<template>
  <div class="home">
    <section class="holdings">
      <header class="holdings__head">
        <span>持有金额（元）</span>
        <button type="button" class="holdings__update" @click="openNetValue">
          <van-icon name="edit" />更新净值
        </button>
      </header>

      <p class="holdings__amount"><i>¥</i>{{ formatAmount(holdingInfo.amount) }}</p>

      <p class="holdings__profit">
        <span>持仓收益</span>
        <b :class="profitClass">{{ formatSignedAmount(holdingInfo.profit) }}</b>
        <b :class="profitClass">（{{ formatRate(holdingInfo.profitRate) }}）</b>
      </p>

      <div class="holdings__metrics">
        <div class="holdings__metric">
          <span>持有份额</span>
          <b>{{ formatNumber(holdingInfo.shares, 4) }} 克</b>
        </div>
        <div class="holdings__metric">
          <span>持有成本</span>
          <b>¥{{ formatAmount(holdingInfo.cost) }}</b>
        </div>
        <div class="holdings__metric">
          <span>基金净值</span>
          <b>{{ formatNumber(quote.netValue.value, 4) }} 元/克</b>
        </div>
        <div class="holdings__metric">
          <span>日涨幅</span>
          <b :class="changeClass">
            <template v-if="quote.hasChange.value">{{ formatRate(quote.changeRate.value) }}</template>
            <template v-else>--</template>
          </b>
        </div>
      </div>
    </section>

    <section class="actions">
      <button type="button" class="actions__item actions__item--buy" @click="goTrade('buy')">
        <van-icon name="minus" />
        <span>买入</span>
      </button>
      <button type="button" class="actions__item actions__item--sell" @click="goTrade('sell')">
        <van-icon name="plus" />
        <span>卖出</span>
      </button>
    </section>

    <section class="records">
      <header class="records__head">
        <h2>最近交易</h2>
        <a class="records__more" @click="router.push('/trades')">
          交易明细<van-icon name="arrow" />
        </a>
      </header>

      <van-empty
        v-if="!list.length"
        image-size="88"
        description="还没有交易记录，点击上方按钮记一笔"
      />
      <trade-item
        v-for="trade in list"
        :key="trade.id"
        :trade="trade"
        show-date
        @select="goDetail(trade)"
        @delete="onDelete(trade)"
      />
    </section>

    <van-dialog
      v-model:show="showNetValue"
      title="更新今日净值"
      show-cancel-button
      confirm-button-text="保存"
      @confirm="saveNetValue"
    >
      <div class="net-value">
        <van-field
          v-model="netValueInput"
          label="基金净值"
          placeholder="请输入今日净值"
          inputmode="decimal"
          clearable
        >
          <template #right-icon>
            <span class="net-value__unit">元/克</span>
          </template>
        </van-field>
        <p v-if="quote.prevPoint.value" class="net-value__hint">
          上次净值 {{ formatNumber(quote.prevPoint.value.netValue, 4) }}（{{ quote.prevPoint.value.date }}）
        </p>
      </div>
    </van-dialog>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding: 12px 16px 0;
}

.holdings {
  position: relative;
  padding: 18px 20px 16px;
  color: #fff;
  border-radius: 16px;
  background: linear-gradient(135deg, #5b8cff 0%, #7a5cff 100%);
  box-shadow: 0 8px 20px rgba(91, 140, 255, 0.28);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -30px;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.12);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    opacity: 0.92;
  }

  &__update {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    color: #fff;
    background-color: rgba(255, 255, 255, 0.22);

    &:active {
      opacity: 0.8;
    }
  }

  &__amount {
    margin: 10px 0 8px;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0.5px;

    i {
      margin-right: 4px;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
    }
  }

  &__profit {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 12px;
    opacity: 0.95;

    b {
      font-size: 14px;
      font-weight: 600;
    }
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.24);
  }

  &__metric {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    opacity: 0.92;

    b {
      font-size: 15px;
      font-weight: 600;
    }
  }

  /* 渐变卡片上使用浅色高亮表示涨跌 */
  .is-up {
    color: #ffd2cf;
  }

  .is-down {
    color: #c8f3e4;
  }
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1;
    height: 46px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 500;
    color: #fff;

    &--buy {
      background: linear-gradient(135deg, #ff9a6b 0%, #ff7a45 100%);
      box-shadow: 0 6px 14px rgba(255, 122, 69, 0.24);
    }

    &--sell {
      background: linear-gradient(135deg, #2fd39a 0%, #10ac84 100%);
      box-shadow: 0 6px 14px rgba(16, 172, 132, 0.24);
    }

    &:active {
      opacity: 0.86;
    }
  }
}

.records {
  margin-top: 16px;
  border-radius: 12px;
  background-color: #fff;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 8px;

    h2 {
      font-size: 16px;
      font-weight: 600;
    }
  }

  &__more {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    color: var(--fa-text-color-secondary);
  }

  :deep(.trade-item) {
    border-top: 1px solid #f5f6f8;
  }
}

.net-value {
  padding: 8px 0 4px;

  &__unit {
    font-size: 13px;
    color: var(--fa-text-color-secondary);
  }

  &__hint {
    padding: 8px 16px 0;
    font-size: 12px;
    color: var(--fa-text-color-secondary);
  }
}
</style>
