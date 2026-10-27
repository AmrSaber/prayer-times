import { describe, expect, test } from 'bun:test';
import { Timing } from './timing';

describe('Timing.format', () => {
  test('wraps to 00:00 when rounding up past midnight', () => {
    const timing = new Timing();
    timing.hours = 23;
    timing.minutes = 59;
    timing.seconds = 30;

    expect(timing.format()).toEqual('00:00');
  });

  test('rounds seconds up to the next minute', () => {
    expect(new Timing('10:20:05').format()).toEqual('10:21');
  });
});
