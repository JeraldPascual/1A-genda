/**
 * DailyQuote component displays a daily inspirational quote, selected deterministically per day and cached in localStorage.
 * Uses a local JSON file for quotes and ensures the same quote is shown for a given day.
 *
 * Usage:
 * Place this component in a dashboard or landing page to provide users with a motivational quote.
 *
 * Avoid mutating the quotes data or bypassing the cache logic to prevent inconsistent daily quotes.
 */
import { useState, useEffect } from 'react';
import quotesData from '../../data/quotes.json';

const DailyQuote = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(true);

  const getPHDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return phTime.toDateString();
  };

  useEffect(() => {
    const fetchQuote = async () => {
      const today = getPHDate();
      const cachedData = localStorage.getItem('dailyQuote');

      // Check cache first
      if (cachedData) {
        try {
          const { quote: cachedQuote, date } = JSON.parse(cachedData);
          if (date === today) {
            setQuote(cachedQuote);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached quote:', e);
        }
      }

      // Use static quotes from local JSON file
      // Consistent quote per day using date as seed
      const dateHash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const availableQuotes = quotesData.quotes;
      const selectedQuote = availableQuotes[dateHash % availableQuotes.length];

      const newQuote = {
        text: selectedQuote.text,
        author: selectedQuote.author
      };

      setQuote(newQuote);
      localStorage.setItem('dailyQuote', JSON.stringify({
        quote: newQuote,
        date: today
      }));

      setLoading(false);
    };
    fetchQuote();
  }, []);

  return (
    <div className="text-center mb-8" aria-live="polite" aria-atomic="true">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 dark:bg-dark-bg-secondary light:bg-light-bg-secondary rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-4 dark:bg-dark-bg-secondary light:bg-light-bg-secondary rounded w-1/3 mx-auto"></div>
        </div>
      ) : (
        <>
          <blockquote className="text-xl md:text-2xl font-medium dark:text-dark-text-primary light:text-light-text-primary italic mb-2 leading-relaxed">
            "{quote.text}"
          </blockquote>
          <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted font-semibold">
            — {quote.author}
          </p>
        </>
      )}
    </div>
  );
}

export default DailyQuote;
