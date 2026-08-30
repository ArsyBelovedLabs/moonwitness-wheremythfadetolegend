import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet as SheetPrimitive, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

function Sheet({ open, onClose, title, children }) {
  return (
    <SheetPrimitive open={open} onOpenChange={(next) => { if (!next) onClose?.() }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Observation detail and evidence context.</SheetDescription>
        </SheetHeader>
        <div className="p-6">{children}</div>
      </SheetContent>
    </SheetPrimitive>
  )
}

function EmptyState({ className, children, ...props }) {
  return <div className={cn("flex min-h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground", className)} {...props}>{children}</div>
}

export { Button, Badge, Card, CardHeader, CardFooter, CardTitle, CardDescription, CardAction, CardContent, Progress, Sheet, EmptyState }
