import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import completeIndicator from '@/assets/images/circle-tick.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import Spacer from '@/components/Spacer';
import useAdminConsoleConfigs from '@/hooks/use-configs';

import useGetStartedMetadata from './hook';
import * as styles from './index.module.scss';

const GetStarted = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data } = useGetStartedMetadata();
  const { updateConfigs } = useAdminConsoleConfigs();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const hideGetStarted = () => {
    void updateConfigs({ hideGetStarted: true });
    // Navigate to next menu item
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>
          <span>{t('get_started.subtitle_part1')}</span>
          <Spacer />
          <span>
            {t('get_started.subtitle_part2')}
            <span
              className={styles.hideButton}
              onClick={() => {
                setShowConfirmModal(true);
              }}
            >
              {t('get_started.hide_this')}
            </span>
          </span>
        </div>
      </div>
      {data.map(({ id, title, subtitle, icon, isComplete, buttonText, onClick }) => (
        <Card key={id} className={styles.card}>
          <img className={styles.icon} src={icon} />
          {isComplete && <img className={styles.completeIndicator} src={completeIndicator} />}
          <div className={styles.wrapper}>
            <div className={styles.title}>{t(title)}</div>
            <div className={styles.subtitle}>{t(subtitle)}</div>
          </div>
          <Button
            className={styles.button}
            type="outline"
            size="large"
            title={buttonText}
            onClick={onClick}
          />
        </Card>
      ))}
      <ConfirmModal
        title="get_started.confirm"
        isOpen={showConfirmModal}
        confirmButtonText="admin_console.get_started.hide_this"
        onConfirm={hideGetStarted}
        onCancel={() => {
          setShowConfirmModal(false);
        }}
      >
        {t('get_started.confirm_message')}
      </ConfirmModal>
    </div>
  );
};

export default GetStarted;
