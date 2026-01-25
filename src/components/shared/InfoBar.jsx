/**
 * InfoBar component displays real-time weather, date, and time for SJDM, PH, updating every second and fetching weather every 10 minutes.
 * Uses Open-Meteo API for weather and local time formatting for display.
 *
 * Usage:
 * Place this component below the header or in a prominent location to provide users with up-to-date local information.
 *
 * Avoid hardcoding location or bypassing the fetchWeather helper to ensure maintainability and accuracy.
 */
import { useEffect, useState } from 'react';

// Helper to fetch weather for SJDM, PH (Open-Meteo API, no key needed)
const fetchWeather = async () => {
  // SJDM, Bulacan, PH: 14.8136° N, 121.0450° E
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=14.8136&longitude=121.0450&current_weather=true&timezone=Asia/Manila';
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.current_weather?.temperature ?? null;
  } catch {
    return null;
  }
};

export default function InfoBar() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    // Update date/time every second
    const update = () => {
      const now = new Date();
      setDate(now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
      setTime(now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchWeather().then(setTemp);
    const interval = setInterval(() => fetchWeather().then(setTemp), 10 * 60 * 1000); // update every 10 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 text-white flex flex-row justify-end items-center px-2 sm:px-6 py-1 shadow"
      style={{ minHeight: '2.25rem' }}
        aria-live="polite"
        aria-atomic="true"
    >
      <div className="flex flex-row gap-3 items-center text-xs md:text-xs font-medium w-full justify-end">
        <div className="flex items-center gap-1">
          <span role="img" aria-label="thermometer">🌡️</span>
          <span className="hidden sm:inline">SJDM:</span> {temp !== null ? `${temp.toFixed(1)}°C` : '--°C'}
        </div>
        <div className="flex items-center gap-1 ">
          <span role="img" aria-label="calendar" >📅</span>
          {date}
        </div>
        <div className="flex items-center gap-1">
          <span role="img" aria-label="clock">⏰</span>
          {time} <span className="ml-1">PHT</span>
        </div>
      </div>
    </div>
  );
}
