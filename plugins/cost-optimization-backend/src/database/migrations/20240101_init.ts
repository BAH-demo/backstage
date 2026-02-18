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

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cost_records', table => {
    table.uuid('id').primary();
    table.string('provider').notNullable();
    table.string('service').notNullable();
    table.string('account').nullable();
    table.string('region').nullable();
    table.text('resource_tags').nullable();
    table.date('date').notNullable();
    table.decimal('amount', 14, 4).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.timestamp('ingested_at').defaultTo(knex.fn.now());
    table.index(['provider', 'date']);
    table.index(['date']);
  });

  await knex.schema.createTable('cost_entity_mappings', table => {
    table.string('entity_ref').primary();
    table.string('provider').notNullable();
    table.text('match_criteria').nullable();
    table.timestamp('last_computed').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('cost_recommendations', table => {
    table.uuid('id').primary();
    table.string('provider').notNullable();
    table.string('entity_ref').nullable();
    table.string('type').notNullable();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.decimal('estimated_savings', 14, 4).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.text('metadata').nullable();
    table.timestamp('ingested_at').defaultTo(knex.fn.now());
    table.index(['entity_ref']);
    table.index(['provider']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cost_recommendations');
  await knex.schema.dropTableIfExists('cost_entity_mappings');
  await knex.schema.dropTableIfExists('cost_records');
}
