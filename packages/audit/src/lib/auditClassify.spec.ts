import { describe, it, expect } from 'vitest'
import { classifyActor, groupByDay, formatDayLabel } from './auditClassify'

describe('classifyActor', () => {
  it('classifies sa: prefix as service', () => {
    expect(classifyActor('sa:platform-bot')).toBe('service')
  })

  it('classifies svc prefix as service', () => {
    expect(classifyActor('svc-deployer')).toBe('service')
  })

  it('classifies sb- prefix as sandbox', () => {
    expect(classifyActor('sb-790')).toBe('sandbox')
  })

  it('classifies actorId containing @ as human', () => {
    expect(classifyActor('dario@gocell.dev')).toBe('human')
  })

  it('classifies cell-like names (known cell names ending with core) as cell', () => {
    expect(classifyActor('observecore')).toBe('cell')
  })

  it('classifies auditcore as cell', () => {
    expect(classifyActor('auditcore')).toBe('cell')
  })

  it('returns unknown for unrecognised actors', () => {
    expect(classifyActor('some-random-id')).toBe('unknown')
  })

  it('returns unknown for empty string', () => {
    expect(classifyActor('')).toBe('unknown')
  })
})

describe('groupByDay', () => {
  const makeEntry = (ts: string, id: string) => ({
    id,
    eventId: id,
    eventType: 'test.event',
    actorId: 'actor',
    timestamp: ts,
    occurredAt: ts,
  })

  it('groups entries by local date label', () => {
    // Use dates far apart (noon UTC) so they always land on the same local date
    // regardless of the test runner's timezone offset (±14h max).
    const entries = [
      makeEntry('2026-06-01T12:00:00Z', 'a'),
      makeEntry('2026-06-01T13:00:00Z', 'b'),
      makeEntry('2026-06-10T12:00:00Z', 'c'),
    ]
    const groups = groupByDay(entries)
    expect(groups).toHaveLength(2)
    expect(groups[0]?.entries).toHaveLength(2)
    expect(groups[1]?.entries).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(groupByDay([])).toEqual([])
  })

  it('falls back to timestamp when occurredAt is absent', () => {
    const entries = [
      {
        id: 'a',
        eventId: 'a',
        eventType: 'x',
        actorId: 'actor',
        timestamp: '2026-06-01T10:00:00Z',
      },
    ]
    const groups = groupByDay(entries)
    expect(groups).toHaveLength(1)
    expect(groups[0]?.entries).toHaveLength(1)
  })
})

describe('formatDayLabel', () => {
  it('returns a non-empty string for a valid date key', () => {
    const label = formatDayLabel('2026-06-01')
    expect(typeof label).toBe('string')
    expect(label.length).toBeGreaterThan(0)
  })

  it('returns the key unchanged for an invalid date', () => {
    expect(formatDayLabel('not-a-date')).toBe('not-a-date')
  })
})
