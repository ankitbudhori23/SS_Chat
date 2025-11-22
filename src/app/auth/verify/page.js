'use client'

import { Suspense } from "react"
import BarLoading from "@/components/bar-loader"
import VerifyPageClient from "./verifyPageClient.js"

export default function VerifyPage() {
    return (
        <Suspense fallback={<BarLoading />}>
            <VerifyPageClient />
        </Suspense>
    )
}
