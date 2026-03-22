import { describe, expect, it } from 'vitest';

import { summarizeCollectionSchema } from '@/lib/main/mongo-schema-summary';

describe('summarizeCollectionSchema', () => {
  it('builds field paths, types, presence rate, and compact examples', () => {
    const summary = summarizeCollectionSchema([
      {
        _id: { $oid: '507f1f77bcf86cd799439011' },
        status: 'active',
        profile: { city: 'Bengaluru', plan: 'pro' },
        tags: ['pro', 'vip'],
      },
      {
        _id: { $oid: '507f191e810c19729de860ea' },
        status: 'pending',
        profile: { city: 'Mumbai' },
        score: 42,
      },
    ]);

    expect(summary.sampleSize).toBe(2);
    expect(summary.fields.find((field) => field.path === 'status')).toMatchObject({
      types: ['string'],
      presenceRate: 1,
      exampleValues: ['active', 'pending'],
    });
    expect(summary.fields.find((field) => field.path === 'profile.city')).toMatchObject({
      types: ['string'],
      presenceRate: 1,
      exampleValues: ['Bengaluru', 'Mumbai'],
    });
    expect(summary.fields.find((field) => field.path === 'profile.plan')).toMatchObject({
      types: ['string'],
      presenceRate: 0.5,
    });
    expect(summary.fields.find((field) => field.path === 'tags')).toMatchObject({
      types: ['array'],
      exampleValues: ['[2 items]'],
    });
    expect(summary.fields.find((field) => field.path === '_id')).toMatchObject({
      types: ['objectId'],
    });
  });
});
