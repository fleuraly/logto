import { useLogto } from '@logto/react';
import { User, UserRole } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { getAvatarById } from '@/consts/avatars';
import useApi from '@/hooks/use-api';
import SignOut from '@/icons/SignOut';

import * as styles from './index.module.scss';

const UserInfo = () => {
  const { isAuthenticated, getIdTokenClaims } = useLogto();
  const api = useApi();
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropDown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const { sub: userId } = getIdTokenClaims() ?? {};

        if (userId) {
          const data = await api.get(`/api/users/${userId}`).json<User>();
          setUser(data);
        }
      }
    })();
  }, [api, isAuthenticated, getIdTokenClaims]);

  if (!user) {
    return null;
  }

  const { id, name, avatar, roleNames } = user;
  const isAdmin = roleNames.includes(UserRole.Admin);

  return (
    <>
      <div
        ref={anchorRef}
        className={classNames(styles.container, showDropDown && styles.active)}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <img src={avatar ?? getAvatarById(id)} />
        <div className={styles.wrapper}>
          <div className={styles.name}>{name}</div>
          {isAdmin && <div className={styles.role}>{t('user_details.roles.admin')}</div>}
        </div>
      </div>
      <Dropdown
        anchorRef={anchorRef}
        className={styles.dropdown}
        isOpen={showDropDown}
        horizontalAlign="end"
        onClose={() => {
          setShowDropdown(false);
        }}
      >
        <DropdownItem
          className={styles.dropdownItem}
          icon={<SignOut />}
          onClick={() => {
            navigate('/sign-out');
          }}
        >
          {t('sign_out')}
        </DropdownItem>
      </Dropdown>
    </>
  );
};

export default UserInfo;
