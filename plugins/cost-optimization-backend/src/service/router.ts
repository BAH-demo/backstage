/*
 * Copyright 2024 The Backstage Authors
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

import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { CostDataStore } from './CostDataStore';
import { DateTime } from 'luxon';

export interface RouterOptions {
  logger: LoggerService;
  costDataStore: CostDataStore;
  httpAuth: HttpAuthService;
}

function defaultStartDate(): string {
  return DateTime.now().minus({ days: 30 }).toISODate()!;
}

function defaultEndDate(): string {
  return DateTime.now().toISODate()!;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, costDataStore } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('Health check requested');
    response.json({ status: 'ok' });
  });

  router.get('/costs/summary', async (req, res) => {
    const startDate =
      (req.query.startDate as string) || defaultStartDate();
    const endDate = (req.query.endDate as string) || defaultEndDate();

    const summary = await costDataStore.getSummary(startDate, endDate);
    res.json(summary);
  });

  router.get('/costs/trends', async (req, res) => {
    const startDate =
      (req.query.startDate as string) || defaultStartDate();
    const endDate = (req.query.endDate as string) || defaultEndDate();
    const granularity =
      (req.query.granularity as 'daily' | 'monthly') || 'daily';

    const trends = await costDataStore.getTrends(
      startDate,
      endDate,
      granularity,
    );
    res.json(trends);
  });

  router.get('/costs/entity/:namespace/:kind/:name', async (req, res) => {
    const { namespace, kind, name } = req.params;
    const entityRef = `${kind}:${namespace}/${name}`.toLowerCase();
    const startDate =
      (req.query.startDate as string) || defaultStartDate();
    const endDate = (req.query.endDate as string) || defaultEndDate();

    const entityCosts = await costDataStore.getEntityCosts(
      entityRef,
      startDate,
      endDate,
    );
    res.json(entityCosts);
  });

  router.get(
    '/costs/entity/:namespace/:kind/:name/recommendations',
    async (req, res) => {
      const { namespace, kind, name } = req.params;
      const entityRef = `${kind}:${namespace}/${name}`.toLowerCase();

      const recommendations =
        await costDataStore.getRecommendations(entityRef);
      res.json(recommendations);
    },
  );

  router.get('/costs/top-spenders', async (req, res) => {
    const startDate =
      (req.query.startDate as string) || defaultStartDate();
    const endDate = (req.query.endDate as string) || defaultEndDate();
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const spenders = await costDataStore.getTopSpenders(
      startDate,
      endDate,
      limit,
    );
    res.json(spenders);
  });

  router.get('/costs/recommendations', async (_req, res) => {
    const recommendations = await costDataStore.getRecommendations();
    res.json(recommendations);
  });

  return router;
}
