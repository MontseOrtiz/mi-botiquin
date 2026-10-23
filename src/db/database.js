import Dexie from 'dexie';

export class MedicineDatabase extends Dexie {
  constructor() {
    super('mi-botiquin');
    this.version(1).stores({ medicines: '&id' });
    this.version(2).stores({ medicines: '&id', authStorage: '&key' });
    this.version(3).stores({ medicines: '&id', authStorage: null, sourceSnapshots: '&source' });
  }
}

export const database = new MedicineDatabase();
