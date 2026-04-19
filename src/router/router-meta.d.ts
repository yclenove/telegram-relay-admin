import type { Component } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** 侧栏菜单图标；无则不在菜单中展示（如重定向占位）。 */
    menuIcon?: Component
  }
}
