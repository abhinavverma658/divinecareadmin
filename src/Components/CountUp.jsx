import React, { useEffect, useState } from 'react';

function CountUp({ start, end, duration=1 }) {
  // console.log({ start, end, duration });

  const [count, setCount] = useState(start);
  const step = (end - start) / (duration * 1000); 

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const nextCount = start + step * elapsedTime;

      if (elapsedTime < duration * 1000) {
        setCount(nextCount);
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end); 
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [start, end, duration, step]);

  return (
    <div>
      <h1>{Math.round(count)}</h1>
    </div>
  );
}

export default CountUp;
