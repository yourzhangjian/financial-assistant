const PREFIX = 'fa:'

/** 读取 localStorage 中的 JSON 数据，不存在或解析失败时返回默认值 */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** 将数据以 JSON 形式写入 localStorage */
export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 忽略隐私模式 / 存储空间不足等场景下的写入失败
  }
}

/** 删除 localStorage 中的数据 */
export function removeJSON(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
