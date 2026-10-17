<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import BillItem from '@/components/BillItem.vue'
import type { Bill } from '@/types/bill'
import { useBillStore } from '@/stores/bill'
import { formatMonthLabel, getMonthKey } from '@/utils/date'
import { formatAmount } from '@/utils/money'

const router = useRouter()
const { recentBills, monthSummary, removeBill } = useBillStore()

const month = getMonthKey()
const monthLabel = formatMonthLabel(month)
const summary = computed(() => monthSummary(month))
const list = computed(() => recentBills(10))

/** 去记账（可带收支类型） */
function goRecord(type: 'expense' | 'income') {
  router.push({ path: '/record', query: { type } })
}

/** 查看 / 编辑账单 */
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
  <div class="home">
    <section class="summary-card">
      <div class="summary-card__head">
        <span>{{ monthLabel }}</span>
        <span class="summary-card__tag">本月支出</span>
      </div>
      <p class="summary-card__amount"><i>¥</i>{{ formatAmount(summary.expense) }}</p>
      <div class="summary-card__meta">
        <div class="summary-card__meta-item">
          <span>本月收入</span>
          <b>¥{{ formatAmount(summary.income) }}</b>
        </div>
        <div class="summary-card__meta-item">
          <span>本月结余</span>
          <b>¥{{ formatAmount(summary.balance) }}</b>
        </div>
      </div>
    </section>

    <section class="actions">
      <button type="button" class="actions__item" @click="goRecord('expense')">
        <van-icon name="minus" />
        <span>记支出</span>
      </button>
      <button type="button" class="actions__item actions__item--income" @click="goRecord('income')">
        <van-icon name="plus" />
        <span>记收入</span>
      </button>
    </section>

    <section class="records">
      <header class="records__head">
        <h2>最近账单</h2>
        <a class="records__more" @click="router.push('/bills')">
          账单明细<van-icon name="arrow" />
        </a>
      </header>

      <van-empty
        v-if="!list.length"
        image-size="88"
        description="还没有账单，点击上方按钮记一笔吧"
      />
      <bill-item
        v-for="bill in list"
        :key="bill.id"
        :bill="bill"
        show-date
        @select="goDetail(bill)"
        @delete="onDelete(bill)"
      />
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding: 12px 16px 0;
}

.summary-card {
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
    opacity: 0.9;
  }

  &__tag {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    background-color: rgba(255, 255, 255, 0.2);
  }

  &__amount {
    margin: 12px 0 16px;
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

  &__meta {
    display: flex;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.24);
  }

  &__meta-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    opacity: 0.92;

    b {
      font-size: 15px;
      font-weight: 600;
    }
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
    background: linear-gradient(135deg, #ff8a6b 0%, #ff6b6b 100%);
    box-shadow: 0 6px 14px rgba(255, 107, 107, 0.24);

    &--income {
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

  :deep(.bill-item) {
    border-top: 1px solid #f5f6f8;
  }
}
</style>
