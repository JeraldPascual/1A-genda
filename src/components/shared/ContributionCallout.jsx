/**
 * ContributionCallout component displays a call-to-action section encouraging students
 * to contribute to the 1A-genda codebase, inspired by CivicTech community engagement of BetterGov.
 *
 * Usage:
 * Placed this component below the SemesterProgress to inspire collaborative development
 * and open-source contribution from the class community.
 *
 * This component is purely presentational and does not manage state or mutate data.
 */
import { Users, GitBranch, Heart } from 'lucide-react';

const ContributionCallout = () => {
  return (
    <div className="w-full dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 light:bg-gradient-to-r light:from-blue-700 light:via-blue-600 light:to-blue-700 py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent"></div>
      <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full dark:bg-yellow-500/20 light:bg-yellow-300/30 flex items-center justify-center border-2 dark:border-yellow-500/50 light:border-yellow-200/50">
            <Users className="w-8 h-8 dark:text-yellow-400 light:text-yellow-50" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 dark:text-white light:text-white">
          Contribute to <span className="text-yellow-400 dark:text-yellow-300">1A-genda</span>
        </h2>

        {/* Subtitle */}
        <p className="text-center dark:text-gray-300 light:text-blue-50 mb-2 text-lg max-w-3xl mx-auto">
          Help improve our class platform and learn collaborative development.
        </p>
        <p className="text-center font-semibold dark:text-yellow-300 light:text-yellow-100 mb-8 text-lg">
          Student-led. Open source. Community-driven.
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-center mb-8">
          <a
            href="https://github.com/JeraldPascual/1A-genda"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <GitBranch className="w-5 h-5" />
            <span>Contribute Code</span>
            <span className="text-xl">→</span>
          </a>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2 dark:text-pink-300 light:text-pink-100">
            <span className="text-lg">🚀</span>
            <span>Infrastructure</span>
          </div>
          <div className="text-dark-text-muted light:text-blue-200">•</div>
          <div className="flex items-center gap-2 dark:text-orange-300 light:text-orange-100">
            <span className="text-lg">👥</span>
            <span>Peer Support</span>
          </div>
          <div className="text-dark-text-muted light:text-blue-200">•</div>
          <div className="flex items-center gap-2 dark:text-green-300 light:text-green-100">
            <span className="text-lg">🤝</span>
            <span>Community</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContributionCallout;
