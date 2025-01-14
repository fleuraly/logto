import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';
import * as styles from './IframeConfirmModal.module.scss';
import { ModalProps } from './type';

type Props = { url: string } & Omit<ModalProps, 'children'>;

const IframeConfirmModal = ({
  className,
  isOpen = false,
  url,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  onConfirm,
  onClose,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <ReactModal
      role="dialog"
      isOpen={isOpen}
      className={classNames(styles.modal, className)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      appElement={document.querySelector('main') ?? undefined}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <iframe
            role="iframe"
            src={url}
            title="terms"
            frameBorder="0"
            width="100%"
            height="100%"
          />
        </div>
        <div className={styles.footer}>
          <Button type="secondary" onClick={onClose}>
            {t(cancelText)}
          </Button>
          <Button onClick={onConfirm ?? onClose}>{t(confirmText)}</Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default IframeConfirmModal;
