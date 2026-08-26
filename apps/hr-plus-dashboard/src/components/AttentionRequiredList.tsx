// @story-baseline: @qijenchen/design-system/patterns/element-anatomy/item-anatomy.stories.tsx#Inspector
// (ListItem consumer preset — 頁面內瀏覽 reading-mode row spacing,見該 story 的
//  CONSUMERS.ListItem 定義。本檔組裝 ItemIcon + ItemContent 成 standalone 頁面列表 row,
//  spacing 全走 layout-space token,不沿用 preset 文件裡的固定 px 數值。)
import { TriangleAlert } from 'lucide-react'
import { ItemContent, ItemIcon } from '@qijenchen/design-system'
import { CATEGORY_META_BY_ID, type AttentionItem } from '../data/hr-metrics'

interface AttentionRequiredListProps {
  items: AttentionItem[]
}

/**
 * Attention Required — 條列需要主管留意的落後指標(通常是績效不佳的數據)。
 */
export function AttentionRequiredList({ items }: AttentionRequiredListProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const category = CATEGORY_META_BY_ID[item.category]
        return (
          <li
            key={item.id}
            className="flex items-start gap-[var(--layout-space-tight)] py-[var(--layout-space-tight)] px-[var(--layout-space-loose)] border-b border-divider last:border-b-0"
          >
            <ItemIcon icon={TriangleAlert} className="text-warning-text" />
            <ItemContent label={category.label} description={item.message} descriptionTone="secondary" />
          </li>
        )
      })}
    </ul>
  )
}
