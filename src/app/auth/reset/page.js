'use client'

import { Suspense } from "react"
import BarLoading from "@/components/bar-loader"
import ResetPageClient from "./resetPageClient"

export default function VerifyPage() {
    return (
        <Suspense fallback={<BarLoading />}>
            <ResetPageClient />
        </Suspense>
    )
}
