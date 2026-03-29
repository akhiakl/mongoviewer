import { ArrowLeft, Database } from "lucide-react"

import { Button } from "@/renderer/components/ui/button"

type ViewerNavigationProps = {
    activeConnectionName: string | null
    onBack: () => void
}

export function ViewerNavigation({ activeConnectionName, onBack }: ViewerNavigationProps) {
    return (
        <div className="flex items-center justify-between gap-3 bg-sidebar border-b border-border px-4 py-2.5">
            <div className="min-w-0 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Database className="size-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Navigation</p>
                    <p className="truncate text-sm font-medium text-foreground">
                        {activeConnectionName ?? "Connected session"}
                    </p>
                </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={onBack}>
                <ArrowLeft className="size-4" />
                Back To Connections
            </Button>
        </div>
    )
}
