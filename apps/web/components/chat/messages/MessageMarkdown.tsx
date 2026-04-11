"use client";

import { cn } from "@repo/ui/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const MarkdownResponse = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        `
        size-full
        wrap-anywhere
        [word-break:break-word]

        /* BASE TYPOGRAPHY */
        text-[15px]
        leading-7
        text-gray-700
        dark:text-gray-300

        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0

        /* ---------------- HEADINGS ---------------- */

        [&_h1]:text-2xl
        [&_h1]:font-semibold
        [&_h1]:tracking-tight
        [&_h1]:text-gray-900
        dark:[&_h1]:text-gray-100
        [&_h1]:mt-10
        [&_h1]:mb-5
        [&_h1]:pb-2
        [&_h1]:border-b
        [&_h1]:border-gray-200
        dark:[&_h1]:border-zinc-800

        [&_h2]:text-xl
        [&_h2]:font-semibold
        [&_h2]:tracking-tight
        [&_h2]:text-gray-900
        dark:[&_h2]:text-gray-100
        [&_h2]:mt-8
        [&_h2]:mb-4

        [&_h3]:text-lg
        [&_h3]:font-medium
        [&_h3]:text-gray-900
        dark:[&_h3]:text-gray-200
        [&_h3]:mt-6
        [&_h3]:mb-3

        [&_h4]:text-base
        [&_h4]:font-medium
        [&_h4]:mt-5
        [&_h4]:mb-2

        /* ---------------- TEXT ---------------- */

        [&_p]:mb-4
        [&_p]:leading-7

        [&_strong]:font-semibold
        [&_strong]:text-gray-900
        dark:[&_strong]:text-gray-100

        [&_em]:italic

        /* ---------------- LISTS ---------------- */

        [&_ul]:list-disc
        [&_ul]:pl-6
        [&_ul]:mb-5
        [&_ul]:space-y-1.5
        [&_ul]:marker:text-emerald-500

        [&_ol]:list-decimal
        [&_ol]:pl-6
        [&_ol]:mb-5
        [&_ol]:space-y-1.5
        [&_ol]:marker:text-emerald-500

        [&_li]:leading-7

        /* ---------------- BLOCKQUOTE ---------------- */

        [&_blockquote]:relative
        [&_blockquote]:my-6
        [&_blockquote]:pl-5
        [&_blockquote]:py-3
        [&_blockquote]:border-l-2
        [&_blockquote]:border-emerald-500/60
        [&_blockquote]:bg-emerald-50/40
        dark:[&_blockquote]:bg-emerald-500/10
        [&_blockquote]:rounded-md
        [&_blockquote]:text-gray-700
        dark:[&_blockquote]:text-gray-300

        /* ---------------- LINKS ---------------- */

        [&_a]:text-emerald-600
        dark:[&_a]:text-emerald-400
        [&_a]:font-medium
        [&_a]:underline-offset-2
        [&_a:hover]:underline

        /* ---------------- INLINE CODE ---------------- */

        [&_code:not(pre_code)]:px-1.5
        [&_code:not(pre_code)]:py-0.5
        [&_code:not(pre_code)]:rounded
        [&_code:not(pre_code)]:text-[13px]
        [&_code:not(pre_code)]:font-mono
        [&_code:not(pre_code)]:bg-gray-100
        dark:[&_code:not(pre_code)]:bg-zinc-800
        [&_code:not(pre_code)]:text-emerald-600
        dark:[&_code:not(pre_code)]:text-emerald-400

        /* ---------------- CODE BLOCK ---------------- */

        [&_pre]:my-6
        [&_pre]:p-4
        [&_pre]:rounded-lg
        [&_pre]:border
        [&_pre]:border-gray-200
        dark:[&_pre]:border-zinc-700
        [&_pre]:bg-gray-50
        dark:[&_pre]:bg-zinc-900
        [&_pre]:overflow-x-auto

        [&_pre_code]:bg-transparent
        [&_pre_code]:p-0
        [&_pre_code]:text-[13px]
        [&_pre_code]:leading-6
        [&_pre_code]:font-mono

        /* ---------------- TABLE SYSTEM ---------------- */

        /* Container */
        [&_table]:w-full
        [&_table]:text-sm
        [&_table]:border
        [&_table]:border-gray-200
        dark:[&_table]:border-zinc-800
        [&_table]:rounded-lg

        /* CRITICAL: prevent layout break */
        [&_table]:table-fixed

        /* Scroll container */
        [&_table]:block
        [&_table]:overflow-auto
        [&_table]:max-h-120

        /* Background layering */
        [&_table]:bg-zinc-900

        /* ---------------- HEADER ---------------- */

        [&_thead]:bg-gray-50
        dark:[&_thead]:bg-zinc-800

        [&_th]:px-4
        [&_th]:py-2.5
        [&_th]:text-left
        [&_th]:font-semibold
        [&_th]:text-gray-900
        dark:[&_th]:text-gray-100
        [&_th]:border-b
        [&_th]:border-gray-200
        dark:[&_th]:border-zinc-700

        /* Prevent header wrapping weirdness */
        [&_th]:whitespace-nowrap
        [&_th]:overflow-hidden
        [&_th]:text-ellipsis

        /* Sticky header (huge UX win) */
        [&_thead]:sticky
        [&_thead]:top-0
        [&_thead]:z-10

        /* ---------------- BODY ---------------- */

        /* Row separation */
        [&_tbody_tr]:border-b
        [&_tbody_tr]:border-gray-100
        dark:[&_tbody_tr]:border-zinc-800

        /* Zebra striping */
        [&_tbody_tr:nth-child(even)]:bg-gray-50/60
        dark:[&_tbody_tr:nth-child(even)]:bg-zinc-800/40

        /* Hover (subtle, not flashy) */
        [&_tbody_tr:hover]:bg-gray-100/60
        dark:[&_tbody_tr:hover]:bg-zinc-800/70

        /* ---------------- CELLS ---------------- */

        [&_td]:px-4
        [&_td]:py-2.5
        [&_td]:align-top

        [&_td]:text-gray-700
        dark:[&_td]:text-gray-300

        /* ✅ TEXT WRAPPING (CRITICAL FIX) */

        /* allow wrapping but prevent ugly breaks */
        [&_td]:whitespace-normal
        [&_td]:wrap-break-word
        [&_td]:overflow-hidden

        /* control width for readability */
        [&_td]:max-w-70

        /* better readability */
        [&_td]:leading-6

        /* first column emphasis */
        [&_td:first-child]:font-medium
        [&_td:first-child]:text-gray-900
        dark:[&_td:first-child]:text-gray-100

        /* ---------------- SCROLLBAR ---------------- */

        /* Firefox */
        [&_table]:scrollbar-thin
        [&_table]:scrollbar-thumb-gray-300
        dark:[&_table]:scrollbar-thumb-zinc-700
        [&_table]:scrollbar-track-transparent

        /* Webkit */
        [&_table::-webkit-scrollbar]:h-1.5
        [&_table::-webkit-scrollbar]:w-1.5

        [&_table::-webkit-scrollbar-track]:bg-transparent

        [&_table::-webkit-scrollbar-thumb]:bg-gray-300
        dark:[&_table::-webkit-scrollbar-thumb]:bg-zinc-700
        [&_table::-webkit-scrollbar-thumb]:rounded-full

        [&_table::-webkit-scrollbar-thumb:hover]:bg-gray-400
        dark:[&_table::-webkit-scrollbar-thumb:hover]:bg-zinc-600

        /* ---------------- EDGE CASE FIXES ---------------- */

        /* Fix nested code blocks inside tables */
        [&_td_code]:break-all

        /* Prevent images from breaking layout */
        [&_td_img]:max-w-full
        [&_td_img]:h-auto
        [&_td_img]:rounded-md

        /* Links inside tables */
        [&_td_a]:wrap-break-word

        /* Lists inside tables */
        [&_td_ul]:pl-4
        [&_td_ol]:pl-4
        [&_td_li]:mb-1

        /* ---------------- HR ---------------- */

        [&_hr]:my-8
        [&_hr]:border-gray-200
        dark:[&_hr]:border-zinc-800
        `,
        className
      )}
      {...props}
    />
  ),
  (prev, next) => prev.children === next.children
);

MarkdownResponse.displayName = "MarkdownResponse";