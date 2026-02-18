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

import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import {
  CostRecord,
  CostSummary,
  CostByCategory,
  CostTrend,
  CostEntitySummary,
  Recommendation,
  TopSpender,
} from '@backstage/plugin-cost-optimization-common';

export class CostDataStore {
  constructor(private readonly db: Knex) {}

  async runMigrations(): Promise<void> {
    await this.db.schema.hasTable('cost_records').then(async exists => {
      if (!exists) {
        await this.db.schema.createTable('cost_records', table => {
          table.uuid('id').primary();
          table.string('provider').notNullable();
          table.string('service').notNullable();
          table.string('account').nullable();
          table.string('region').nullable();
          table.text('resource_tags').nullable();
          table.date('date').notNullable();
          table.decimal('amount', 14, 4).notNullable();
          table.string('currency', 3).notNullable().defaultTo('USD');
          table.timestamp('ingested_at').defaultTo(this.db.fn.now());
        });
      }
    });

    await this.db.schema.hasTable('cost_entity_mappings').then(async exists => {
      if (!exists) {
        await this.db.schema.createTable('cost_entity_mappings', table => {
          table.string('entity_ref').primary();
          table.string('provider').notNullable();
          table.text('match_criteria').nullable();
          table.timestamp('last_computed').defaultTo(this.db.fn.now());
        });
      }
    });

    await this.db.schema
      .hasTable('cost_recommendations')
      .then(async exists => {
        if (!exists) {
          await this.db.schema.createTable('cost_recommendations', table => {
            table.uuid('id').primary();
            table.string('provider').notNullable();
            table.string('entity_ref').nullable();
            table.string('type').notNullable();
            table.string('title').notNullable();
            table.text('description').nullable();
            table.decimal('estimated_savings', 14, 4).notNullable();
            table.string('currency', 3).notNullable().defaultTo('USD');
            table.text('metadata').nullable();
            table.timestamp('ingested_at').defaultTo(this.db.fn.now());
          });
        }
      });
  }

