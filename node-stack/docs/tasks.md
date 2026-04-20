# Project Tasks & Roadmap

## Auth Module (Pending Improvements)
- [ ] **MFA Recovery Codes**: Implement fallback recovery codes for users who lose access to their TOTP device.
    - [ ] Add `twoFactorRecoveryCodes` column to `users` table.
    - [ ] Generate 10 codes during 2FA activation.
    - [ ] Implement usage logic in `login/2fa` endpoint.
- [ ] **Extended Session Metadata**: Parse `User-Agent` to store granular device info (OS, Browser, Device Type).
    - [ ] Update `sessions` table schema.
    - [ ] Integrate a parser (e.g., `ua-parser-js`).
- [ ] **Account Lockout**: Implement a lock period after multiple failed login attempts.
- [ ] **Session Notification**: Notify user via email when a new login occurs from an unrecognized device.

## Next Modules
- [x] **Workspaces Module**
- [x] **Billing Module**
- [x] **Storage Module**
- [x] **AI Module**