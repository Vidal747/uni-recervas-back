export type TimeInterval = {
    start: string
    end: string
}

const SECONDS_PER_DAY = 24 * 60 * 60

export function timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time
        .split(':')
        .map((value) => Number(value))
    return hours * 60 * 60 + minutes * 60 + (seconds ?? 0)
}

export function secondsToTime(totalSeconds: number): string {
    const clampedSeconds = Math.max(
        0,
        Math.min(SECONDS_PER_DAY - 1, Math.floor(totalSeconds))
    )
    const hours = String(Math.floor(clampedSeconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((clampedSeconds % 3600) / 60)).padStart(
        2,
        '0'
    )
    const seconds = String(clampedSeconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
}

export function intervalsOverlap(
    first: TimeInterval,
    second: TimeInterval
): boolean {
    return (
        timeToSeconds(first.start) < timeToSeconds(second.end) &&
        timeToSeconds(second.start) < timeToSeconds(first.end)
    )
}

export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
    const sortedIntervals = [...intervals].sort(
        (left, right) => timeToSeconds(left.start) - timeToSeconds(right.start)
    )

    const merged: TimeInterval[] = []

    for (const interval of sortedIntervals) {
        const lastInterval = merged[merged.length - 1]

        if (!lastInterval) {
            merged.push(interval)
            continue
        }

        if (timeToSeconds(interval.start) <= timeToSeconds(lastInterval.end)) {
            merged[merged.length - 1] = {
                start: lastInterval.start,
                end: secondsToTime(
                    Math.max(
                        timeToSeconds(lastInterval.end),
                        timeToSeconds(interval.end)
                    )
                )
            }
            continue
        }

        merged.push(interval)
    }

    return merged
}

export function complementIntervals(intervals: TimeInterval[]): TimeInterval[] {
    const mergedIntervals = mergeIntervals(intervals)
    const freeIntervals: TimeInterval[] = []
    let cursor = 0

    for (const interval of mergedIntervals) {
        const intervalStart = timeToSeconds(interval.start)
        const intervalEnd = timeToSeconds(interval.end)

        if (intervalStart > cursor) {
            freeIntervals.push({
                start: secondsToTime(cursor),
                end: secondsToTime(intervalStart)
            })
        }

        cursor = Math.max(cursor, intervalEnd)
    }

    if (cursor < SECONDS_PER_DAY - 1) {
        freeIntervals.push({
            start: secondsToTime(cursor),
            end: secondsToTime(SECONDS_PER_DAY - 1)
        })
    }

    return freeIntervals
}
