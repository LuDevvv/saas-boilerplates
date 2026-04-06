import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Tabs = ({ defaultValue, onValueChange, className, children }: { defaultValue?: string; onValueChange?: (value: string) => void; className?: string; children: React.ReactNode }) => {
  const [value, setValue] = React.useState(defaultValue)
  
  const handleValueChange = (v: string) => {
    setValue(v)
    onValueChange?.(v)
  }
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ className, children }: any) => (
  <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ value, className, children }: any) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value
  
  return (
    <button
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, className, children }: any) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === value
  
  if (!isActive) return null
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in zoom-in-95 duration-300", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
