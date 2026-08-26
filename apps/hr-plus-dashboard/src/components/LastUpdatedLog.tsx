// @story-baseline: @qijenchen/design-system/patterns/element-anatomy/item-anatomy.stories.tsx#Inspector
// (ListItem consumer preset — 頁面內瀏覽 reading-mode row spacing,見該 story 的
//  CONSUMERS.ListItem 定義。本檔組裝 ItemIcon + ItemContent + ItemAvatar + ItemSuffix 成
//  standalone 頁面列表 row,spacing 全走 layout-space token。)
import { ItemAvatar, ItemContent, ItemIcon, ItemSuffix } from '@qijenchen/design-system'
import { CATEGORY_META_BY_ID, type UpdateLogEntry } from '../data/hr-metrics'

interface LastUpdatedLogProps {
  entries: UpdateLogEntry[]
}

/** 各類別資料最後上傳紀錄:類別 / 上傳時間 / 上傳人(icon + 姓名 + 工號)。 */
export function LastUpdatedLog({ entries }: LastUpdatedLogProps) {
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => {
        const category = CATEGORY_META_BY_ID[entry.category]
        return (
          <li
            key={entry.category}
            className="flex items-center gap-[var(--layout-space-tight)] py-[var(--layout-space-tight)] px-[var(--layout-space-loose)] border-b border-divider last:border-b-0"
          >
            <ItemIcon icon={category.icon} />
            <ItemContent label={category.label} description={entry.uploadedAt} />
            <ItemSuffix>
              <ItemAvatar alt={entry.uploader.name} color={entry.uploader.color} />
              <span className="text-body text-foreground">{entry.uploader.name}</span>
              <span className="text-caption text-fg-muted">#{entry.uploader.employeeId}</span>
            </ItemSuffix>
          </li>
        )
      })}
    </ul>
  )
}
