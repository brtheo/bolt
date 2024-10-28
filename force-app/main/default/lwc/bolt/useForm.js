import { 
  mix, 
  sanitizeApiName, 
  getStack, 
  createFieldsByObjectApiName, 
  isOfMultipleSObject,
  allMxnDone,
  boolPropsReducer 
} from "./utils";

/** @type {DataTypeToInputType} */
const dataTypeToInputType = {
  String: 'text',
  Double: 'number',
  Boolean: 'toggle',
  Currency: 'number',
  Phone: 'tel',
}

const getMaybeSuspendedMixins = (isOfMultipleSObject, isInsert) => [
  ['__SOBJECTS_MXN_DONE__','__RECORDS_FIELDS_MXN_DONE__'],
  ['__SOBJECT_MXN_DONE__','__RECORD_FIELDS_MXN_DONE__']
].toSpliced(+isOfMultipleSObject,1)[0].toSpliced(+isInsert, isInsert ? 1 : -1 )

const insertArg = (fields, isOfMultipleSObject) => Object({
  [isOfMultipleSObject ? 'SObjects' : 'SObject']: fields
});
const editArg = (fields, isOfMultipleSObject) => Object({
  [isOfMultipleSObject ? 'recordsFields' : 'recordFields']: fields,
  ...insertArg(fields, isOfMultipleSObject)
});


const $SObject = (self, fields, objectInfoName, objectApiName, mode) => Object.fromEntries(fields.map(({fieldApiName}) => {
  const {label, dataType, values} = self?.[objectInfoName]?.[fieldApiName];
  const value = self?.[objectApiName]?.[fieldApiName];
  return [
    fieldApiName, 
    {
      info: {
        label,
        type: dataTypeToInputType[dataType] ?? dataType.toLowerCase(),
        options: values
      },
      ref:'',
      value,
      fieldApiName,
      objectApiName,
      mode,
    },
  ]
}));

const singleSObjectForm = (fields, mode, mixed, maybeSuspendedMxn) => {
  const {objectApiName} = fields[0];
  const objectInfoName = `${sanitizeApiName(objectApiName)}info`;
  const inputObjectApiName = `$${objectApiName}`;

  const clazz = class extends mixed {
    get __FORM_MXN_DONE__() { return this[inputObjectApiName] !== undefined; }
  };
  Object.defineProperty(clazz.prototype, inputObjectApiName, {
    get() {
      return allMxnDone(this, maybeSuspendedMxn)
        ? $SObject(this, fields, objectInfoName, objectApiName, mode)
        : undefined
    }
  })
  return clazz;
}
const multipleSObjectForm = (fields, mode, mixed, maybeSuspendedMxn) => { 
  const fieldsByObjectApiName = createFieldsByObjectApiName(fields);
  const objectApiNames = Object.keys(fieldsByObjectApiName);
  const objectInfoNames = Object.fromEntries(objectApiNames.map(name => [name, `${sanitizeApiName(name)}info`]));
  const inputObjectApiNames = Object.fromEntries(objectApiNames.map(name => [name, `$${name}`]));
  const clazz = class extends mixed {
    get __FORM_MXN_DONE__() { return Object.values(inputObjectApiNames).reduce(...boolPropsReducer(this)); }
  };
  objectApiNames.forEach(name => {
    Object.defineProperty(clazz.prototype, inputObjectApiNames[name], {
      get() {
        return allMxnDone(this, maybeSuspendedMxn)
          ? $SObject(this, fieldsByObjectApiName[name], objectInfoNames[name], name, mode)
          : undefined
      }
    })
  })
  return clazz;
}

function mergeSupportiveFields(isOfMultipleSObject, fields, supportiveFields) {
  return isOfMultipleSObject
    ? fields.map((_fields,i) => _fields.concat(supportiveFields[i]))
    : fields.concat(supportiveFields)
}

/**
 * @param {Constructor<any>} constructor 
 * @param {Field[] | Field[][]} fields 
 * @param {FormMode} mode 
 * @returns 
 */
export const useForm = (constructor, fields, mode = 'edit', supportiveFields) => {
  if(supportiveFields?.at(0) instanceof Object) {
    supportiveFields =  supportiveFields.map(({fieldApiName}) => fieldApiName)
  }
  
  const _isOfMultipleSObject = isOfMultipleSObject(fields);
  const mixed = mix(
    ...getStack({
      'insert': insertArg(mergeSupportiveFields(
        _isOfMultipleSObject, 
        fields, 
        supportiveFields
      ), _isOfMultipleSObject),
      'edit': editArg(mergeSupportiveFields(
        _isOfMultipleSObject, 
        fields, 
        supportiveFields
      ), _isOfMultipleSObject)
    }[mode]),
    constructor
  );
  const maybeSuspendedMxn = getMaybeSuspendedMixins(_isOfMultipleSObject, mode === 'insert');
  return [
    singleSObjectForm,
    multipleSObjectForm
  ][+_isOfMultipleSObject](fields, mode, mixed, maybeSuspendedMxn)
}