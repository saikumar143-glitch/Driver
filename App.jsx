import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function App() {
  const empty = {
    date: "",
    company: "",
    vehicle: "",
    customer: "",
    mobile: "",
    location: "",
    type: "Pickup",
    amount: 200,
  };

  const [trip, setTrip] = useState(empty);
  const [trips, setTrips] = useState(() => {
    try {
      const raw = localStorage.getItem("driving_trips_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("driving_trips_v1", JSON.stringify(trips));
  }, [trips]);

  const addTrip = () => {
    if (!trip.date) {
      alert("Please enter Date (YYYY-MM-DD)");
      return;
    }
    setTrips([trip, ...trips]);
    setTrip(empty);
  };

  const clearAll = () => {
    if (confirm("Clear all saved trips?")) {
      setTrips([]);
    }
  };

  const grouped = trips.reduce((acc, t) => {
    acc[t.date] = acc[t.date] || { count: 0, earnings: 0 };
    acc[t.date].count += 1;
    acc[t.date].earnings += Number(t.amount || 0);
    return acc;
  }, {});

  const totalTrips = trips.length;
  const totalEarnings = trips.reduce((s, t) => s + Number(t.amount || 0), 0);

  const exportCSV = () => {
    if (!trips.length) return alert("No trips to export");
    const hdr = [
      "Date", "Company", "Vehicle", "Customer",
      "Mobile", "Location", "Pickup/Drop", "Amount"
    ];
    const rows = trips.map(t => [
      t.date, t.company, t.vehicle, t.customer,
      t.mobile, t.location, t.type, t.amount
    ]);
    const csv = [hdr, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Driving_Trips.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-4xl mx-auto">

        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Driving Trip Manager
        </motion.h1>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="p-2 border rounded" placeholder="Date (YYYY-MM-DD)"
              value={trip.date} onChange={e => setTrip({ ...trip, date: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Company"
              value={trip.company} onChange={e => setTrip({ ...trip, company: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Vehicle Number"
              value={trip.vehicle} onChange={e => setTrip({ ...trip, vehicle: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Customer Name"
              value={trip.customer} onChange={e => setTrip({ ...trip, customer: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Customer Mobile"
              value={trip.mobile} onChange={e => setTrip({ ...trip, mobile: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Location"
              value={trip.location} onChange={e => setTrip({ ...trip, location: e.target.value })} />

            <select className="p-2 border rounded"
              value={trip.type}
              onChange={e => setTrip({ ...trip, type: e.target.value })}>
              <option>Pickup</option>
              <option>Drop</option>
            </select>

            <input className="p-2 border rounded" type="number"
              placeholder="Amount" value={trip.amount}
              onChange={e => setTrip({ ...trip, amount: e.target.value })} />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={addTrip}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl">Add Trip</button>
            <button onClick={exportCSV}
              className="px-4 py-2 border rounded-xl">Export CSV</button>
            <button onClick={clearAll}
              className="px-4 py-2 text-red-600 border rounded-xl">Clear All</button>
          </div>
        </div>

        {/* SUMMARY + TRIPS */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Daily Summary</h2>
            <div className="space-y-2 max-h-80 overflow-auto">
              {Object.keys(grouped).length === 0 && (
                <div className="text-gray-500">No trips yet</div>
              )}
              {Object.entries(grouped)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, info]) => (
                  <div key={date} className="flex justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{date}</div>
                      <div className="text-sm text-gray-500">{info.count} trips</div>
                    </div>
                    <div className="text-right font-bold">₹{info.earnings}</div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-semibold mb-2">
              All Trips ({totalTrips})
            </h2>

            <div className="space-y-2 max-h-80 overflow-auto">
              {trips.map((t, i) => (
                <div key={i} className="p-2 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{t.company} — {t.vehicle}</div>
                      <div className="text-sm">{t.customer} • {t.mobile}</div>
                      <div className="text-sm text-gray-500">{t.location} • {t.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{t.amount}</div>
                      <div className="text-sm text-gray-500">{t.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right mt-3 border-t pt-3 font-bold">
              Total Earnings: ₹{totalEarnings}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
