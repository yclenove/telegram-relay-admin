import { describe, expect, it } from 'vitest'
import { mainLayoutChildRoutes, menuItemsFromRoutes } from '@/router/nav'

describe('menuItemsFromRoutes', () => {
  it('从路由表生成侧栏项且不含重定向占位', () => {
    const items = menuItemsFromRoutes(mainLayoutChildRoutes)
    expect(items.find((i) => i.path === '/')).toBeUndefined()
    expect(items.some((i) => i.path === '/dashboard')).toBe(true)
    expect(items.some((i) => i.path === '/bots')).toBe(true)
    expect(items.some((i) => i.path === '/help')).toBe(true)
    expect(items.some((i) => i.path === '/notify-test')).toBe(true)
  })
})
