/// <reference types="@sveltejs/kit" />
import type { TooltipPositionerFunction } from 'chart.js';

declare module 'chart.js' {
  interface TooltipPositionerMap { fixed: TooltipPositionerFunction<'line'> }
}

declare namespace App {
  // interface Error {}
  // interface Locals {}
  // interface PageData {}
  // interface PageState {}
  // interface Platform {}
}
