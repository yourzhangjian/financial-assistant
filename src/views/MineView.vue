<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import type { BillPayload } from '@/types/bill'
import { useBillStore } from '@/stores/bill'
import { useUserStore } from '@/stores/user'
import { formatDate, getMonthKey } from '@/utils/date'
import { formatAmount } from '@/utils/money'

const router = useRouter()
const { user, logout } = useUserStore()
const { bills, totalSummary, monthSummary, addBill, clearBills } = useBillStore()

const total = computed(() => totalSummary())
const monthTotal = computed(() => monthSummary(getMonthKey()))

/** 载入示例数据，方便快速体验 */
function loadSample() {
  const now = Date.now()
  const dayAgo = (days: number) => formatDate(new Date(now - days * 86400000))
  const samples: BillPayload[] = [
    { type: 'income', amount: 12000, categoryId: 'salary', note: '本月工资', date: dayAgo(3) },
    { type: 'expense', amount: 1800, categoryId: 'housing', note: '房租', date: dayAgo(6) },
    { type: 'expense', amount: 268, categoryId: 'shopping', note: '生活用品', date: dayAgo(1) },
    { type: 'expense', amount: 199, categoryId: 'entertainment', note: '电影 + 晚餐', date: dayAgo(4) },
    { type: 'expense', amount: 32.5, categoryId: 'food', note: '午餐', date: dayAgo(0) },
    { type: 'expense', amount: 9, categoryId: 'traffic', note: '地铁', date: dayAgo(0) },
  ]

  samples.forEach((item) => addBill(item))
  showToast('示例数据已载入')
}

async function onClear() {
  try {
    await showConfirmDialog({ title: '清空账单', message: '将删除全部账单记录，且无法恢复' })
  } catch {
    return
  }

  clearBills()
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
        <b>{{ total.count }}</b>
        <span>累计记账（笔）</span>
      </div>
      <div class="stats__item">
        <b class="stats__value--expense">¥{{ formatAmount(total.expense) }}</b>
        <span>累计支出</span>
      </div>
      <div class="stats__item">
        <b class="stats__value--income">¥{{ formatAmount(total.income) }}</b>
        <span>累计收入</span>
      </div>
    </section>

    <van-cell-group inset class="mine__cells">
      <van-cell
        title="本月账单"
        :value="`共 ${monthTotal.count} 笔`"
        is-link
        @click="router.push('/bills')"
      />
      <van-cell title="全部账单" :value="`共 ${bills.length} 笔`" is-link @click="router.push('/bills')" />
      <van-cell title="载入示例数据" is-link @click="loadSample" />
      <van-cell title="清空账单数据" is-link @click="onClear" />
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
  display: flex;
  margin-top: 12px;
  padding: 16px 0;
  border-radius: 12px;
  background-color: #fff;

  &__item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--fa-text-color-secondary);

    & + & {
      border-left: 1px solid #f2f3f5;
    }

    b {
      font-size: 16px;
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
