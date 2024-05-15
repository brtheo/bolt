import { getObjectInfo, getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";
import { wire, track } from 'lwc';
import { pick } from "./utils";
import { trace, sanitizeApiName } from './utils';
const MXN_NAME = 'useSObject';

/**
 * Provides two property on the class : {<SOBjectName>__ref, <SObjectName__info>}
 * <SOBjectName>__ref is useful if you want to build a form to create a record of that type as it gives you
 * an object initialized with all keys corresponding to what you've provided in the fields argument and each value initialized
 * as an empty string.
 * <SOBjectName>__info is useful to quickly access SObject related info such as fields label, picklist values, recordtype infos etc
 * @example <caption>Basic usage</caption>
 * // Javascript
 * import {LightningElement} from 'lwc';
 * import {useSObject, mix} from 'c/bolt';
 * const Composed = mix(
 *   [useSObject, fields],
 *   LightningElement
 * );
 * export class MyComponent extends Composed {...}
 * // HTML
 * <lightning-combobox
 *   data-bind="SomeObject__ref.somePicklist__c"
 *   value={SomeObject__ref.somePicklist__c}
 *   label={SomeObject__info.somePicklist__c.label}
 *   options={SomeObject__info.somePicklist__c.values}
 *   onchange={bind}>
 * </lightning-combobox>
 */
/**
 * @param {Constructor<any>} genericConstructor 
 * @param {Field[]} _fields
 * @param {string} recordTypeId
 * @returns {Constructor<any>}
 */
export function useSObject(genericConstructor, _fields, recordTypeId = 'default') {
  const {objectApiName} = _fields[0];
  const objectRefName = `${sanitizeApiName(objectApiName)}ref`;
  const objectInfoName = `${sanitizeApiName(objectApiName)}info`;

  const clazz = class extends genericConstructor {

    @track __SOBJECT_MXN_INFO_RESULT__;
    @track __SOBJECT_MXN_SOBJECT_REF__;
    @track __SOBJECT_MXN_RTYPE_ID__;
    @track __SOBJECT_MXN_PICKVAL_LOADED__ = false;
    __SOBJECT_MXN_PICKLIST_FIELDS__ = [];
    __SOBJECT_MXN_IS_REF_INIT__ = false;
    __SOBJECT_MXN_SOBJECT_REF_API_NAME__ = objectApiName;
    __SOBJECT_MXN_SOBJECT_REF_NAME__ = objectRefName;
    __SOBJECT_MXN_SOBJECT_INFO_NAME__ = objectInfoName; 

    get __SOBJECT_MXN_DONE__() { return this[objectInfoName] !== undefined;}

    @wire(getObjectInfo, {objectApiName})
    __SOBJECT_MXN_INFO_WIRED__({data, error}) {
      if(data) {
        const {fields, defaultRecordTypeId} = data;
        /** Make a filtered object containing only the fields passed as arguments */
        const filteredFields = Object.fromEntries(Object.keys(fields)
        .filter(fieldApiName => 
          _fields.map(_field =>
             _field.fieldApiName).includes(fieldApiName)
        ).map(fieldApiName => {
          /**
           * Keeping track of the picklist type fields
           * Useful for the getPicklistValuesByRecordType wire method
           */
          if(fields[fieldApiName].dataType === 'Picklist')
            this.__SOBJECT_MXN_PICKLIST_FIELDS__.push(fieldApiName);
          return [fieldApiName, fields[fieldApiName]]
        }));

        this.__SOBJECT_MXN_RTYPE_ID__ = recordTypeId === 'default'
          ? defaultRecordTypeId
          : recordTypeId;
        
        this.__SOBJECT_MXN_INFO_RESULT__ = {
          ...filteredFields,
          defaultRecordTypeId,
          legacy: data
        };
      }
      if(error) trace(`${MXN_NAME}::getObjectInfo`, error)
    }

    @wire(getPicklistValuesByRecordType, {
      objectApiName, 
      recordTypeId: '$__SOBJECT_MXN_RTYPE_ID__'
    })
    __SOBJECT_MXN_PICKLIST_WIRED__({data, error}) {
      if(data) { 
        /**
         * Make filtered list of picklist fields present in the requested fields
         * if the length of retrieved picklistFieldValues is different from the length 
         * of the class prop that keep track of picklist fields
         */
        const filteredPicklistResults = 
          (Object.keys(data.picklistFieldValues).length !== this.__SOBJECT_MXN_PICKLIST_FIELDS__.length)
            ? Object.fromEntries(Object.keys(data.picklistFieldValues)
              .filter(apiName => 
                this.__SOBJECT_MXN_PICKLIST_FIELDS__.includes(apiName)
              ).map(apiName => [apiName, data.picklistFieldValues[apiName]] )
            ) : data.picklistFieldValues;
        /**
         * Attach the fields {defaultValue, controllerValue, values} from the
         * getPicklistValue() wire to the SObjectApi__info Object
         */  
        Object.keys(this.__SOBJECT_MXN_INFO_RESULT__).forEach(field => {
          if(Object.keys(filteredPicklistResults).includes(field)) {
            const {
              defaultValue, 
              controllerValue,
              values } = filteredPicklistResults[field];
            this.__SOBJECT_MXN_INFO_RESULT__[field] = {
              ...this.__SOBJECT_MXN_INFO_RESULT__[field],
              defaultValue,
              controllerValue,
              values: values.map(({value, label}) => new Object({ value, label}))
            }
          }
        });
        this.__SOBJECT_MXN_PICKVAL_LOADED__ = true;
      }
      if(error) trace(`${MXN_NAME}::getPicklistValuesByRecordType`, error);
    }

  }

  Object.defineProperty(clazz.prototype, objectRefName, {
    get() { 
      return this.__SOBJECT_MXN_SOBJECT_REF__ 
        ?? Object.fromEntries(_fields.map(field => [field.fieldApiName,''])); 
    },
    set(value) { this.__SOBJECT_MXN_SOBJECT_REF__ = value; }
  });
  Object.defineProperty(clazz.prototype, objectInfoName, {
    get() { 
      return this.__SOBJECT_MXN_PICKVAL_LOADED__ 
        ? this.__SOBJECT_MXN_INFO_RESULT__
        : undefined; 
    }
  });
  return clazz;
}