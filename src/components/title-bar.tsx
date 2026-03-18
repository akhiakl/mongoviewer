import { Database } from 'lucide-react'

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

    return (
        <div
            className="flex h-10 shrink-0 items-center border-b border-black/[0.06] bg-[#f5f3ef]"
            style={dragStyle}
        >
            <div className={`flex items-center gap-2 text-sm ${isMac ? 'pl-[76px]' : 'pl-4'}`}>
                <Database className="size-3.5 shrink-0 text-slate-500" />
                <span className="select-none font-semibold tracking-tight text-slate-700">
                    Mongo Viewer
                </span>
                {subtitle && (
                    <>
                        <span className="text-slate-400" aria-hidden>·</span>
                        <span className="max-w-[200px] truncate text-slate-500">{subtitle}</span>
                    </>
                )}
            </div>
        </div>
    )
}
