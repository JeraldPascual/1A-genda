export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        return Object.entries(item)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

export default cn;
