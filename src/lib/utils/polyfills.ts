import serverAssert from 'node:assert/strict';

export const assert = globalThis.window != null ? console.assert : serverAssert;
