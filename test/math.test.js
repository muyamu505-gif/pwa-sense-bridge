import test from 'node:test';
import assert from 'node:assert/strict';
import { angleDelta, circularMean, classifyRotation, gravityRoll, screenGravity } from '../src/math.js';

test('angle delta crosses the 0/360 boundary', () => {
  assert.equal(angleDelta(5, 355), 10);
  assert.equal(angleDelta(355, 5), -10);
});

test('circular mean stays near 180 across its boundary', () => {
  assert.ok(Math.abs(Math.abs(circularMean([179, -179])) - 180) < 0.01);
});

test('screen gravity follows portrait and landscape axes', () => {
  assert.deepEqual(screenGravity({ x: 2, y: -8 }, 0), { x: 2, y: -8, angle: 0 });
  assert.deepEqual(screenGravity({ x: 2, y: -8 }, 90), { x: 8, y: 2, angle: 90 });
});

test('gravity roll keeps opposite signs for left and right', () => {
  assert.ok(gravityRoll({ x: 5, y: -8 }) > 0);
  assert.ok(gravityRoll({ x: -5, y: -8 }) < 0);
});

test('rotation classifier emits all supported directions', () => {
  assert.equal(classifyRotation(40).direction, 'right');
  assert.equal(classifyRotation(-40).direction, 'left');
  assert.equal(classifyRotation(0, 45).direction, 'forward');
  assert.equal(classifyRotation(0, -45).direction, 'back');
  assert.equal(classifyRotation(10, 10), null);
});
