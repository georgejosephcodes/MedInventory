import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Theme selectors
const THEMES = {
  light: "",
  dark: ".dark",
}

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-chart={chartId}
          className={cn(
            "flex aspect-video justify-center text-xs transition-colors",

            /* Axes + grid */
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line]:stroke-border/30",

            /* Tooltip cursor */
            "[&_.recharts-tooltip-cursor]:fill-sky-400/10",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-sky-400/10",

            /* REMOVE ALL OUTLINES / BORDERS */
            "[&_.recharts-dot]:stroke-transparent",
            "[&_.recharts-sector]:stroke-transparent",
            "[&_.recharts-pie-sector]:stroke-transparent",
            "[&_.recharts-active-shape]:stroke-transparent",
            "[&_.recharts-layer]:outline-none",
            "[&_.recharts-surface]:outline-none",

            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, cfg]) => cfg.theme || cfg.color
  )
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, cfg]) => {
    const color = cfg.theme?.[theme] || cfg.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      label,
      labelKey,
      nameKey,
    },
    ref
  ) => {
    const { config } = useChart()
    if (!active || !payload?.length) return null

    const [first] = payload
    const key = labelKey || first.dataKey || first.name
    const itemConfig = config[key]

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-1.5 rounded-lg border border-border bg-background/95",
          "px-3 py-2 text-xs shadow-sm backdrop-blur",
          className
        )}
      >
        {!hideLabel && (
          <div className="font-medium text-foreground">
            {itemConfig?.label || label}
          </div>
        )}

        {payload.map((item, i) => {
          const resolvedKey = nameKey || item.name || item.dataKey
          const cfg = config[resolvedKey]
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {cfg?.label || item.name}
              </span>
              <span className="ml-auto font-mono tabular-nums text-foreground">
                {item.value?.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef(
  ({ className, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart()
    if (!payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center justify-center gap-4 text-xs",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = nameKey || item.dataKey
          const cfg = config[key]

          return (
            <div key={item.value} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {cfg?.label || item.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
