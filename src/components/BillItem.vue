<script setup lang="ts">
import type { Bill } from '@/types/bill'
import { getCategory } from '@/constants/categories'
import { formatDate } from '@/utils/date'
import { formatAmount } from '@/utils/money'

const props = withDefaults(
  defineProps<{
    bill: Bill
    /** 是否在备注后显示日期 */
    showDate?: boolean
  }>(),
  { showDate: false },
)

const emit = defineEmits<{
  select: []
  delete: []
}>()

const category = computed(() => getCategory(props.bill.type, props.bill.categoryId))

const iconStyle = computed(() => {
  const color = category.value?.color ?? '#8395a7'
  return { color, backgroundColor: `${color}1a` }
})

const amountText = computed(() => {
  const prefix = props.bill.type === 'expense' ? '-' : '+'
  return `${prefix}${formatAmount(props.bill.amount)}`
})

const desc = computed(() => {
  const parts: string[] = []
  if (props.bill.note) parts.push(props.bill.note)
  if (props.showDate) parts.push(formatDate(props.bill.date, 'MM-DD'))
  return parts.join(' · ')
})
</script>

<template>
  <van-swipe-cell :right-width="76" class="bill-item__cell">
    <div class="bill-item" @click="emit('select')">
      <span class="bill-item__icon" :style="iconStyle">
        <van-icon :name="category?.icon ?? 'ellipsis'" />
      </span>
      <div class="bill-item__main">
        <p class="bill-item__name">{{ category?.name ?? '未分类' }}</p>
        <p v-if="desc" class="bill-item__desc">{{ desc }}</p>
      </div>
      <span class="bill-item__amount" :class="`bill-item__amount--${bill.type}`">
        {{ amountText }}
      </span>
    </div>

    <template #right>
      <van-button square type="danger" text="删除" class="bill-item__delete" @click="emit('delete')" />
    </template>
  </van-swipe-cell>
</template>

<style scoped lang="scss">
.bill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 20px;
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

    &--expense {
      color: var(--fa-expense-color);
    }

    &--income {
      color: var(--fa-income-color);
    }
  }

  &__delete {
    height: 100%;
  }
}
</style>
