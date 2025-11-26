import { relations } from 'drizzle-orm';
import { templateInputImageFields } from './template-input-image-fields';
import { templateFields } from './template-fields';

export const templateInputImageFieldsRelations = relations(templateInputImageFields, (helpers) => ({ field: helpers.one(templateFields, { relationName: 'TemplateFieldToTemplateInputImageField', fields: [ templateInputImageFields.fieldId ], references: [ templateFields.id ] }), parentField: helpers.one(templateInputImageFields, { relationName: 'child_field', fields: [ templateInputImageFields.parentFieldId ], references: [ templateInputImageFields.id ] }), children: helpers.many(templateInputImageFields, { relationName: 'child_field' }) }));