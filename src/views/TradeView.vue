<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import type { TradePayload, TradeType } from '@/types/gold'
import { useTradeStore } from '@/stores/trade'
import { useQuoteStore } from '@/stores/quote'
import { formatDate, formatDateLabel, toDate } from '@/utils/date'
import { parseAmount, roundTo, toFixed2, toInputString, toNumber } from '@/utils/money'

const route = useRoute()
const router = useRouter()
const { addTrade, updateTrade, removeTrade, getTrade } = useTradeStore()
const quote = useQuoteStore()

/** 编辑模式：路由 /trade/:id */
const editId = typeof route.params.id === 'string' ? route.params.id : ''
const editingTrade = editId ? getTrade(editId) : undefined

const type = ref<TradeType>(editingTrade?.type ?? (route.query.type === 'sell' ? 'sell' : 'buy'))
/** 实际支付 / 实际收到（元） */
const amount = ref(editingTrade ? toFixed2(editingTrade.amount) : '')
/** 确认净值（元/克），新增时默认带入最新净值 */
const netValue = ref(
  editingTrade
    ? toInputString(editingTrade.netValue, 4)
    : quote.netValue.value > 0
      ? toInputString(quote.netValue.value, 4)
      : '',
)
/** 确认份额（克） */
const shares = ref(editingTrade ? toInputString(editingTrade.shares, 4) : '')
/** 手续费（元） */
const fee = ref(editingTrade ? toFixed2(editingTrade.fee) : '')
const date = ref(editingTrade?.date ?? formatDate(new Date()))
const note = ref(editingTrade?.note ?? '')

const showCalendar = ref(false)
/** 最后一次编辑的字段，联动计算时以它为准 */
const lastEdited = ref<'amount' | 'netValue' | 'shares'>('amount')

const amountLabel = computed(() => (type.value === 'buy' ? '实际支付' : '实际收到'))
const dateLabel = computed(() => formatDateLabel(date.value))
const selectedDate = computed(() => toDate(date.value))
const formulaTip = computed(() =>
  type.value === 'buy'
    ? '实际支付 = 确认净值 × 确认份额 + 手续费'
    : '实际收到 = 确认净值 × 确认份额 - 手续费',
)

const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

/** 买入时手续费计入成本，卖出时从到账金额中扣除 */
function signedFee(): number {
  const value = parseAmount(fee.value)
  return type.value === 'buy' ? value : -value
}

/**
 * 金额、净值、份额三者联动：
 * 修改任意一项后，按最后一次修改的字段推算另一项
 * - 修改金额 / 净值：重算确认份额
 * - 修改确认份额：重算实际支付 / 实际收到
 */
function autoCalc(changed: 'amount' | 'netValue' | 'shares' | 'fee') {
  if (changed !== 'fee') lastEdited.value = changed

  const price = toNumber(netValue.value)

  if (lastEdited.value === 'shares') {
    const shareValue = toNumber(shares.value)
    if (price > 0 && shareValue > 0) {
      amount.value = toFixed2(price * shareValue + signedFee())
    }
    return
  }

  const amountValue = parseAmount(amount.value)
  if (price > 0 && amountValue > 0) {
    shares.value = toInputString((amountValue - signedFee()) / price, 4)
  }
}

function onInput(field: 'amount' | 'netValue' | 'shares' | 'fee', value: string) {
  if (field === 'amount') amount.value = value
  else if (field === 'netValue') netValue.value = value
  else if (field === 'shares') shares.value = value
  else fee.value = value

  autoCalc(field)
}

function switchType(value: TradeType) {
  if (type.value === value) return
  type.value = value
  autoCalc('fee')
}

function onDateConfirm(value: Date | Date[]) {
  const target = Array.isArray(value) ? value[0] : value
  if (!target) return
  date.value = formatDate(target)
  showCalendar.value = false
}

