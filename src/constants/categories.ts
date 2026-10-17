import type { BillType, Category } from '@/types/bill'

/** 支出分类 */
export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', type: 'expense', icon: 'birthday-cake-o', color: '#ff9f43' },
  { id: 'traffic', name: '交通', type: 'expense', icon: 'logistics', color: '#54a0ff' },
  { id: 'shopping', name: '购物', type: 'expense', icon: 'shopping-cart-o', color: '#ee5a6f' },
  { id: 'housing', name: '居住', type: 'expense', icon: 'home-o', color: '#5f27cd' },
  { id: 'entertainment', name: '娱乐', type: 'expense', icon: 'music-o', color: '#10ac84' },
  { id: 'medical', name: '医疗', type: 'expense', icon: 'like-o', color: '#ff6b6b' },
  { id: 'education', name: '教育', type: 'expense', icon: 'font-o', color: '#48dbfb' },
  { id: 'communication', name: '通讯', type: 'expense', icon: 'phone-o', color: '#a29bfe' },
  { id: 'social', name: '人情', type: 'expense', icon: 'gift-o', color: '#ff9ff3' },
  { id: 'other', name: '其他', type: 'expense', icon: 'ellipsis', color: '#8395a7' },
]

/** 收入分类 */
export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '工资', type: 'income', icon: 'gold-coin-o', color: '#ff9f43' },
  { id: 'bonus', name: '奖金', type: 'income', icon: 'medal-o', color: '#ee5a6f' },
  { id: 'parttime', name: '兼职', type: 'income', icon: 'service-o', color: '#10ac84' },
  { id: 'investment', name: '理财', type: 'income', icon: 'chart-trending-o', color: '#54a0ff' },
  { id: 'redpacket', name: '红包', type: 'income', icon: 'coupon-o', color: '#ff6b6b' },
  { id: 'other', name: '其他', type: 'income', icon: 'ellipsis', color: '#8395a7' },
]

/** 按账单类型获取分类列表 */
export function getCategories(type: BillType): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

/** 按类型 + 分类 id 获取分类 */
export function getCategory(type: BillType, id: string): Category | undefined {
  return getCategories(type).find((item) => item.id === id)
}

/** 获取分类名，找不到时返回“未分类” */
export function getCategoryName(type: BillType, id: string): string {
  return getCategory(type, id)?.name ?? '未分类'
}
