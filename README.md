# Campus Loop

Campus Loop is a Next.js and React prototype for campus keke rides. It includes a student ride finder, four-seat shared trips, a driver view, driver wallet activity, and an admin finance dashboard.

## Run locally

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Prototype behavior

- Campus landmarks and demo driver coordinates are fixed in `src/lib/campus-data.ts`. Newly added campus points are rough placeholders, shown in amber and labelled "approximate"; confirm their coordinates before using them for navigation or guaranteed pickup.
- The map uses Leaflet with OpenStreetMap tiles. It does not require a Google Maps API key.
- Trips, payments, wallet balances, admin decisions, and fee settings are in-memory demo state. Refreshing the page resets them.
- The advance-booking panel demonstrates normal next-day requests and the ₦800 7am Class Ride. Class capacity is limited to four seats per demo driver commitment and slot; bookings, opt-ins, and held/refunded payment labels are local UI state only.
- No real authentication, payment provider, Firebase database, or bank transfer is connected. Do not use this prototype to process real rides or money.
- `npm run build` checks and builds the Next.js app; `npm run lint` runs Next.js ESLint.

## Production integration considerations

The demo currently models these workflows in local React state. A production deployment needs backend authorization and transactional persistence; client-side checks are not security controls.

### Atomic request acceptance

Accepting a ride must be an atomic state transition. With Firebase Realtime Database, run a transaction on the ride/request record and accept only while its status is still `requested` and its capacity allows the passenger. The transaction should set the winning driver and status together. A second driver's transaction must observe the changed state and fail instead of accepting the same request. Apply the same capacity check when adding a passenger to a shared trip.

### Guaranteed 7am Class Ride

The UI uses an 8:00pm local-time booking/cancellation cutoff for the next-day Class Ride and reserves at most four students for each opted-in driver and pickup slot. The driver commitment controls and booking/payment status are demo-only. Production must move slot-capacity reservation into a trusted transaction, accept payments through a provider into a held state, and run a scheduled backend job after cutoff to group bookings by pickup area/time and assign only opted-in vehicles. Verify vehicle/seat inventory before confirming payment; never promise a guaranteed booking beyond committed capacity. Send the 6:00am reminder after the assignment is confirmed, and settle or refund held funds according to verified pickup, completion, no-show, and driver-failure outcomes.

### Firebase security rules

Use authenticated user IDs as ownership keys. Students may create requests only for themselves and may update only permitted passenger/request fields. Drivers may write only their own location record and may accept only eligible requests. Validate field shapes, trip status transitions, and seat counts in rules or trusted server code. Admin fee changes, wallet freezes, and withdrawal decisions must be restricted to an authorized admin role; never rely on hidden UI controls.

### Driver location and Android background access

Only publish driver location while the driver is online or has an active trip. Throttle and distance-filter updates, stop listeners and location services when they are no longer needed, and avoid keeping every user's location stream active. For an Android app, request foreground location first and request background location only when the feature truly requires it; explain the purpose, handle denial, and follow the current Android permission flow and store policy.

### Map and campus data

The prototype's campus coordinates are static data, so adding landmarks does not need a places API. OpenStreetMap tiles keep the learning prototype free of a Google Maps key, but public tile services still have usage policies and are not a guaranteed production tile backend. For production, select a compliant tile provider and review its attribution, caching, and request limits. A Google Maps Platform implementation needs billing configured; verify current pricing and monthly allowances in Google's official documentation before launch.

### Money and reconciliation

This prototype records each passenger's fare separately and applies one configurable platform fee when a trip completes. Production payment settlement should be performed by a trusted backend, with idempotency keys and an immutable transaction ledger so retries cannot charge the fee twice. Withdrawal requests must reserve or re-check available balance atomically at approval time.

## Flutter Android foundation

The separate [`mobile/`](./mobile/) folder contains a Flutter Android app with Firebase Realtime Database transactions and rules, fixed campus pins, and throttled driver location publishing. Its Next-day Class Ride screens cover student booking, driver commitments and schedules, and admin demand/assignment, with scheduled Cloud Functions and FCM reminders. Payment processing remains intentionally unconnected; see the mobile README for Firebase setup, Blaze-plan requirements, and production gaps. Flutter is separate from the existing Next.js web prototype.
