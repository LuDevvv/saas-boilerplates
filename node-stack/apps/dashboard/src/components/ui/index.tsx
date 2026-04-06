import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <div className="peer h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
        <div className="absolute left-[2px] h-5 w-5 rounded-full bg-background ring-0 transition-transform peer-checked:translate-x-full" />
      </div>
    );
  }
);
Switch.displayName = "Switch";

// Basic Tabs implementation
const Tabs = ({ defaultValue, onValueChange, className, children }: { defaultValue?: string; onValueChange?: (value: string) => void; className?: string; children: React.ReactNode }) => {
  const [value, setValue] = React.useState(defaultValue)
  
  const handleValueChange = (v: string) => {
    setValue(v)
    onValueChange?.(v)
  }
  
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { value, defaultValue, onValueChange: handleValueChange })
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ className, children, ...props }: any) => (
  <div className={cn("inline-flex items-center justify-center rounded-lg bg-muted p-1", className)} {...props}>
    {React.Children.map(children, child => {
       if (React.isValidElement(child)) {
        return React.cloneElement(child as any, { ...props })
      }
      return child
    })}
  </div>
)

const TabsTrigger = ({ value, className, children, ...props }: any) => {
  const isActive = props.value === value
  return (
    <button
      onClick={() => props.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, className, children, ...props }: any) => {
  const isActive = props.value === value
  if (!isActive) return null
  return <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</div>
}

export { Progress, Switch, Tabs, TabsList, TabsTrigger, TabsContent }
