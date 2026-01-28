import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasSpecialEffects } from '../../utils/specialEffects';

const PinkThemeManager = () => {
  const { userData } = useAuth();

  useEffect(() => {
    if (hasSpecialEffects(userData)) {
      document.documentElement.classList.add('special-effects-pink');
    } else {
      document.documentElement.classList.remove('special-effects-pink');
    }

    return () => {
      document.documentElement.classList.remove('special-effects-pink');
    };
  }, [userData]);

  if (!hasSpecialEffects(userData)) return null;

  return (
    <style>{`
      .special-effects-pink {
        --color-primary: #ec4899; /* pink-500 */
        --color-primary-hover: #db2777; /* pink-600 */
      }
      
      .special-effects-pink .MuiButton-containedPrimary,
      .special-effects-pink .MuiButton-containedSuccess,
      .special-effects-pink .MuiButton-containedSecondary,
      .special-effects-pink .MuiButton-contained {
        background: linear-gradient(135deg, #F88379 0%, #db2777 100%) !important;
        border-color: transparent !important;
        box-shadow: 0 4px 10px rgba(236, 72, 153, 0.4) !important;
      }

      .special-effects-pink .MuiButton-containedPrimary:hover,
      .special-effects-pink .MuiButton-containedSuccess:hover,
      .special-effects-pink .MuiButton-containedSecondary:hover,
      .special-effects-pink .MuiButton-contained:hover {
        background: linear-gradient(135deg, #faa099 0%, #ec4899 100%) !important;
        box-shadow: 0 6px 14px rgba(236, 72, 153, 0.6) !important;
      }

      .special-effects-pink .btn-primary,
      .special-effects-pink button[class*="bg-primary-"],
      .special-effects-pink button[class*="bg-blue-"] {
        background-color: #ec4899 !important;
        border-color: #ec4899 !important;
      }
      
      .special-effects-pink button[class*="bg-primary-"]:hover,
      .special-effects-pink button[class*="bg-blue-"]:hover {
        background-color: #db2777 !important;
        border-color: #db2777 !important;
      }

      /* Text highlights */
      .special-effects-pink .text-primary-600,
      .special-effects-pink .text-blue-600,
      .special-effects-pink .text-sky-400 {
        color: #ec4899 !important;
      }
      
      /* Borders */
      .special-effects-pink .border-primary-600,
      .special-effects-pink .border-blue-600,
      .special-effects-pink .border-sky-500 {
        border-color: #ec4899 !important;
      }
    `}</style>
  );
};

export default PinkThemeManager;
