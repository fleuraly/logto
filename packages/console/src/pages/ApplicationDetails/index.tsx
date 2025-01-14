import { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import Drawer from '@/components/Drawer';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { ApplicationIcon } from '@/consts';
import useApi, { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import Delete from '@/icons/Delete';
import More from '@/icons/More';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import AdvancedSettings from './components/AdvancedSettings';
import DeleteForm from './components/DeleteForm';
import Settings from './components/Settings';
import * as styles from './index.module.scss';

const mapToUriFormatArrays = (value?: string[]) =>
  value?.filter(Boolean).map((uri) => decodeURIComponent(new URL(uri).toString()));

const ApplicationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Application, RequestError>(
    id && `/api/applications/${id}`
  );
  const { data: oidcConfig, error: fetchOidcConfigError } = useSWR<
    SnakeCaseOidcConfig,
    RequestError
  >('/oidc/.well-known/openid-configuration');
  const isLoading = (!data && !error) || (!oidcConfig && !fetchOidcConfigError);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const api = useApi();
  const formMethods = useForm<Application>();

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = formMethods;

  useEffect(() => {
    if (!data) {
      return;
    }

    reset(data);
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const updatedApplication = await api
      .patch(`/api/applications/${data.id}`, {
        json: {
          ...formData,
          oidcClientMetadata: {
            ...formData.oidcClientMetadata,
            redirectUris: mapToUriFormatArrays(formData.oidcClientMetadata.redirectUris),
            postLogoutRedirectUris: mapToUriFormatArrays(
              formData.oidcClientMetadata.postLogoutRedirectUris
            ),
          },
          customClientMetadata: {
            ...formData.customClientMetadata,
            corsAllowedOrigins: mapToUriFormatArrays(
              formData.customClientMetadata.corsAllowedOrigins
            ),
          },
        },
      })
      .json<Application>();
    void mutate(updatedApplication);
    toast.success(t('application_details.save_success'));
  });

  const isAdvancedSettings = location.pathname.includes('advanced-settings');

  return (
    <div className={detailsStyles.container}>
      <LinkButton
        to="/applications"
        icon={<Back />}
        title="admin_console.application_details.back_to_applications"
        className={styles.backLink}
      />
      {isLoading && <DetailsSkeleton />}
      {data && oidcConfig && (
        <>
          <Card className={styles.header}>
            <img className={styles.icon} src={ApplicationIcon[data.type]} />
            <div className={styles.metadata}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.details}>
                <div className={styles.type}>{t(`${applicationTypeI18nKey[data.type]}.title`)}</div>
                <div className={styles.verticalBar} />
                <div className={styles.text}>App ID</div>
                <CopyToClipboard value={data.id} className={styles.copy} />
              </div>
            </div>
            <div className={styles.operations}>
              <Button
                title="admin_console.application_details.check_help_guide"
                size="large"
                onClick={() => {
                  setIsReadmeOpen(true);
                }}
              />
              <Drawer
                isOpen={isReadmeOpen}
                onClose={() => {
                  setIsReadmeOpen(false);
                }}
              >
                {/* TODO - Implement the content when the documentation website is ready. */}
                <div>TBD</div>
              </Drawer>
              <ActionMenu
                buttonProps={{ icon: <More />, size: 'large' }}
                title={t('application_details.more_options')}
              >
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  {t('application_details.options_delete')}
                </ActionMenuItem>
              </ActionMenu>
              <Modal
                isOpen={isDeleteFormOpen}
                className={modalStyles.content}
                overlayClassName={modalStyles.overlay}
              >
                <DeleteForm
                  id={data.id}
                  name={data.name}
                  onClose={() => {
                    setIsDeleteFormOpen(false);
                  }}
                />
              </Modal>
            </div>
          </Card>
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={`/applications/${data.id}/settings`}>
                {t('application_details.settings')}
              </TabNavItem>
              <TabNavItem href={`/applications/${data.id}/advanced-settings`}>
                {t('application_details.advanced_settings')}
              </TabNavItem>
            </TabNav>
            <FormProvider {...formMethods}>
              <form className={classNames(styles.form, detailsStyles.body)} onSubmit={onSubmit}>
                <div className={styles.fields}>
                  {isAdvancedSettings ? (
                    <AdvancedSettings oidcConfig={oidcConfig} />
                  ) : (
                    <Settings oidcConfig={oidcConfig} />
                  )}
                </div>
                <div className={detailsStyles.footer}>
                  <div className={detailsStyles.footerMain}>
                    <Button
                      isLoading={isSubmitting}
                      htmlType="submit"
                      type="primary"
                      size="large"
                      title="admin_console.application_details.save_changes"
                    />
                  </div>
                </div>
              </form>
            </FormProvider>
          </Card>
        </>
      )}
    </div>
  );
};

export default ApplicationDetails;
