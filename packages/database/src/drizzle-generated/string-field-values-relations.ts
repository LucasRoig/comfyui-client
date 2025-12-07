import { relations } from 'drizzle-orm';
import { stringFieldValues } from './string-field-values';
import { templateStringFields } from './template-string-fields';
import { inputImages } from './input-images';

export const stringFieldValuesRelations = relations(stringFieldValues, (helpers) => ({ templatefield: helpers.one(templateStringFields, { relationName: 'StringFieldValueToTemplateStringField', fields: [ stringFieldValues.templateFieldId ], references: [ templateStringFields.id ] }), inputImage: helpers.one(inputImages, { relationName: 'InputImageToStringFieldValue', fields: [ stringFieldValues.inputImageId ], references: [ inputImages.id ] }) }));