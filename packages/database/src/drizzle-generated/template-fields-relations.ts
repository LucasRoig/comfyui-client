import { relations } from 'drizzle-orm';
import { templateFields } from './template-fields';
import { templates } from './templates';
import { templateStringFields } from './template-string-fields';
import { templateInputImageFields } from './template-input-image-fields';
import { templateOutputImageFields } from './template-output-image-fields';

export const templateFieldsRelations = relations(templateFields, (helpers) => ({ template: helpers.one(templates, { relationName: 'TemplateToTemplateField', fields: [ templateFields.templateId ], references: [ templates.id ] }), stringField: helpers.one(templateStringFields), templateInputImageFields: helpers.one(templateInputImageFields), templateOutputImageField: helpers.one(templateOutputImageFields) }));