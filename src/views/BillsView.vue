<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import BillItem from '@/components/BillItem.vue'
import type { Bill } from '@/types/bill'
import { summarize, useBillStore } from '@/stores/bill'
import { addMonths, formatDateLabel, formatMonthLabel, getMonthKey } from '@/utils/date'
import { formatAmount } from '@/utils/money'

const router = useRouter()
const { billsOfMonth, removeBill } = useBillStore()

const month = ref(getMonthKey())
const monthLabel = computed(() => formatMonthLabel(month.value))
const isCurrentMonth = computed(() => month.value === getMonthKey())

const list = computed(() => billsOfMonth(month.value))
const summary = computed(() => summarize(list.value))

/** 按日期分组，日期倒序 */
const groups = computed(() => {
  const map = new Map<string, Bill[]>()
  for (const bill of list.value) {
    const items = map.get(bill.date)
    if (items) items.push(bill)
    else map.set(bill.date, [bill])
  }
  return [...map.entries()].map(([date, items]) => ({ date, items, summary: summarize(items) }))
})

function prevMonth() {
  month.value = getMonthKey(addMonths(`${month.value}-01`, -1))
}

function nextMonth() {
  if (isCurrentMonth.value) return
  month.value = getMonthKey(addMonths(`${month.value}-01`, 1))
}

function goDetail(bill: Bill) {
  router.push(`/record/${bill.id}`)
}

async function onDelete(bill: Bill) {
  try {
    await showConfirmDialog({ title: '删除账单', message: '确定要删除这条账单吗？' })
  } catch {
    return
  }

  removeBill(bill.id)
  showToast('已删除')
}
</script>

<template>
  <div class="bills">
    <div class="month-bar">
      <button type="button" class="month-bar__nav" @click="prevMonth">
        <van-icon name="arrow-left" />
      </button>
      <span class="month-bar__label">{{ monthLabel }}</span>
      <button
        type="button"
        class="month-bar__nav"
        :disabled="isCurrentMonth"
        @click="nextMonth"
      >
        <van-icon name="arrow" />
      </button>
    </div>

    <section class="month-summary">
      <div class="month-summary__item">
        <span>支出</span>
        <b class="month-summary__value--expense">¥{{ formatAmount(summary.expense) }}</b>
      </div>
      <div class="month-summary__item">
        <span>收入</span>
        <b class="month-summary__value--income">¥{{ formatAmount(summary.income) }}</b>
      </div>
      <div class="month-summary__item">
        <span>结余</span>
        <b>¥{{ formatAmount(summary.balance) }}</b>
      </div>
    </section>

    <van-empty v-if="!groups.length" image-size="88" description="本月还没有账单" />

    <section v-for="group in groups" :key="group.date" class="bill-group">
      <header class="bill-group__head">
        <span class="bill-group__date">{{ formatDateLabel(group.date) }}</span>
        <span class="bill-group__total">
          <i v-if="group.summary.expense">支出 ¥{{ formatAmount(group.summary.expense) }}</i>
          <i v-if="group.summary.income">收入 ¥{{ formatAmount(group.summary.income) }}</i>
        </span>
      </header>
      <bill-item
        v-for="item in group.items"
        :key="item.id"
        :bill="item"
        @select="goDetail(item)"
        @delete="onDelete(item)"
      />
    </section>
  </div>
</template>

<style scoped lang="scss">
.bills {
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

  &__value--expense {
    color: var(--fa-expense-color) !important;
  }

  &__value--income {
    color: var(--fa-income-color) !important;
  }
}

.bill-group {
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
    font-style: normal;

    i {
      font-style: normal;
    }
  }

  :deep(.bill-item) {
    border-top: 1px solid #f5f6f8;
  }
}
</style>
