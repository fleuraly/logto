import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import InfoIcon from '@/assets/icons/info-icon.svg';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  message: string;
  onClose: () => void;
};

const Notification = ({ className, message, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <div className={classNames(styles.notification, className)}>
      <InfoIcon className={styles.icon} />
      <div className={styles.message}>{message}</div>
      <a className={styles.link} onClick={onClose}>
        {t('action.got_it')}
      </a>
    </div>
  );
};

export default Notification;
