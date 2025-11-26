import { relations } from 'drizzle-orm';
import { templateOutputImageFields } from './template-output-image-fields';
import { templateFields } from './template-fields';

export const templateOutputImageFieldsRelations = relations(templateOutputImageFields, (helpers) => ({ field: helpers.one(templateFields, { relationName: 'TemplateFieldToTemplateOutputImageField', fields: [ templateOutputImageFields.fieldId ], references: [ templateFields.id ] }), parentField: helpers.one(templateOutputImageFields, { relationName: 'child_field', fields: [ templateOutputImageFields.parentFieldId ], references: [ templateOutputImageFields.id ] }), children: helpers.many(templateOutputImageFields, { relationName: 'child_field' }) }));