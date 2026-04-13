import { describe, expect, it } from 'vitest'
import { buildAuditsQueryParams, buildDispatchJobsQueryParams, buildEventsQueryParams } from './buildListQuery'

describe('buildEventsQueryParams', () => {
  it('omits empty filters', () => {
    expect(buildEventsQueryParams({ limit: 20, offset: 0 })).toBe('limit=20&offset=0')
  })
  it('includes status', () => {
    expect(buildEventsQueryParams({ limit: 10, offset: 5, status: 'pending' })).toContain('status=pending')
  })
})

describe('buildAuditsQueryParams', () => {
  it('includes extended keys', () => {
    const q = buildAuditsQueryParams({
      object_id: '7',
      actor_user_id: '2',
      created_after: '2026-01-01T00:00:00Z',
    })
    expect(q).toContain('object_id=7')
    expect(q).toContain('actor_user_id=2')
    expect(q).toContain('created_after=')
  })
})

describe('buildDispatchJobsQueryParams', () => {
  it('includes status', () => {
    expect(buildDispatchJobsQueryParams({ status: 'failed', limit: 50 })).toContain('status=failed')
    expect(buildDispatchJobsQueryParams({ status: 'failed', limit: 50 })).toContain('limit=50')
  })
})
