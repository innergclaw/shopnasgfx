import test from "node:test";
import assert from "node:assert/strict";
import { isRecoveryCallback, shouldOpenDashboard, shouldReturnToAccount } from "./member-auth-flow.mjs";

test("authenticated account opens dashboard", () => {
  assert.equal(shouldOpenDashboard({ session: { user: { id: "member" } } }), true);
});
test("unauthenticated account stays open", () => {
  assert.equal(shouldOpenDashboard({ session: null }), false);
});
test("recovery remains on account", () => {
  assert.equal(isRecoveryCallback("#type=recovery&access_token=token"), true);
  assert.equal(shouldOpenDashboard({ session: { user: {} }, recovery: true }), false);
});
test("unauthenticated dashboard returns to account", () => {
  assert.equal(shouldReturnToAccount({ session: null }), true);
});
test("authenticated dashboard renders", () => {
  assert.equal(shouldReturnToAccount({ session: { user: {} } }), false);
});


test("new passwords need 10+ characters with letters and digits", async () => {
  const { newPasswordProblem } = await import("./member-auth-flow.mjs");
  for (const bad of ["", "abc12", "abcdefghij", "1234567890", "abcdefgh1"]) assert.ok(newPasswordProblem(bad), bad);
  for (const good of ["abcdefgh12", "Member2026pass"]) assert.equal(newPasswordProblem(good), "", good);
});
