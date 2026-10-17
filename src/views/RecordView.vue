<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import 'vant/es/dialog/style'
import 'vant/es/toast/style'
import type { BillPayload, BillType } from '@/types/bill'
import { getCategories } from '@/constants/categories'
import { useBillStore } from '@/stores/bill'
import { formatDate, formatDateLabel, toDate } from '@/utils/date'
import { parseAmount } from '@/utils/money'

const route = useRoute()
const router = useRouter()
const { addBill, updateBill, removeBill, getBill } = useBillStore()

/** 编辑模式：路由 /record/:id */
const editId = typeof route.params.id === 'string' ? route.params.id : ''
const editingBill = editId ? getBill(editId) : undefined

const type = ref<BillType>(editingBill?.type ?? (route.query.type === 'income' ? 'income' : 'expense'))
/** 金额输入值，交由数字键盘维护 */
const amount = ref(editingBill ? String(editingBill.amount) : '')
const categoryId = ref(editingBill?.categoryId ?? '')
const date = ref(editingBill?.date ?? formatDate(new Date()))
const note = ref(editingBill?.note ?? '')

const showKeyboard = ref(false)
const showCalendar = ref(false)

const categories = computed(() => getCategories(type.value))
const amountText = computed(() => amount.value || '0.00')
const dateLabel = computed(() => formatDateLabel(date.value))
const selectedDate = computed(() => toDate(date.value))

const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

/** 切换收支类型，若分类不属于新类型则清空选择 */
function switchType(value: BillType) {
  if (type.value === value) return
  type.value = value
  const stillValid = getCategories(value).some((item) => item.id === categoryId.value)
  if (!stillValid) categoryId.value = ''
}

function onDateConfirm(value: Date | Date[]) {
  const target = Array.isArray(value) ? value[0] : value
  if (!target) return
  date.value = formatDate(target)
  showCalendar.value = false
}

function onSubmit() {
  const value = parseAmount(amount.value)
  if (value <= 0) {
    showToast('请输入金额')
    return
  }
  if (!categoryId.value) {
    showToast('请选择分类')
    return
  }

  const payload: BillPayload = {
    type: type.value,
    amount: value,
    categoryId: categoryId.value,
    note: note.value.trim(),
    date: date.value,
  }

  if (editingBill) {
    updateBill(editingBill.id, payload)
    showToast('已保存')
  } else {
    addBill(payload)
    showToast('记账成功')
  }

  goBack()
}

async function onDelete() {
  if (!editingBill) return

  try {
    await showConfirmDialog({ title: '删除账单', message: '确定要删除这条账单吗？' })
  } catch {
    return
  }

  removeBill(editingBill.id)
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
  <div class="record">
    <div class="type-switch">
      <button
        type="button"
        class="type-switch__item"
        :class="{ 'type-switch__item--active': type === 'expense' }"
        @click="switchType('expense')"
      >
        支出
      </button>
      <button
        type="button"
        class="type-switch__item"
        :class="{ 'type-switch__item--active': type === 'income' }"
        @click="switchType('income')"
      >
        收入
      </button>
    </div>

    <div class="amount" @click="showKeyboard = true">
      <span class="amount__symbol">¥</span>
      <span class="amount__value" :class="{ 'amount__value--empty': !amount }">{{ amountText }}</span>
    </div>

    <section class="panel">
      <p class="panel__title">选择分类</p>
      <div class="category-grid">
        <button
          v-for="item in categories"
          :key="item.id"
          type="button"
          class="category"
          @click="categoryId = item.id"
        >
          <span
            class="category__icon"
            :style="
              categoryId === item.id
                ? { backgroundColor: item.color, color: '#fff' }
                : { backgroundColor: `${item.color}1a`, color: item.color }
            "
          >
            <van-icon :name="item.icon" />
          </span>
          <span class="category__name">{{ item.name }}</span>
        </button>
      </div>
    </section>

    <van-cell-group inset class="record__cells">
      <van-cell title="日期" :value="dateLabel" is-link @click="showCalendar = true" />
      <van-field v-model="note" label="备注" placeholder="选填，最多 30 个字" maxlength="30" />
    </van-cell-group>

    <div class="record__footer">
      <van-button v-if="editingBill" class="record__delete" round @click="onDelete">删除</van-button>
      <van-button class="record__save" type="primary" round @click="onSubmit">保存</van-button>
    </div>

    <van-number-keyboard
      v-model="amount"
      :show="showKeyboard"
      theme="custom"
      extra-key="."
      :maxlength="9"
      :decimal-length="2"
      close-button-text="完成"
      safe-area-inset-bottom
      @blur="showKeyboard = false"
    />
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
.record {
  padding-bottom: 96px;
}

.type-switch {
  display: flex;
  gap: 8px;
  margin: 12px 16px 0;
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

.amount {
  display: flex;
  align-items: baseline;
  margin: 24px 16px 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecf2;

  &__symbol {
    margin-right: 8px;
    font-size: 20px;
    color: var(--fa-text-color);
  }

  &__value {
    font-size: 34px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0.5px;

    &--empty {
      color: #c8c9cc;
    }
  }
}

.panel {
  margin: 16px 16px 0;
  padding: 14px 12px 4px;
  border-radius: 12px;
  background-color: #fff;

  &__title {
    margin-bottom: 12px;
    padding-left: 4px;
    font-size: 14px;
    font-weight: 600;
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px 0;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 12px;
  border: none;
  background-color: transparent;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 22px;
    transition: all 0.2s;
  }

  &__name {
    font-size: 12px;
    color: var(--fa-text-color);
  }
}

.record__cells {
  margin-top: 16px;
}

.record__footer {
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

.record__delete {
  flex: none;
  width: 96px;
}

.record__save {
  flex: 1;
}
</style>
