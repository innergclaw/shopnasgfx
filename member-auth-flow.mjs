export const ACCOUNT_PATH = "/account/";
export const DASHBOARD_PATH = "/dashboard/";

export const isRecoveryCallback = (hash = "") => {
  const params = new URLSearchParams(String(hash).replace(/^#/, ""));
  return params.get("type") === "recovery";
};

export const shouldOpenDashboard = ({ session, recovery = false, path = ACCOUNT_PATH } = {}) =>
  Boolean(session?.user && !recovery && path === ACCOUNT_PATH);

export const shouldReturnToAccount = ({ session, path = DASHBOARD_PATH } = {}) =>
  Boolean(!session?.user && path === DASHBOARD_PATH);

