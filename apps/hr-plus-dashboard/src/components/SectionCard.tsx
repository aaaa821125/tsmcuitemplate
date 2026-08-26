import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/** 頁面區塊外殼(Attention Required / Last updated 等清單區塊共用)。 */
export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <section className={cn('rounded-lg border border-divider bg-surface', className)}>
      <div className="px-[var(--layout-space-loose)] pt-[var(--layout-space-loose)] pb-[var(--layout-space-tight)]">
        <h2 className="text-h5">{title}</h2>
        {description && <p className="text-caption text-fg-muted mt-[var(--layout-space-tight)]">{description}</p>}
      </div>
      {children}
    </section>
  )
}
