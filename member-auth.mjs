import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm";
import { ACCOUNT_PATH, DASHBOARD_PATH, isRecoveryCallback, shouldOpenDashboard, shouldReturnToAccount } from "./member-auth-flow.mjs";

const SUPABASE_URL = "https://zkyhhoxcrjkhywblzehr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bdi3BexAKWDBaUIh40hJ_A_8CNVdnM_";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const page = document.body.dataset.memberPage;
const status = document.querySelector("#member-status");
let redirecting = false;
let recoveryMode = isRecoveryCallback(window.location.hash);

const setStatus = (message, state = "") => {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
};

const fixedAccountURL = () => `${window.location.origin}/account/`;

const openDashboard = () => {
  if (redirecting) return;
  redirecting = true;
  window.location.replace(DASHBOARD_PATH);
};

const initializeAccount = async () => {
  const providerButton = document.querySelector("[data-provider='google']");
  const emailForm = document.querySelector("#member-email-form");
  const recoveryForm = document.querySelector("#member-recovery-form");
  const signInButton = document.querySelector("[data-email-action='signin']");

  const showRecovery = () => {
    recoveryMode = true;
    providerButton.hidden = true;
    emailForm.hidden = true;
    recoveryForm.hidden = false;
    setStatus("Choose a new password to finish recovery.");
  };

  providerButton.addEventListener("click", async () => {
    providerButton.disabled = true;
    setStatus("Opening secure Google sign-in...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: fixedAccountURL() },
    });
    if (error) {
      providerButton.disabled = false;
      setStatus("Google sign-in could not start. Use email or try again.", "error");
    }
  });

  const submitEmail = async (mode) => {
    const formData = new FormData(emailForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || password.length < 8) {
      setStatus("Enter a valid email and a password with at least 8 characters.", "error");
      return;
    }
    [...emailForm.querySelectorAll("button")].forEach((button) => { button.disabled = true; });
    setStatus(mode === "signup" ? "Creating your member account..." : "Signing you in...");
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: fixedAccountURL() } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      [...emailForm.querySelectorAll("button")].forEach((button) => { button.disabled = false; });
      setStatus("We could not complete that request. Check your details and try again.", "error");
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setStatus("Check your email to confirm your account. Then return here to sign in.", "success");
      return;
    }
    openDashboard();
  };

  emailForm.addEventListener("submit", (event) => { event.preventDefault(); submitEmail("signup"); });
  signInButton.addEventListener("click", () => submitEmail("signin"));

  recoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(recoveryForm);
    const password = String(formData.get("password") || "");
    const confirmation = String(formData.get("password-confirm") || "");
    if (password.length < 8 || password !== confirmation) {
      setStatus("Use at least 8 characters and make both passwords match.", "error");
      return;
    }
    const button = recoveryForm.querySelector("button");
    button.disabled = true;
    setStatus("Updating your password...");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      button.disabled = false;
      setStatus("We could not update your password. Request a new recovery email and try again.", "error");
      return;
    }
    recoveryMode = false;
    setStatus("Password updated. Opening your member room...", "success");
    openDashboard();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") showRecovery();
    if (!redirecting && shouldOpenDashboard({ session, recovery: recoveryMode, path: window.location.pathname })) openDashboard();
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus("We could not check your session. You can still sign in below.", "error");
    return;
  }
  if (recoveryMode) showRecovery();
  else if (shouldOpenDashboard({ session: data.session, path: window.location.pathname })) openDashboard();
  else setStatus("Use Google or your email and password to continue.");
};

const initializeDashboard = async () => {
  const content = document.querySelector("#member-dashboard");
  const email = document.querySelector("#member-email");
  const signOut = document.querySelector("#member-signout");

  const returnToAccount = () => {
    if (redirecting) return;
    redirecting = true;
    window.location.replace(ACCOUNT_PATH);
  };

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || shouldReturnToAccount({ session, path: window.location.pathname })) returnToAccount();
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    setStatus("We could not check your secure session. Return to member access and try again.", "error");
    return;
  }
  if (shouldReturnToAccount({ session: sessionData.session, path: window.location.pathname })) {
    returnToAccount();
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    setStatus("We could not verify your member session. Return to member access and try again.", "error");
    return;
  }

  email.textContent = userData.user.email ? `Signed in as ${userData.user.email}.` : "Your member access is active.";
  content.classList.add("is-visible");
  status.hidden = true;

  signOut.addEventListener("click", async () => {
    signOut.disabled = true;
    const { error } = await supabase.auth.signOut();
    if (error) {
      signOut.disabled = false;
      setStatus("We could not sign you out. Try again.", "error");
      status.hidden = false;
      return;
    }
    returnToAccount();
  });
};

if (page === "account") initializeAccount();
if (page === "dashboard") initializeDashboard();
