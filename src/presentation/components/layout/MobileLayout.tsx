import { BottomNav } from './BottomNav'
import { SimpleTopBar } from './SimpleTopBar'

interface MobileLayoutProps {
  children: React.ReactNode
  hideBottomNav?: boolean
  hideTopBar?: boolean
  className?: string
}

export function MobileLayout({ children, hideBottomNav = false, hideTopBar = false, className }: MobileLayoutProps) {
  return (
    <div className={`min-h-screen bg-white${className ? ` ${className}` : ''}`}>
      {!hideTopBar && <SimpleTopBar />}
      <main className={hideBottomNav ? '' : 'pb-20'}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  )
}