  async upsertRecords(records: CostRecord[]): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const rows = batch.map(record => ({
        id: uuid(),
        provider: record.provider,
        service: record.service,
        account: record.account ?? null,
        region: record.region ?? null,
        resource_tags: record.resourceTags
          ? JSON.stringify(record.resourceTags)
          : null,
        date: record.date,
        amount: record.amount,
        currency: record.currency,
        ingested_at: this.db.fn.now(),
      }));
      await this.db('cost_records').insert(rows);
    }
  }

  async clearRecordsForProvider(provider: string): Promise<void> {
    await this.db('cost_records').where('provider', provider).delete();
  }

  async upsertRecommendations(recommendations: Recommendation[]): Promise<void> {
    const rows = recommendations.map(rec => ({
      id: rec.id || uuid(),
      provider: rec.provider,
      entity_ref: rec.entityRef ?? null,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      estimated_savings: rec.estimatedMonthlySavings,
      currency: rec.currency,
      metadata: rec.metadata ? JSON.stringify(rec.metadata) : null,
      ingested_at: this.db.fn.now(),
    }));

    for (const row of rows) {
      await this.db('cost_recommendations').insert(row);
    }
  }

  async clearRecommendationsForProvider(provider: string): Promise<void> {
    await this.db('cost_recommendations').where('provider', provider).delete();
  }

  async getSummary(
    startDate: string,
    endDate: string,
  ): Promise<CostSummary> {
    const totalResult = await this.db('cost_records')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .sum('amount as total')
      .first();

    const byProvider = await this.db('cost_records')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .select('provider')
      .sum('amount as total')
      .groupBy('provider');

    const byService = await this.db('cost_records')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .select('service')
      .sum('amount as total')
      .groupBy('service')
      .orderBy('total', 'desc')
      .limit(20);

    const costByProvider: CostByCategory[] = byProvider.map(
      (row: { provider: string; total: number }) => ({
        category: row.provider,
        amount: Number(row.total) || 0,
        currency: 'USD',
      }),
    );

    const costByService: CostByCategory[] = byService.map(
      (row: { service: string; total: number }) => ({
        category: row.service,
        amount: Number(row.total) || 0,
        currency: 'USD',
      }),
    );

    return {
      totalCost: Number(totalResult?.total) || 0,
      currency: 'USD',
      periodStart: startDate,
      periodEnd: endDate,
      costByProvider,
      costByService,
    };
  }

  async getTrends(
    startDate: string,
    endDate: string,
    granularity: 'daily' | 'monthly',
  ): Promise<CostTrend[]> {
    let query = this.db('cost_records')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);

    if (granularity === 'daily') {
      query = query
        .select('date')
        .sum('amount as total')
        .groupBy('date')
        .orderBy('date', 'asc');
    } else {
      query = query
        .select(this.db.raw("strftime('%Y-%m', date) as date"))
        .sum('amount as total')
        .groupBy(this.db.raw("strftime('%Y-%m', date)"))
        .orderBy('date', 'asc');
    }

    const rows = await query;
    return rows.map((row: { date: string; total: number }) => ({
      date: row.date,
      amount: Number(row.total) || 0,
      currency: 'USD',
    }));
  }

  async getEntityCosts(
    entityRef: string,
    startDate: string,
    endDate: string,
  ): Promise<CostEntitySummary> {
    const mapping = await this.db('cost_entity_mappings')
      .where('entity_ref', entityRef)
      .first();

    if (!mapping) {
      return {
        entityRef,
        totalCost: 0,
        currency: 'USD',
        periodStart: startDate,
        periodEnd: endDate,
        costByProvider: [],
        costByService: [],
        trends: [],
      };
    }

    const matchCriteria = mapping.match_criteria
      ? JSON.parse(mapping.match_criteria)
      : {};

    let query = this.db('cost_records')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);

    if (matchCriteria.account) {
      query = query.where('account', matchCriteria.account);
    }
    if (matchCriteria.provider) {
      query = query.where('provider', matchCriteria.provider);
    }

    const records = await query;

    let totalCost = 0;
    const providerMap = new Map<string, number>();
    const serviceMap = new Map<string, number>();
    const trendMap = new Map<string, number>();

    for (const record of records) {
      const amount = Number(record.amount) || 0;
      totalCost += amount;
      providerMap.set(
        record.provider,
        (providerMap.get(record.provider) || 0) + amount,
      );
      serviceMap.set(
        record.service,
        (serviceMap.get(record.service) || 0) + amount,
      );
      trendMap.set(record.date, (trendMap.get(record.date) || 0) + amount);
    }

    return {
      entityRef,
      totalCost,
      currency: 'USD',
      periodStart: startDate,
      periodEnd: endDate,
      costByProvider: Array.from(providerMap.entries()).map(
        ([category, amount]) => ({
          category,
          amount,
          currency: 'USD',
        }),
      ),
      costByService: Array.from(serviceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([category, amount]) => ({
          category,
          amount,
          currency: 'USD',
        })),
      trends: Array.from(trendMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => ({
          date,
          amount,
          currency: 'USD',
        })),
    };
  }

  async getRecommendations(entityRef?: string): Promise<Recommendation[]> {
    let query = this.db('cost_recommendations');

    if (entityRef) {
      query = query.where('entity_ref', entityRef);
    }

    const rows = await query.orderBy('estimated_savings', 'desc').limit(50);

    return rows.map(
      (row: {
        id: string;
        provider: string;
        entity_ref: string | null;
        type: string;
        title: string;
        description: string | null;
        estimated_savings: number;
        currency: string;
        metadata: string | null;
      }) => ({
        id: row.id,
        provider: row.provider,
        entityRef: row.entity_ref ?? undefined,
        type: row.type as Recommendation['type'],
        title: row.title,
        description: row.description ?? '',
        estimatedMonthlySavings: Number(row.estimated_savings) || 0,
        currency: row.currency,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      }),
    );
  }

  async getTopSpenders(
    startDate: string,
    endDate: string,
    limit: number = 10,
  ): Promise<TopSpender[]> {
    const mappings = await this.db('cost_entity_mappings').select('*');

    const spenders: TopSpender[] = [];
    for (const mapping of mappings) {
      const matchCriteria = mapping.match_criteria
        ? JSON.parse(mapping.match_criteria)
        : {};

      let query = this.db('cost_records')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate);

      if (matchCriteria.account) {
        query = query.where('account', matchCriteria.account);
      }
      if (matchCriteria.provider) {
        query = query.where('provider', matchCriteria.provider);
      }

      const result = await query.sum('amount as total').first();
      const totalCost = Number(result?.total) || 0;

      if (totalCost > 0) {
        spenders.push({
          entityRef: mapping.entity_ref,
          entityName: mapping.entity_ref.split('/').pop() || mapping.entity_ref,
          totalCost,
          currency: 'USD',
          trend: 0,
        });
      }
    }

    return spenders.sort((a, b) => b.totalCost - a.totalCost).slice(0, limit);
  }

  async refreshEntityMappings(
    entities: Array<{
      entityRef: string;
      annotations: Record<string, string>;
    }>,
  ): Promise<void> {
    for (const entity of entities) {
      const { entityRef, annotations } = entity;

      const awsAccount =
        annotations['cost-optimization/aws-account'];
      const gcpProject =
        annotations['cost-optimization/gcp-project'];
      const azureSubscription =
        annotations['cost-optimization/azure-subscription'];

      if (awsAccount) {
        await this.db('cost_entity_mappings')
          .insert({
            entity_ref: entityRef,
            provider: 'aws',
            match_criteria: JSON.stringify({ account: awsAccount, provider: 'aws' }),
            last_computed: this.db.fn.now(),
          })
          .onConflict('entity_ref')
          .merge();
      } else if (gcpProject) {
        await this.db('cost_entity_mappings')
          .insert({
            entity_ref: entityRef,
            provider: 'gcp',
            match_criteria: JSON.stringify({
              account: gcpProject,
              provider: 'gcp',
            }),
            last_computed: this.db.fn.now(),
          })
          .onConflict('entity_ref')
          .merge();
      } else if (azureSubscription) {
        await this.db('cost_entity_mappings')
          .insert({
            entity_ref: entityRef,
            provider: 'azure',
            match_criteria: JSON.stringify({
              account: azureSubscription,
              provider: 'azure',
            }),
            last_computed: this.db.fn.now(),
          })
          .onConflict('entity_ref')
          .merge();
      }
    }
  }
}
