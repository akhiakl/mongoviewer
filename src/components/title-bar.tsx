import { Database } from 'lucide-react'

import Menu from './menu'

type AppRegionStyle = React.CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' }

type TitleBarProps = {
    platform: string
}

export function TitleBar({ platform }: TitleBarProps) {
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
        </div>
    )
}
