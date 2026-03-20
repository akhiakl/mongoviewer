import { ChevronRight, Database, FolderClosed, Loader2, RefreshCcw } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DatabaseTreeItem, Selection } from "@/components/mongo-viewer/types"
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

type DatabasesSidebarProps = {
    tree: DatabaseTreeItem[]
    loadingTree: boolean
    treeError: string | null
    selection: Selection | null
    onRefresh: () => void
    onSelectCollection: (selection: Selection) => void
}

export function DatabasesSidebar({
    tree,
    loadingTree,
    treeError,
    selection,
    onRefresh,
    onSelectCollection,
}: DatabasesSidebarProps) {
    return (
        <Sidebar collapsible="none" className="w-64 shrink-0 min-h-full">
            <SidebarHeader className="flex flex-row justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Databases</h2>
                <Button variant="outline" size="icon-xs" onClick={onRefresh}>
                    <RefreshCcw className="size-3.5" />
                </Button>
            </SidebarHeader>
            <SidebarContent>
                {treeError ? (
                    <Alert variant="destructive" className="mb-2">
                        <AlertDescription>{treeError}</AlertDescription>
                    </Alert>
                ) : null}

                {loadingTree ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading databases...
                    </div>
                ) : null}

                {!loadingTree && tree.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No databases found.</p>
                ) : null}
                <SidebarGroup>
                    <SidebarMenu>
                        {tree.map((dbItem) => (
                            <Collapsible
                                key={dbItem.name}
                                asChild
                                className="group/collapsible"
                                defaultOpen
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={dbItem.name}>
                                            <Database className="size-4 text-sky-600" />
                                            <span>{dbItem.name}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        {dbItem.collections.length === 0 ? (
                                            <p className="px-2 py-1.5 text-xs text-muted-foreground">No collections</p>
                                        ) : (<SidebarMenuSub>
                                            {dbItem.collections.map((collectionName) => {
                                                const isActive =
                                                    selection?.db === dbItem.name && selection?.collection === collectionName
                                                return (
                                                    <SidebarMenuSubItem key={collectionName}>
                                                        <SidebarMenuSubButton
                                                            key={collectionName}
                                                            type="button"
                                                            onClick={() => onSelectCollection({ db: dbItem.name, collection: collectionName })}
                                                            className={cn(
                                                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
                                                                isActive
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "text-foreground hover:bg-muted",
                                                            )}
                                                        >
                                                            <FolderClosed className="size-3.5" />
                                                            <span className="truncate">{collectionName}</span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                )
                                            })}
                                        </SidebarMenuSub>)}
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar >
    )
}
