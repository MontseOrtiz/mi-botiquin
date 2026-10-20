import Dexie from 'dexie';

export class MedicineDatabase extends Dexie {
  constructor() {
    super('mi-botiquin');
    this.version(1).stores({ medicines: '&id' });
  }
}

export const database = new MedicineDatabase();
