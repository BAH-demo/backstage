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
