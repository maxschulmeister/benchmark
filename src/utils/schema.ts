import type { JSONSchema7Definition } from 'json-schema';
import type { OpenAPIV3 } from 'openapi-types';

function isEmptyObjectSchema(jsonSchema: JSONSchema7Definition): boolean {
  return (
    jsonSchema != null &&
    typeof jsonSchema === 'object' &&
    jsonSchema.type === 'object' &&
    (jsonSchema.properties == null || Object.keys(jsonSchema.properties).length === 0)
  );
}

/**
 * Converts JSON Schema 7 to OpenAPI Schema 3.0
 */
export function jsonSchemaToOpenAPISchema(jsonSchema: JSONSchema7Definition): unknown {
  // parameters need to be undefined if they are empty objects:
  if (isEmptyObjectSchema(jsonSchema)) {
    return undefined;
  }

  if (typeof jsonSchema === 'boolean') {
    return { type: 'boolean', properties: {} };
  }

  const {
    type,
    description,
    required,
    properties,
    items,
    allOf,
    anyOf,
    oneOf,
    format,
    const: constValue,
    minLength,
    enum: enumValues,
  } = jsonSchema;

  const result: Record<string, unknown> = {};

  // Remove 'format' and append to description if present
  let newDescription = description || '';
  if (format) {
    newDescription = newDescription
      ? `${newDescription} format: ${format}`
      : `format: ${format}`;
  }
  if (newDescription) result.description = newDescription;
  if (required) result.required = required;
  // Do NOT add result.format

  if (constValue !== undefined) {
    result.enum = [constValue];
  }

  // Handle type
  if (type) {
    if (Array.isArray(type)) {
      if (type.includes('null')) {
        result.type = type.filter((t) => t !== 'null')[0];
        result.nullable = true;
      } else {
        result.type = type;
      }
    } else if (type === 'null') {
      result.type = 'null';
    } else {
      result.type = type;
    }
  }

  // Handle enum
  if (enumValues !== undefined) {
    result.enum = enumValues;
  }

  if (properties != null) {
    result.properties = Object.entries(properties).reduce(
      (acc, [key, value]) => {
        acc[key] = jsonSchemaToOpenAPISchema(value);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  if (items) {
    result.items = Array.isArray(items)
      ? items.map(jsonSchemaToOpenAPISchema)
      : jsonSchemaToOpenAPISchema(items);
  }

  if (allOf) {
    result.allOf = allOf.map(jsonSchemaToOpenAPISchema);
  }
  if (anyOf) {
    // Handle cases where anyOf includes a null type
    if (anyOf.some((schema) => typeof schema === 'object' && schema?.type === 'null')) {
      const nonNullSchemas = anyOf.filter(
        (schema) => !(typeof schema === 'object' && schema?.type === 'null'),
      );

      if (nonNullSchemas.length === 1) {
        // If there's only one non-null schema, convert it and make it nullable
        const converted = jsonSchemaToOpenAPISchema(nonNullSchemas[0]);
        if (typeof converted === 'object') {
          result.nullable = true;
          Object.assign(result, converted);
        }
      } else {
        // If there are multiple non-null schemas, keep them in anyOf
        result.anyOf = nonNullSchemas.map(jsonSchemaToOpenAPISchema);
        result.nullable = true;
      }
    } else {
      result.anyOf = anyOf.map(jsonSchemaToOpenAPISchema);
    }
  }
  if (oneOf) {
    result.oneOf = oneOf.map(jsonSchemaToOpenAPISchema);
  }

  if (minLength !== undefined) {
    result.minLength = minLength;
  }

  return result;
}

/**
 * Converts JSON Schema 7 to a OpenAI strict schema.
 */

export function jsonSchemaToOpenAISchema(
  schema: JSONSchema7Definition,
): JSONSchema7Definition {
  if (typeof schema !== 'object' || schema === null) return schema;
  if (typeof schema === 'boolean') return schema;

  // List of supported fields for OpenAI strict schema
  const supportedFields = new Set([
    'type',
    'description',
    'required',
    'properties',
    'items',
    'allOf',
    'anyOf',
    'oneOf',
    'enum',
    'const',
    'minLength',
    'nullable',
    'additionalProperties',
    'patternProperties',
    'definitions',
    '$defs',
    'dependencies',
    'dependentSchemas',
    'not',
    'if',
    'then',
    'else',
    'contains',
    'propertyNames',
  ]);

  // Separate supported and unsupported fields
  const supported: Record<string, any> = {};
  let description = schema.description || '';
  for (const key of Object.keys(schema)) {
    if (supportedFields.has(key)) {
      supported[key] = (schema as any)[key];
    } else {
      // Append unsupported field to description
      const value = (schema as any)[key];
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      description = description
        ? `${description} ${key}: ${valueStr}`
        : `${key}: ${valueStr}`;
    }
  }
  if (description) {
    supported.description = description;
  }

  // Helper to process sub-schemas
  const process = (sub: any) => jsonSchemaToOpenAISchema(sub);

  // Handle arrays
  if (supported.type === 'array' && supported.items) {
    return {
      ...supported,
      items: Array.isArray(supported.items)
        ? supported.items.map(process)
        : process(supported.items),
    };
  }

  // Handle objects strictly
  if (supported.type === 'object') {
    // Recursively process properties
    const properties = supported.properties || {};
    const processedProperties = Object.fromEntries(
      Object.entries(properties).map(([k, v]) => [k, process(v)]),
    );
    const propertyKeys = Object.keys(processedProperties);
    // Always set required to all property keys
    // If properties is empty, required should be an empty array
    return {
      ...supported,
      properties: processedProperties,
      required: propertyKeys,
      additionalProperties: false,
      // Recursively process patternProperties if present
      ...(supported.patternProperties && {
        patternProperties: Object.fromEntries(
          Object.entries(supported.patternProperties).map(([k, v]) => [k, process(v)]),
        ),
      }),
    };
  }

  // Handle combinators and other schema keywords
  const combinators = [
    'allOf',
    'anyOf',
    'oneOf',
    'not',
    'if',
    'then',
    'else',
    'contains',
    'propertyNames',
  ];
  let result = { ...supported };
  for (const key of combinators) {
    if (supported[key]) {
      if (Array.isArray(supported[key])) {
        result[key] = supported[key].map(process);
      } else {
        result[key] = process(supported[key]);
      }
    }
  }

  // Handle definitions, $defs, dependencies, dependentSchemas
  if (supported.definitions) {
    result.definitions = Object.fromEntries(
      Object.entries(supported.definitions).map(([k, v]) => [k, process(v)]),
    );
  }
  if (supported.$defs) {
    result.$defs = Object.fromEntries(
      Object.entries(supported.$defs).map(([k, v]) => [k, process(v)]),
    );
  }
  if (supported.dependencies) {
    result.dependencies = Object.fromEntries(
      Object.entries(supported.dependencies).map(([k, v]) => [
        k,
        Array.isArray(v) ? v : process(v),
      ]),
    );
  }
  if (supported.dependentSchemas) {
    result.dependentSchemas = Object.fromEntries(
      Object.entries(supported.dependentSchemas).map(([k, v]) => [k, process(v)]),
    );
  }

  // Recursively process properties for non-object types with properties (rare, but possible)
  if (supported.properties && supported.type !== 'object') {
    result.properties = Object.fromEntries(
      Object.entries(supported.properties).map(([k, v]) => [k, process(v)]),
    );
  }

  return result;
}

/**
 * Converts JSON Schema 7 to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
export function jsonSchemaToGoogleSchema(
  jsonSchema: JSONSchema7Definition,
): OpenAPIV3.SchemaObject {
  const openApiSchema = jsonSchemaToOpenAPISchema(jsonSchema);
  return openApiSchemaToGoogleSchema(openApiSchema as OpenAPIV3.SchemaObject);
}

/**
 * Converts an OpenAPI schema (from jsonSchemaToOpenAPISchema) to a Gemini-compatible schema for Google Gemini API.
 * Only includes supported fields and ensures propertyOrdering for objects.
 */
export function openApiSchemaToGoogleSchema(
  openApiSchema: OpenAPIV3.SchemaObject,
): OpenAPIV3.SchemaObject {
  if (typeof openApiSchema !== 'object' || openApiSchema === null) return openApiSchema;

  // Supported Gemini fields
  const supportedFields = [
    'type',
    'format',
    'description',
    'nullable',
    'enum',
    'maxItems',
    'minItems',
    'properties',
    'required',
    'propertyOrdering',
    'items',
  ];

  const result: Record<string, any> = {};

  for (const key of supportedFields) {
    if ((openApiSchema as any)[key] !== undefined) {
      result[key] = (openApiSchema as any)[key];
    }
  }

  // Recursively process properties for objects
  if (result.type === 'object' && result.properties) {
    const propertyOrdering: string[] = [];
    for (const key of Object.keys(result.properties)) {
      result.properties[key] = openApiSchemaToGoogleSchema(result.properties[key]);
      propertyOrdering.push(key);
    }
    result.propertyOrdering = propertyOrdering;
  }

  // Recursively process items for arrays
  if (result.type === 'array' && result.items) {
    if (Array.isArray(result.items)) {
      result.items = result.items.map(openApiSchemaToGoogleSchema);
    } else {
      result.items = openApiSchemaToGoogleSchema(result.items);
    }
  }

  return result as OpenAPIV3.SchemaObject;
}
