<script setup lang="ts">
import type { GoldTrade } from '@/types/gold'
import { formatDate } from '@/utils/date'
import { formatAmount, formatNumber } from '@/utils/money'

const props = withDefaults(
  defineProps<{
    trade: GoldTrade
    /** 是否在描述中显示交易日期 */
    showDate?: boolean
  }>(),
  { showDate: false },
)

const emit = defineEmits<{
  select: []
  delete: []
}>()

const typeText = computed(() => (props.trade.type === 'buy' ? '买入' : '卖出'))

/** 买入为资金流出（-），卖出为资金流入（+） */
const amountText = computed(() => {
  const prefix = props.trade.type === 'buy' ? '-' : '+'
  return `${prefix}${formatAmount(props.trade.amount)}`
})

/** 描述：确认净值、确认份额、手续费、备注、日期 */
const desc = computed(() => {
  const parts = [
    `净值 ${formatNumber(props.trade.netValue, 4)}`,
    `${formatNumber(props.trade.shares, 4)} 克`,
  ]
  if (props.trade.fee > 0) parts.push(`手续费 ${formatAmount(props.trade.fee)}`)
  if (props.trade.note) parts.push(props.trade.note)
  if (props.showDate) parts.push(formatDate(props.trade.date, 'MM-DD'))
  return parts.join(' · ')
})
</script>

<template>
  <van-swipe-cell :right-width="76" class="trade-item__cell">
    <div class="trade-item" @click="emit('select')">
      <span class="trade-item__badge" :class="`trade-item__badge--${trade.type}`">
        {{ trade.type === 'buy' ? '买' : '卖' }}
      </span>
      <div class="trade-item__main">
        <p class="trade-item__name">黄金{{ typeText }}</p>
        <p class="trade-item__desc">{{ desc }}</p>
      </div>
      <span class="trade-item__amount" :class="`trade-item__amount--${trade.type}`">
        {{ amountText }}
      </span>
    </div>

    <template #right>
      <van-button square type="danger" text="删除" class="trade-item__delete" @click="emit('delete')" />
    </template>
  </van-swipe-cell>
</template>

<style scoped lang="scss">
.trade-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 15px;
    font-weight: 600;

    &--buy {
      color: var(--fa-buy-color);
      background-color: rgba(255, 122, 69, 0.12);
    }

    &--sell {
      color: var(--fa-sell-color);
      background-color: rgba(16, 172, 132, 0.12);
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    color: var(--fa-text-color);
  }

  &__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--fa-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__amount {
    flex: none;
    font-size: 16px;
    font-weight: 600;

    &--buy {
      color: var(--fa-buy-color);
    }

    &--sell {
      color: var(--fa-sell-color);
    }
  }

  &__delete {
    height: 100%;
  }
}
</style>
