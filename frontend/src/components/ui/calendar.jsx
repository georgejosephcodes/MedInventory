"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-xl border border-border bg-background p-3 shadow-sm",
        className
      )}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-4",

        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-foreground",

        nav: "flex items-center gap-1",
        nav_button:
          "h-7 w-7 rounded-md bg-transparent text-muted-foreground transition-colors " +
          "hover:bg-sky-200 hover:text-sky-900 dark:hover:bg-sky-400/20",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "w-9 text-center text-xs font-medium text-muted-foreground",

        row: "flex w-full mt-2",

        cell:
          "relative h-9 w-9 p-0 text-center text-sm focus-within:z-20",

        /* 🔑 Day text */
        day:
          "h-9 w-9 rounded-md font-normal text-foreground transition-colors " +
          "hover:bg-sky-200 hover:text-sky-900 " +
          "dark:hover:bg-sky-400/20 dark:hover:text-sky-200 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        /* ✅ LIGHT BLUE SELECTED */
        day_selected:
          "bg-sky-300 text-sky-900 hover:bg-sky-300 " +
          "dark:bg-sky-400/30 dark:text-sky-200",

        /* Today highlight */
        day_today:
          "bg-sky-100 text-sky-900 font-semibold dark:bg-sky-400/20 dark:text-sky-200",

        day_outside:
          "text-muted-foreground opacity-40",

        day_disabled:
          "text-muted-foreground opacity-30",

        day_hidden: "invisible",

        ...classNames,
      }}
      {...props}
    />
  )
}
