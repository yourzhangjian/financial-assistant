<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import TradeItem from '@/components/TradeItem.vue'
import type { GoldTrade } from '@/types/gold'
import { summarize, useTradeStore } from '@/stores/trade'
import { addMonths, formatDateLabel, formatMonthLabel, getMonthKey } from '@/utils/date'
import { formatAmount } from '@/utils/money'

const router = useRouter()
const { tradesOfMonth, removeTrade } = useTradeStore()

const month = ref(getMonthKey())
const monthLabel = computed(() => formatMonthLabel(month.value))
const isCurrentMonth = computed(() => month.value === getMonthKey())

const list = computed(() => tradesOfMonth(month.value))
const stats = computed(() => summarize(list.value))

/** 按日期分组，日期倒序 */
const groups = computed(() => {
  const map = new Map<string, GoldTrade[]>()
  for (const trade of list.value) {
    const items = map.get(trade.date)
    if (items) items.push(trade)
    else map.set(trade.date, [trade])
  }
  return [...map.entries()].map(([date, items]) => ({ date, items, stats: summarize(items) }))
})

function prevMonth() {
  month.value = getMonthKey(addMonths(`${month.value}-01`, -1))
}

function nextMonth() {
  if (isCurrentMonth.value) return
  month.value = getMonthKey(addMonths(`${month.value}-01`, 1))
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
  <div class="trades">

    <div class="trades__body">
      <div class="month-bar">
      <button type="button" class="month-bar__nav" @click="prevMonth">
        <van-icon name="arrow-left" />
      </button>
      <span class="month-bar__label">{{ monthLabel }}</span>
      <button type="button" class="month-bar__nav" :disabled="isCurrentMonth" @click="nextMonth">
        <van-icon name="arrow" />
      </button>
    </div>

    <section class="month-summary">
      <div class="month-summary__item">
        <span>买入</span>
        <b class="month-summary__value--buy">¥{{ formatAmount(stats.buyAmount) }}</b>
      </div>
      <div class="month-summary__item">
        <span>卖出</span>
        <b class="month-summary__value--sell">¥{{ formatAmount(stats.sellAmount) }}</b>
      </div>
      <div class="month-summary__item">
        <span>手续费</span>
        <b>¥{{ formatAmount(stats.fee) }}</b>
      </div>
    </section>

    <van-empty v-if="!groups.length" image-size="88" description="本月还没有交易记录" />

    <section v-for="group in groups" :key="group.date" class="trade-group">
      <header class="trade-group__head">
        <span class="trade-group__date">{{ formatDateLabel(group.date) }}</span>
        <span class="trade-group__total">
          <i v-if="group.stats.buyAmount">买入 ¥{{ formatAmount(group.stats.buyAmount) }}</i>
          <i v-if="group.stats.sellAmount">卖出 ¥{{ formatAmount(group.stats.sellAmount) }}</i>
        </span>
      </header>
      <trade-item
        v-for="item in group.items"
        :key="item.id"
        :trade="item"
        @select="goDetail(item)"
        @delete="onDelete(item)"
      />
    </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trades {
  padding-bottom: 24px;
}

.trades__body {
  padding: 12px 16px 0;
}

.month-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 4px 0 12px;

  &__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    font-size: 16px;
    color: var(--fa-text-color);
    background-color: #fff;

    &:disabled {
      color: #c8c9cc;
    }
  }

  &__label {
    min-width: 96px;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }
}

.month-summary {
  display: flex;
  padding: 14px 16px;
  border-radius: 12px;
  background-color: #fff;

  &__item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: var(--fa-text-color-secondary);

    b {
      font-size: 15px;
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

.trade-group {
  margin-top: 16px;
  border-radius: 12px;
  background-color: #fff;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 8px;
    font-size: 12px;
    color: var(--fa-text-color-secondary);
  }

  &__date {
    font-size: 13px;
    font-weight: 500;
    color: var(--fa-text-color);
  }

  &__total {
    display: flex;
    gap: 10px;

    i {
      font-style: normal;
    }
  }

  :deep(.trade-item) {
    border-top: 1px solid #f5f6f8;
  }
}
</style>
