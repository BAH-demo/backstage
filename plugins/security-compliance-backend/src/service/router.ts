/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { getSecurityComplianceData } from './mockData';

export interface RouterOptions {
  logger: LoggerService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/entity/:namespace/:kind/:name', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`;
    logger.info(`Fetching security compliance data for ${entityRef}`);
    const data = getSecurityComplianceData(entityRef);
    res.json(data);
  });

  router.get('/entity/:namespace/:kind/:name/vulnerabilities', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`;
    const data = getSecurityComplianceData(entityRef);
    res.json(data.vulnerabilitySummary);
  });

  router.get('/entity/:namespace/:kind/:name/stig', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`;
    const data = getSecurityComplianceData(entityRef);
    res.json(data.stigControls);
  });

  router.get('/entity/:namespace/:kind/:name/cves', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`;
    const data = getSecurityComplianceData(entityRef);
    res.json(data.cves);
  });

  router.get('/entity/:namespace/:kind/:name/change-requests', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`;
    const data = getSecurityComplianceData(entityRef);
    res.json(data.changeRequests);
  });

  return router;
}
