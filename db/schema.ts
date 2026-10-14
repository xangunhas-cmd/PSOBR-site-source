import {sql} from 'drizzle-orm';
import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const transferRecords = sqliteTable('transfers', {
  id: text('id').primaryKey(),
  player: text('player').notNull(),
  position: text('position'),
  overall: integer('overall').notNull(),
  fromClub: text('from_club').notNull(),
  toClub: text('to_club').notNull(),
  occurredAt: text('occurred_at').notNull(),
  sourceUrl: text('source_url'),
  discordGuildId: text('discord_guild_id'),
  discordChannelId: text('discord_channel_id'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const newsRecords = sqliteTable('news', {
  id: text('id').primaryKey(),
  kind: text('kind', {enum:['titulo','comunicado']}).notNull(),
  label: text('label').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  publishedAt: text('published_at').notNull(),
  image: text('image'),
  href: text('href').notNull().default('/noticias'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
