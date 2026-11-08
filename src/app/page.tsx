'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PLACES, DRIVERS, SLOTS, fareBetween, type Driver, type VehicleType } from '@/lib/campus-data';

const CampusMap = dynamic(() => import('@/components/CampusMap'), { ssr: false });

type Req = { id: number; from: string; to: string; type: VehicleType; fare: number; status: 'requested' | 'accepted' | 'done'; driverId?: string };
type Tab = 'student' | 'driver' | 'booking' | 'admin';
const naira = (n: number) => `₦${n.toLocaleString()}`;
const place = (id: string) => PLACES.find((p) => p.id === id)?.name ?? id;

export default function Home() {
  const [tab, setTab] = useState<Tab>('student');
  const [from, setFrom] = useState('hostels');
  const [to, setTo] = useState('computing');
  const [type, setType] = useState<VehicleType>('keke');
  const [reqs, setReqs] = useState<Req[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [driverId, setDriverId] = useState('k1');
  const [fee, setFee] = useState(100);
  const [income, setIncome] = useState(0);
  const [msg, setMsg] = useState('');
  const [slotCount, setSlotCount] = useState<Record<string, number>>({});
  const [mySlots, setMySlots] = useState<string[]>([]);

  const fare = type === 'minibus' ? 300 : fareBetween(from, to);
  const me = drivers.find((d) => d.id === driverId)!;

  function request() {
    if (from === to) return setMsg('Pick two different places.');
    setReqs((r) => [...r, { id: Date.now(), from, to, type, fare, status: 'requested' }]);
    setMsg('Request sent. Switch to the Driver tab to accept it.');
  }
  function accept(r: Req) {
    if (r.status !== 'requested') return setMsg('Another driver already took this ride.');
    if (me.wallet < fee) return setMsg(`${me.name} needs at least ${naira(fee)} in the wallet to accept.`);
    setReqs((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'accepted', driverId: me.id } : x)));
    setMsg('');
  }
  function complete(r: Req) {
    setReqs((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'done' } : x)));
    setDrivers((ds) => ds.map((d) => (d.id === r.driverId ? { ...d, wallet: d.wallet + r.fare - fee } : d)));
    setIncome((i) => i + fee);
  }
  function book(slot: string) {
    if (new Date().getHours() >= 20) return setMsg('Booking for tomorrow closed at 8:00pm.');
    if ((slotCount[slot] ?? 0) >= 4) return setMsg('That slot is full (4 seats).');
    setSlotCount((s) => ({ ...s, [slot]: (s[slot] ?? 0) + 1 }));
    setMySlots((m) => [...m, slot]);
    setMsg(`Booked ${slot}. ₦800 payment is held until your pickup is confirmed.`);
  }

  const tabs: [Tab, string][] = [['student', 'Student'], ['driver', 'Driver'], ['booking', '7am Class Ride'], ['admin', 'Admin']];

  return (
    <main className="app">
      <header>
        <h1>Campus Loop</h1>
        <p>Tap, Move, Arrive. Demo only: nothing is saved and no real money moves.</p>
      </header>
      <nav>
        {tabs.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setMsg(''); }}>{label}</button>
        ))}
      </nav>
      {msg && <p className="msg" role="status">{msg}</p>}

      {tab === 'student' && (
        <section>
          <CampusMap drivers={drivers} selected={[from, to]} />
          <div className="row">
            <label>From<select value={from} onChange={(e) => setFrom(e.target.value)}>{PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label>To<select value={to} onChange={(e) => setTo(e.target.value)}>{PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label>Ride<select value={type} onChange={(e) => setType(e.target.value as VehicleType)}><option value="keke">Keke (4 seats)</option><option value="minibus">Mini bus (9 seats)</option></select></label>
          </div>
          <p>Fare: <b>{naira(fare)}</b> (a {naira(fee)} service fee is taken from the driver&apos;s wallet)</p>
          <button className="btn" onClick={request}>Request {type === 'keke' ? 'Keke' : 'Mini bus'} now</button>
          <h2>Your rides</h2>
          {reqs.length === 0 && <p>No rides yet.</p>}
          {reqs.map((r) => <p key={r.id} className="card">{place(r.from)} to {place(r.to)}: {naira(r.fare)} ({r.status}{r.driverId ? `, ${drivers.find((d) => d.id === r.driverId)?.name}` : ''})</p>)}
        </section>
      )}

      {tab === 'driver' && (
        <section>
          <label>Driver<select value={driverId} onChange={(e) => setDriverId(e.target.value)}>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <p>Wallet: <b>{naira(me.wallet)}</b></p>
          <h2>Open requests</h2>
          {reqs.filter((r) => r.status === 'requested' && r.type === me.type).map((r) => (
            <p key={r.id} className="card">{place(r.from)} to {place(r.to)}: {naira(r.fare)} <button className="btn small" onClick={() => accept(r)}>Accept</button></p>
          ))}
          <h2>My trips</h2>
          {reqs.filter((r) => r.status === 'accepted' && r.driverId === me.id).map((r) => (
            <p key={r.id} className="card">{place(r.from)} to {place(r.to)} <button className="btn small" onClick={() => complete(r)}>Complete trip</button></p>
          ))}
        </section>
      )}

      {tab === 'booking' && (
        <section>
          <h2>Next-day 7am Class Ride: {naira(800)}</h2>
          <p>Book before 8:00pm the day before. Each slot holds at most 4 students.</p>
          {SLOTS.map((s) => (
            <p key={s} className="card">Pickup {s}: {slotCount[s] ?? 0}/4 seats{' '}
              <button className="btn small" disabled={(slotCount[s] ?? 0) >= 4} onClick={() => book(s)}>Book</button>
              {mySlots.includes(s) && ' (booked, payment held)'}
            </p>
          ))}
        </section>
      )}

      {tab === 'admin' && (
        <section>
          <label>Service fee per ride (₦)<input type="number" min={0} value={fee} onChange={(e) => setFee(Math.max(0, Number(e.target.value)))} /></label>
          <p>Admin income so far: <b>{naira(income)}</b></p>
          <h2>Driver wallets</h2>
          {drivers.map((d) => (
            <p key={d.id} className="card">{d.name}: {naira(d.wallet)}{' '}
              <button className="btn small" onClick={() => setDrivers((ds) => ds.map((x) => (x.id === d.id ? { ...x, wallet: x.wallet + 500 } : x)))}>Top up ₦500</button>
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
