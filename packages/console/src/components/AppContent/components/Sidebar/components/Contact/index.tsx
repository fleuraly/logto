import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import { contacts } from './const';
import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onCancel?: () => void;
};

const Contact = ({ isOpen, onCancel }: Props) => {
  const { t } = useTranslation();

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout title="contact.title" subtitle="contact.description" onClose={onCancel}>
        <div className={styles.main}>
          {contacts.map(({ title, icon, description, label, link }) => (
            <div key={title} className={styles.row} onClick={() => window.open(link)}>
              <div className={styles.icon}>
                <img src={icon} alt={title} />
              </div>
              <div className={styles.text}>
                <div className={styles.title}>{t(title)}</div>
                <div className={styles.description}>{t(description)}</div>
              </div>
              <div>
                <Button type="outline" title={label} className={styles.button} />
              </div>
            </div>
          ))}
        </div>
      </ModalLayout>
    </ReactModal>
  );
};

export default Contact;
