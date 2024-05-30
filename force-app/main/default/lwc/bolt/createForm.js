import { 
  BoltElement, 
  mix, 
  useDML, 
  useForm,
  useFormValidation,
  useSuspense
} from "./bolt";
import { getStack } from "./utils";
import _untilTemplate from './untilTemplate.html';
/**
 * 
 * @param {{fields: Field[] | Field[][], template: Function, untilTemplate?: Function, mode?: FormMode}} params 
 * @param {any} args 
 * @returns {Constructor<any>}
 */
export const createForm = ( {
  fields,
  template, 
  untilTemplate, 
  mode
},  args) => mix(
  ...getStack(args),
  [useForm, fields, mode ?? 'edit'],
  [useDML],
  [useFormValidation],
  [useSuspense, {template, untilTemplate: untilTemplate ?? _untilTemplate}],
  BoltElement
);