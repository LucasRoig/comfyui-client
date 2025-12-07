import { relations } from 'drizzle-orm';
import { outputFieldValues } from './output-field-values';
import { outputImages } from './output-images';
import { templateOutputImageFields } from './template-output-image-fields';
import { inputImages } from './input-images';

export const outputFieldValuesRelations = relations(outputFieldValues, (helpers) => ({ outputImage: helpers.one(outputImages, { relationName: 'OutputFieldValueToOutputImage', fields: [ outputFieldValues.outputImageId ], references: [ outputImages.id ] }), templatefield: helpers.one(templateOutputImageFields, { relationName: 'OutputFieldValueToTemplateOutputImageField', fields: [ outputFieldValues.templateFieldId ], references: [ templateOutputImageFields.id ] }), inputImage: helpers.one(inputImages, { relationName: 'InputImageToOutputFieldValue', fields: [ outputFieldValues.inputImageId ], references: [ inputImages.id ] }) }));