import { relations } from 'drizzle-orm';
import { templateStringFields } from './template-string-fields';
import { templateFields } from './template-fields';
import { stringFieldValues } from './string-field-values';

export const templateStringFieldsRelations = relations(templateStringFields, (helpers) => ({ field: helpers.one(templateFields, { relationName: 'TemplateFieldToTemplateStringField', fields: [ templateStringFields.fieldId ], references: [ templateFields.id ] }), parentField: helpers.one(templateStringFields, { relationName: 'child_field', fields: [ templateStringFields.parentFieldId ], references: [ templateStringFields.id ] }), children: helpers.many(templateStringFields, { relationName: 'child_field' }), stringFieldValues: helpers.many(stringFieldValues, { relationName: 'StringFieldValueToTemplateStringField' }) }));