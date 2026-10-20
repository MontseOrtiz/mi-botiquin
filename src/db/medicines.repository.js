import { database } from './database.js';

const table = database.medicines;

export const medicinesRepository = {
  list() {
    return table.toArray();
  },

  getById(id) {
    return table.get(id);
  },

  create(medicine) {
    return table.add(medicine);
  },

  async updateWith(id, transform) {
    return database.transaction('rw', table, async () => {
      const current = await table.get(id);
      if (!current) return undefined;
      const updated = transform(current);
      await table.put(updated);
      return updated;
    });
  },

  remove(id) {
    return table.delete(id);
  },
};
