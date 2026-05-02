const BASE = process.env.REACT_APP_API_URL || '';

export const AUTH_LOGIN_API              = `${BASE}/api/auth/login`;
export const AUTH_REGISTER_API           = `${BASE}/api/auth/register`;
export const AUTH_LOGOUT_API             = `${BASE}/api/auth/logout`;
export const AUTH_PROFILE_API            = `${BASE}/api/auth/profile`;
export const AUTH_CHANGE_PASS_API        = `${BASE}/api/auth/change_password`;
export const AUTH_RESET_PASS_API         = `${BASE}/api/auth/reset_password`;
export const AUTH_RESET_PASS_CONFIRM_API = `${BASE}/api/auth/reset_password_confirm`;
export const AUTH_SEND_VERIFICATION_API  = `${BASE}/api/auth/send_verification`;
export const AUTH_VERIFY_EMAIL_API       = `${BASE}/api/auth/verify_email`;
