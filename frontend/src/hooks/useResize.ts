import { useEffect, useState } from 'react';

const useResize = () => {
  const [width, setWidth] = useState<number>(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

export default useResize;