function onSubmit() {
  const amountValue = parseAmount(amount.value)
  const netValueValue = toNumber(netValue.value)
  const sharesValue = toNumber(shares.value)

  if (amountValue <= 0) {
    showToast(`请输入${amountLabel.value}`)
    return
  }
  if (netValueValue <= 0) {
    showToast('请输入确认净值')
    return
  }
  if (sharesValue <= 0) {
    showToast('请输入确认份额')
    return
  }

  const payload: TradePayload = {
    type: type.value,
    amount: amountValue,
    netValue: roundTo(netValueValue, 4),
    shares: roundTo(sharesValue, 4),
    fee: parseAmount(fee.value),
    date: date.value,
    note: note.value.trim(),
  }

  if (editingTrade) {
    updateTrade(editingTrade.id, payload)
    showToast('已保存')
  } else {
    addTrade(payload)
    showToast('记账成功')
  }

  // 没有净值记录时，用本次确认净值兜底
  quote.ensureNetValue(payload.netValue, payload.date)
  goBack()
}

async function onDelete() {
  if (!editingTrade) return

  try {
    await showConfirmDialog({ title: '删除交易', message: '确定要删除这条交易记录吗？' })
  } catch {
    return
  }

  removeTrade(editingTrade.id)
  showToast('已删除')
  router.replace('/')
}

/** 有历史记录时返回上一页，否则回到首页 */
function goBack() {
  if (window.history.state?.back) router.back()
  else router.replace('/')
}
</script>

<template>
  <div class="trade">
    <page-header :title="editingTrade ? '编辑交易' : '记一笔'" />

    <div class="trade__body">
      <div class="type-switch">
      <button
        type="button"
        class="type-switch__item"
        :class="{ 'type-switch__item--active': type === 'buy' }"
        @click="switchType('buy')"
      >
        买入
      </button>
      <button
        type="button"
        class="type-switch__item"
        :class="{ 'type-switch__item--active': type === 'sell' }"
        @click="switchType('sell')"
      >
        卖出
      </button>
    </div>

    <van-cell-group inset class="trade__cells">
      <van-field
        :model-value="amount"
        :label="amountLabel"
        :placeholder="`请输入${amountLabel}`"
        inputmode="decimal"
        clearable
        @update:model-value="onInput('amount', $event)"
      >
        <template #right-icon><span class="trade__unit">元</span></template>
      </van-field>

      <van-field
        :model-value="netValue"
        label="确认净值"
        placeholder="请输入确认净值"
        inputmode="decimal"
        clearable
        @update:model-value="onInput('netValue', $event)"
      >
        <template #right-icon><span class="trade__unit">元/克</span></template>
      </van-field>

      <van-field
        :model-value="shares"
        label="确认份额"
        placeholder="请输入确认份额"
        inputmode="decimal"
        clearable
        @update:model-value="onInput('shares', $event)"
      >
        <template #right-icon><span class="trade__unit">克</span></template>
      </van-field>

      <van-field
        :model-value="fee"
        label="手续费"
        placeholder="选填，默认 0"
        inputmode="decimal"
        clearable
        @update:model-value="onInput('fee', $event)"
      >
        <template #right-icon><span class="trade__unit">元</span></template>
      </van-field>

      <van-cell title="日期" :value="dateLabel" is-link @click="showCalendar = true" />
      <van-field v-model="note" label="备注" placeholder="选填，最多 30 个字" maxlength="30" />
    </van-cell-group>

    <p class="trade__tip">
      <van-icon name="info-o" />
      {{ formulaTip }}
    </p>
    </div>

    <div class="trade__footer">
      <van-button v-if="editingTrade" class="trade__delete" round @click="onDelete">删除</van-button>
      <van-button class="trade__save" type="primary" round @click="onSubmit">保存</van-button>
    </div>

    <van-calendar
      v-model:show="showCalendar"
      :default-date="selectedDate"
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="onDateConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
.trade {
  padding-bottom: 96px;
}

.trade__body {
  padding: 12px 16px 0;
}

.type-switch {
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 10px;
  background-color: #eceff5;

  &__item {
    flex: 1;
    height: 34px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    color: var(--fa-text-color-secondary);
    background-color: transparent;
    transition: all 0.2s;

    &--active {
      color: #fff;
      font-weight: 500;
      background: linear-gradient(135deg, #5b8cff 0%, #7a5cff 100%);
      box-shadow: 0 4px 10px rgba(91, 140, 255, 0.28);
    }
  }
}

.trade__cells {
  margin-top: 12px;
}

.trade__unit {
  font-size: 13px;
  color: var(--fa-text-color-secondary);
}

.trade__tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--fa-text-color-secondary);
}

.trade__footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
}

.trade__delete {
  flex: none;
  width: 96px;
}

.trade__save {
  flex: 1;
}
</style>
