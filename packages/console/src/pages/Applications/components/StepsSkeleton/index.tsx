import React from 'react';

import * as styles from './index.module.scss';

const StepsSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, stepIndex) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={stepIndex} className={styles.step}>
        <div className={styles.index} />
        <div className={styles.wrapper}>
          <div className={styles.title} />
          <div className={styles.subtitle} />
        </div>
      </div>
    ))}
  </>
);

export default StepsSkeleton;
