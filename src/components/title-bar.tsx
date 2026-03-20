import { Database } from 'lucide-react'
import Menu from './menu'

// WebkitAppRegion is not in React.CSSProperties — extend it locally
type AppRegionStyle = React.CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' }

type TitleBarProps = {
    platform: string
    subtitle?: string | null
}

/**
 * Custom title bar that replaces the OS chrome.
 *
 * The full bar is marked `-webkit-app-region: drag` so the window can be
 * dragged from anywhere within it. On macOS we leave ~72 px on the left for
 * the traffic-light controls. On Windows/Linux the native window controls are
 * rendered by Electron's `titleBarOverlay` above the right edge and do not
 * need extra space in our HTML.
 */
export function TitleBar({ platform, subtitle }: TitleBarProps) {
    const isMac = platform === 'darwin'

    const dragStyle: AppRegionStyle = { WebkitAppRegion: 'drag' }
    const noDragStyle: AppRegionStyle = { WebkitAppRegion: 'no-drag' }

    return (
        <div className="flex w-full flex-col">
            <div
                className={`flex h-10 shrink-0 items-center border-b border-border bg-background ${isMac ? 'pl-19 pr-4' : 'pl-4 pr-36'}`}
                style={dragStyle}
            >
                <div className="flex items-center gap-2 text-sm" style={noDragStyle}>
                    <Database className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="select-none font-semibold tracking-tight text-foreground">
                        Mongo Viewer
                    </span>
                    <Menu />
                </div>
            </div>
            {
                subtitle && (
                    <div className="flex h-6 shrink-0 items-center border-b border-border bg-background px-4 text-sm text-muted-foreground" style={noDragStyle}>
                        <span className="text-muted-foreground/70" aria-hidden>·</span>
                        <span className="max-w-50 truncate text-muted-foreground">{subtitle}</span>
                    </div>
                )
            }
        </div>
    )
}
