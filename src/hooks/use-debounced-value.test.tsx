import { renderHook } from "@testing-library/react"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDebouncedValue } from "@/hooks/use-debounced-value"

describe("useDebouncedValue", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("keeps the previous value until the delay elapses", () => {
        const { result, rerender } = renderHook(
            ({ value, delayMs }) => useDebouncedValue(value, delayMs),
            { initialProps: { value: "alpha", delayMs: 200 } },
        )

        expect(result.current).toBe("alpha")

        rerender({ value: "beta", delayMs: 200 })
        expect(result.current).toBe("alpha")

        act(() => {
            vi.advanceTimersByTime(199)
        })
        expect(result.current).toBe("alpha")

        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe("beta")
    })

    it("cancels the previous timer when the value changes again", () => {
        const { result, rerender } = renderHook(
            ({ value, delayMs }) => useDebouncedValue(value, delayMs),
            { initialProps: { value: "alpha", delayMs: 200 } },
        )

        rerender({ value: "beta", delayMs: 200 })

        act(() => {
            vi.advanceTimersByTime(100)
        })

        rerender({ value: "gamma", delayMs: 200 })

        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(result.current).toBe("alpha")

        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(result.current).toBe("gamma")
    })
})
