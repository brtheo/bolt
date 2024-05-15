import { updateRecord, createRecord, deleteRecord} from 'lightning/uiRecordApi';
/**
 * @param {Constructor<any>} constructor 
 * @returns {Constructor<any>}
 */
export function useDML(constructor) {
  return class extends constructor {

    /**
     * @param {Array<RecordId>} ids 
     */
    async deleteRecords(ids) {
      await Promise.allSettled(ids.map(this.deleteRecord))
    }
    /**
     * @param {RecordId} id 
     */
    async deleteRecord(id) {
      await deleteRecord(id);
    }
    /**
     * 
     * @param {SObject} record 
     * @param {String} apiName 
     * @returns {Promise<SObject>}
     */
    async saveRecord(record, apiName) {
      return record.Id
        ? await updateRecord( {fields: record} )
        : await createRecord( {apiName, fields: record} )
    }
     /**
     * 
     * @param {SObject[]} records
     * @param {String} apiName 
     * @returns {Promise<SObject[]>}
     */
    async saveRecords(records, apiName) {
      return await Promise.allSettled(records.map(record => this.saveRecord(record, apiName)))   
    }
  }
}