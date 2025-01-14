import { Resource } from '@logto/schemas';
import classNames from 'classnames';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import apiResourceIcon from '@/assets/images/api-resource.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import { RequestError } from '@/hooks/use-api';
import Plus from '@/icons/Plus';
import * as modalStyles from '@/scss/modal.module.scss';
import * as tableStyles from '@/scss/table.module.scss';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const buildDetailsLink = (id: string) => `/api-resources/${id}`;

const pageSize = 20;

const ApiResources = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
  const pageIndex = Number(query.get('page') ?? '1');
  const { data, error, mutate } = useSWR<[Resource[], number], RequestError>(
    `/api/resources?page=${pageIndex}&page_size=${pageSize}`
  );
  const isLoading = !data && !error;
  const navigate = useNavigate();
  const [apiResources, totalCount] = data ?? [];

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="api_resources.title" subtitle="api_resources.subtitle" />
        <Button
          title="admin_console.api_resources.create"
          type="primary"
          icon={<Plus />}
          onClick={() => {
            setIsCreateFormOpen(true);
          }}
        />
        <Modal
          isOpen={isCreateFormOpen}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
        >
          <CreateForm
            onClose={(createdApiResource) => {
              setIsCreateFormOpen(false);

              if (createdApiResource) {
                toast.success(
                  t('api_resources.api_resource_created', { name: createdApiResource.name })
                );
                navigate(buildDetailsLink(createdApiResource.id));
              }
            }}
          />
        </Modal>
      </div>
      <div className={classNames(styles.table, tableStyles.scrollable)}>
        <table>
          <colgroup>
            <col className={styles.apiResourceName} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>{t('api_resources.api_name')}</th>
              <th>{t('api_resources.api_identifier')}</th>
            </tr>
          </thead>
          <tbody>
            {!data && error && (
              <TableError
                columns={2}
                content={error.body?.message ?? error.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {isLoading && <TableLoading columns={2} />}
            {apiResources?.length === 0 && (
              <TableEmpty columns={2}>
                <Button
                  title="admin_console.api_resources.create"
                  type="outline"
                  onClick={() => {
                    setIsCreateFormOpen(true);
                  }}
                />
              </TableEmpty>
            )}
            {apiResources?.map(({ id, name, indicator }) => (
              <tr
                key={id}
                className={tableStyles.clickable}
                onClick={() => {
                  navigate(buildDetailsLink(id));
                }}
              >
                <td>
                  <ItemPreview
                    title={name}
                    icon={<img src={apiResourceIcon} />}
                    to={buildDetailsLink(id)}
                  />
                </td>
                <td>
                  <CopyToClipboard value={indicator} variant="text" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        {!!totalCount && (
          <Pagination
            pageCount={Math.ceil(totalCount / pageSize)}
            pageIndex={pageIndex}
            onChange={(page) => {
              setQuery({ page: String(page) });
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default ApiResources;
