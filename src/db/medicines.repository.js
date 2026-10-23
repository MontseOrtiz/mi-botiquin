import { database } from './database.js';

const table = database.medicines;

export const medicinesRepository = {
  list() {
    return table.toArray();
  },
};
