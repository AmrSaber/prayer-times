import { browser } from '$app/environment';
import serverAssert from 'node:assert/strict';

export const assert = browser ? console.assert : serverAssert;
