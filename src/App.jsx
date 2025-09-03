import React, { useEffect, useState } from "react";
import { fetchAttendance, saveAttendance } from "./api";

const initialSubjects = [
  { courseCode: "Service Oriented Architecture", conducted: 17, absent: 1 },
  { courseCode: "Full Stack Web Development", conducted: 15, absent: 1 },
  { courseCode: "Internet of Things", conducted: 15, absent: 3 },
  { courseCode: "Wireless Sensor Networks", conducted: 15, absent: 3 },
  { courseCode: "Semiconductor Packaging Technologies", conducted: 17, absent: 3 },
  { courseCode: "Behavioral Psychology", conducted: 15, absent: 0 },
];

export default function App() {
  const [subjects, setSubjects] = useState([]); // empty initially
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAttendance();
        if (data?.subjects?.length) {
          setSubjects(data.subjects);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false); // ✅ stop loading
      }
    }
    loadData();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = field === "courseCode" ? value : Number(value);
    setSubjects(updated);
  };

  const adjustValue = (index, field, delta) => {
    const updated = [...subjects];
    const newValue = updated[index][field] + delta;
    updated[index][field] = newValue < 0 ? 0 : newValue;
    setSubjects(updated);
  };

  const calculateStats = (subj) => {
    const { conducted, absent } = subj;
    const attended = conducted - absent;

    if (conducted === 0) {
      return { current: "-", skips: "-", projected: "-", needed: "-" };
    }

    const current = (attended / conducted) * 100;

    // ✅ max skips while staying >=75%
    const numerator = 0.25 * conducted - absent;
    const maxSkips = numerator < 0 ? 0 : Math.floor(numerator / 0.75);

    const projected = (attended / (conducted + maxSkips)) * 100;

    // ❌ if below 75%, find classes needed
    let needed = 0;
    if (current < 75) {
      needed = Math.ceil((0.75 * conducted - attended) / 0.25);
    }

    return {
      current: current.toFixed(2) + "%",
      skips: maxSkips,
      projected: projected.toFixed(2) + "%",
      needed: needed > 0 ? needed : 0,
    };
  };

  const handleSave = async () => {
    try {
      await saveAttendance(subjects);
      alert("Attendance saved ✅");
    } catch (err) {
      alert("Error saving attendance ❌");
      console.error(err);
    }
  };

  // ✅ Loading screen
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        <span className="ml-4 text-lg font-semibold text-gray-700">Loading attendance...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
        Attendance Skip Calculator
      </h1>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded-xl shadow-lg text-sm sm:text-base">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-2 py-2 border">Course Code</th>
              <th className="px-2 py-2 border">Conducted</th>
              <th className="px-2 py-2 border">Absent</th>
              <th className="px-2 py-2 border">Current %</th>
              <th className="px-2 py-2 border">Max Skips</th>
              <th className="px-2 py-2 border">Projected %</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, idx) => {
              const stats = calculateStats(subj);
              return (
                <tr key={idx} className="text-center">
                  <td className="border px-1 py-1">
                    <input
                      type="text"
                      value={subj.courseCode}
                      onChange={(e) => handleChange(idx, "courseCode", e.target.value)}
                      className="w-full border rounded px-1 py-1 text-xs sm:text-sm"
                    />
                  </td>
                  <td className="border px-1 py-1">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => adjustValue(idx, "conducted", -1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={subj.conducted}
                        onChange={(e) => handleChange(idx, "conducted", e.target.value)}
                        className="w-14 border rounded px-1 py-1 text-center"
                      />
                      <button
                        onClick={() => adjustValue(idx, "conducted", 1)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="border px-1 py-1">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => adjustValue(idx, "absent", -1)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={subj.absent}
                        onChange={(e) => handleChange(idx, "absent", e.target.value)}
                        className="w-14 border rounded px-1 py-1 text-center"
                      />
                      <button
                        onClick={() => adjustValue(idx, "absent", 1)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="border px-2 py-1">{stats.current}</td>
                  <td className={`border px-2 py-1 ${stats.needed > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}`}>
                    {stats.needed > 0
                      ? `${stats.needed}`  
                      : `${stats.skips}`}    
                  </td>
                  <td className="border px-2 py-1">{stats.projected}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-4">
        {subjects.map((subj, idx) => {
          const stats = calculateStats(subj);
          return (
            <div key={idx} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="mb-2">
                <label className="font-semibold">Course Code:</label>
                <input
                  type="text"
                  value={subj.courseCode}
                  onChange={(e) => handleChange(idx, "courseCode", e.target.value)}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Conducted:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustValue(idx, "conducted", -1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >-
                  </button>
                  <input
                    type="number"
                    value={subj.conducted}
                    onChange={(e) => handleChange(idx, "conducted", e.target.value)}
                    className="w-16 text-center border rounded px-1 py-1"
                  />
                  <button
                    onClick={() => adjustValue(idx, "conducted", 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >+
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Absent:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustValue(idx, "absent", -1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >-
                  </button>
                  <input
                    type="number"
                    value={subj.absent}
                    onChange={(e) => handleChange(idx, "absent", e.target.value)}
                    className="w-16 text-center border rounded px-1 py-1"
                  />
                  <button
                    onClick={() => adjustValue(idx, "absent", 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >+
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p><span className="font-semibold">Current %:</span> {stats.current}</p>
                <p><span className="font-semibold">Status:</span>{" "}
                  {stats.needed > 0 ? (
                    <span className="text-red-600 font-bold">Attend {stats.needed} classes</span>
                  ) : (
                    <span className="text-green-600 font-bold">Can skip {stats.skips} classes</span>
                  )}</p>
                <p><span className="font-semibold">Projected %:</span> {stats.projected}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Save
        </button>
      </div>
    </div>
  );
}