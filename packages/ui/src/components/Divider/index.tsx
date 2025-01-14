import classNames from 'classnames';
import React from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  label?: TFuncKey<'translation', 'main_flow'>;
};

const Divider = ({ className, label }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <div className={classNames(styles.divider, className)}>
      <i className={styles.line} />
      {label && t(label)}
      <i className={styles.line} />
    </div>
  );
};

export default Divider;
