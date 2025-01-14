import React from 'react';
import ModalContainer from 'react-modal-promise';

import TermsOfUseComponent from '@/components/TermsOfUse';
import usePlatform from '@/hooks/use-platform';
import useTerms from '@/hooks/use-terms';

type Props = {
  className?: string;
};

const TermsOfUse = ({ className }: Props) => {
  const { termsAgreement, setTermsAgreement, termsSettings, termsOfUserModalHandler } = useTerms();
  const { isMobile } = usePlatform();

  if (!termsSettings?.enabled || !termsSettings.contentUrl) {
    return null;
  }

  return (
    <>
      <TermsOfUseComponent
        className={className}
        name="termsAgreement"
        termsUrl={termsSettings.contentUrl}
        isChecked={termsAgreement}
        onChange={(checked) => {
          setTermsAgreement(checked);
        }}
        onTermsClick={isMobile ? termsOfUserModalHandler : undefined}
      />
      <ModalContainer />
    </>
  );
};

export default TermsOfUse;
