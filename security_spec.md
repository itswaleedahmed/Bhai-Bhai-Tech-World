# Security Specification: Bhai Bhai Tech World

## 1. Data Invariants & Authorization Logic
- **Identity Integrity**: Users can read and update only their own profile (`users/{userId}` where `userId == request.auth.uid`).
- **Owner & Admin Access**: The designated store owner email `itswaleedahmed@gmail.com` with `email_verified == true` and documents in `/admins/{uid}` hold administrative access across store configurations, orders, and inquiries.
- **Order Security**: Customers can create orders tied to their `userId` and view their own orders (`resource.data.userId == request.auth.uid`). Admins can view and update order fulfillment statuses.
- **Store Configuration**: Public can read `/storeConfig/{configId}` to display operational timings, announcements, and contact information. Only verified admins can write or modify store settings.

## 2. The "Dirty Dozen" Attack Vectors & Edge Payloads
1. **Unauthenticated Profile Hijack**: Anonymous actor writes to `/users/any-uid`. Must return `PERMISSION_DENIED`.
2. **Cross-User Profile Spoofing**: User A attempts to update User B's `/users/userB` record. Must return `PERMISSION_DENIED`.
3. **Ghost Field Injection**: User sends arbitrary extra keys (e.g. `isAdmin: true` or `role: 'admin'`) during profile update. Must return `PERMISSION_DENIED`.
4. **Non-Owner Admin Elevation**: Regular user writes to `/admins/{uid}` to self-grant privileges. Must return `PERMISSION_DENIED`.
5. **Unverified Email Spoofing**: Actor presents unverified token for `itswaleedahmed@gmail.com`. Must return `PERMISSION_DENIED`.
6. **Malicious Document ID Poisoning**: Attacker injects oversized or invalid characters in path variables. Must return `PERMISSION_DENIED`.
7. **Order Hijacking**: Customer A reads or cancels Customer B's order. Must return `PERMISSION_DENIED`.
8. **Negative / NaN Order Pricing**: Attacker places order with negative or non-numeric total amount. Must return `PERMISSION_DENIED`.
9. **Store Config Tampering by Customer**: Regular logged-in customer attempts to change store hotline or pricing margin. Must return `PERMISSION_DENIED`.
10. **Denial-of-Wallet Payload Overflow**: Attacker sends string payloads exceeding byte bounds (>500 chars). Must return `PERMISSION_DENIED`.
11. **Client Delegation Query Bypass**: Attempting unfiltered list scans without user identifier filter. Must return `PERMISSION_DENIED`.
12. **Status Shortcutting**: Non-admin user attempts to mark an order as "delivered". Must return `PERMISSION_DENIED`.
