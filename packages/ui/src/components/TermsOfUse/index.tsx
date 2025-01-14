import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  name: string;
  className?: string;
  termsUrl: string;
  isChecked?: boolean;
  onChange: (checked: boolean) => void;
  onTermsClick?: () => void;
};

const TermsOfUse = ({ name, className, termsUrl, isChecked, onChange, onTermsClick }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const prefix = t('description.agree_with_terms');

  return (
    <div
      className={classNames(styles.terms, className)}
      onClick={() => {
        onChange(!isChecked);
      }}
    >
      <Checkbox name={name} checked={isChecked} className={styles.checkBox} />
      <div className={styles.content}>
        {prefix}
        <TextLink
          className={styles.link}
          text="description.terms_of_use"
          href={onTermsClick ? undefined : termsUrl} // Do not open link if onTermsClick is provided
          target="_blank"
          type="secondary"
          onClick={(event) => {
            // Prevent above parent onClick event being triggered
            event.stopPropagation();
            onTermsClick?.();
          }}
        />
      </div>
    </div>
  );
};

export default TermsOfUse;
