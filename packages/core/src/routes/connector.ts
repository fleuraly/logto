import { ConnectorDTO, Connectors, ConnectorType } from '@logto/schemas';
import { emailRegEx, phoneRegEx } from '@logto/shared';
import { object, string } from 'zod';

import { getConnectorInstances, getConnectorInstanceById } from '@/connectors';
import {
  ConnectorInstance,
  EmailConnectorInstance,
  SmsConnectorInstance,
} from '@/connectors/types';
import RequestError from '@/errors/RequestError';
import koaGuard from '@/middleware/koa-guard';
import { updateConnector } from '@/queries/connector';
import assertThat from '@/utils/assert-that';

import { AuthedRouter } from './types';

const transpileConnectorInstance = ({ connector, metadata }: ConnectorInstance): ConnectorDTO => ({
  ...connector,
  ...metadata,
});

export default function connectorRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/connectors',
    koaGuard({
      query: object({
        target: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { target: filterTarget } = ctx.query;
      const connectorInstances = await getConnectorInstances();

      assertThat(
        connectorInstances.filter(
          (connector) =>
            connector.connector.enabled && connector.metadata.type === ConnectorType.Email
        ).length <= 1,
        'connector.more_than_one_email'
      );
      assertThat(
        connectorInstances.filter(
          (connector) =>
            connector.connector.enabled && connector.metadata.type === ConnectorType.SMS
        ).length <= 1,
        'connector.more_than_one_sms'
      );

      const filteredInstances = filterTarget
        ? connectorInstances.filter(({ metadata: { target } }) => target === filterTarget)
        : connectorInstances;

      ctx.body = filteredInstances.map((connectorInstance) =>
        transpileConnectorInstance(connectorInstance)
      );

      return next();
    }
  );

  router.get(
    '/connectors/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const connectorInstance = await getConnectorInstanceById(id);
      ctx.body = transpileConnectorInstance(connectorInstance);

      return next();
    }
  );

  router.patch(
    '/connectors/:id/enabled',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard.pick({ enabled: true }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { enabled },
      } = ctx.guard;
      const {
        connector: { config },
        metadata,
        validateConfig,
      } = await getConnectorInstanceById(id);

      if (enabled) {
        await validateConfig(config);
      }

      // Only allow one enabled connector for SMS and Email.
      // disable other connectors before enable this one.
      if (
        enabled &&
        (metadata.type === ConnectorType.SMS || metadata.type === ConnectorType.Email)
      ) {
        const connectors = await getConnectorInstances();
        await Promise.all(
          connectors
            .filter(
              (connector) =>
                connector.metadata.type === metadata.type && connector.connector.enabled
            )
            .map(async ({ connector: { id } }) =>
              updateConnector({ set: { enabled: false }, where: { id } })
            )
        );
      }

      const connector = await updateConnector({ set: { enabled }, where: { id } });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );

  router.patch(
    '/connectors/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Connectors.createGuard.omit({ id: true, enabled: true, createdAt: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;
      const { metadata, validateConfig } = await getConnectorInstanceById(id);

      if (body.config) {
        await validateConfig(body.config);
      }

      const connector = await updateConnector({ set: body, where: { id } });
      ctx.body = { ...connector, metadata };

      return next();
    }
  );

  router.post(
    '/connectors/test/email',
    koaGuard({
      body: object({
        email: string().regex(emailRegEx),
      }),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.body;

      const connectorInstances = await getConnectorInstances();
      const connector = connectorInstances.find(
        (connector): connector is EmailConnectorInstance =>
          connector.connector.enabled && connector.metadata.type === ConnectorType.Email
      );

      assertThat(
        connector,
        new RequestError({ code: 'connector.not_found', type: ConnectorType.Email })
      );

      await connector.sendMessage(email, 'Test', {
        code: 'email-test',
      });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/connectors/test/sms',
    koaGuard({
      body: object({
        phone: string().regex(phoneRegEx),
      }),
    }),
    async (ctx, next) => {
      const { phone } = ctx.guard.body;

      const connectorInstances = await getConnectorInstances();
      const connector = connectorInstances.find(
        (connector): connector is SmsConnectorInstance =>
          connector.connector.enabled && connector.metadata.type === ConnectorType.SMS
      );

      assertThat(
        connector,
        new RequestError({ code: 'connector.not_found', type: ConnectorType.SMS })
      );

      await connector.sendMessage(phone, 'Test', {
        code: '123456',
      });

      ctx.status = 204;

      return next();
    }
  );
}
