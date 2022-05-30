import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';

import LogtoLoading from '@/components/LogtoLoading';

const SignOut = () => {
  const { signOut } = useLogto();

  useEffect(() => {
    void signOut(`${window.location.origin}/console`);
  }, [signOut]);

  return <LogtoLoading message="general.redirecting" />;
};

export default SignOut;
