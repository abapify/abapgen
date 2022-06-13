//convert openapi to abapgen format
import * as SwaggerParser from '@apidevtools/swagger-parser';
import ABAPgen from '@abapify/abapgen-types';
import { toSnakeCase } from 'js-convert-case';

import { OpenAPI, OpenAPIV3, OpenAPIV2, OpenAPIV3_1 } from 'openapi-types';
import { $comment } from '@abapify/abapgen-common';
import * as semver from 'semver';

export default abstract class OpenapiToABAP {
  // openapi: OpenAPI.Document;

  // constructor(openapi: OpenAPI.Document) {
  //   // this.openapi = openapi;
  // }

  static async load(
    path: string
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<OpenapiParser<OpenAPI.Document<{}>>> {
    const openapi = await SwaggerParser.parse(path);

    let parser;

    // is it version 2?
    if ((openapi as OpenAPIV2.Document)?.swagger === '2.0') {
      parser = new OpenapiParser<OpenAPIV2.Document>(
        openapi as OpenAPIV2.Document
      );
    } else if (
      semver.satisfies((openapi as OpenAPIV3.Document)?.openapi, '^3.0')
    ) {
      parser = new ParserOpenAPIV3(openapi as OpenAPIV3.Document);
    } else if ((openapi as OpenAPIV3_1.Document)?.openapi === '3.1') {
      parser = new OpenapiParser<OpenAPIV3_1.Document>(
        openapi as OpenAPIV3_1.Document
      );
    } else {
      throw 'Not supported openapi version';
    }

    await parser.resolveRefs();

    return parser;
  }
}

interface ParseOptions {
  operations?: Array<string>;
}

interface Parser {
  parse(options?: ParseOptions): void;
}

abstract class make {
  static type(
    type: string,
    context: string
  ): ABAPgen.Type | Record<string, ABAPgen.Type> {
    return context ? { [$comment.before]: context, [toSnakeCase(context)]: { type } } : { type };
  }
  static structured_type(
    type: string,
    components: ABAPgen.StructuredType
  ): ABAPgen.StructuredType {
    const name = toSnakeCase(type);
    return [{ [$comment.before]: type, begin: { of: name } }, components, { end: { of: name } }];
  }
  static ref_segments($ref: string): Array<string> {
    return $ref.split('/').filter((p) => p !== '#');
  }
}

class OpenapiParserBase {}

class OpenapiParser<T extends OpenAPI.Document>
  extends OpenapiParserBase
  implements Parser
{
  readonly openapi: T;

  protected readonly output: {
    methods: Array<ABAPgen.InterfaceMethods>;
    types: Array<ABAPgen.InterfaceTypes>;
  };

  private _refs: Set<string>;
  protected $refs: SwaggerParser.$Refs | undefined;
  private typesMap: Map<string, ABAPgen.Components>;
  protected readonly structureTypesMap: Map<
    string,
    {
      structure_type: ABAPgen.StructuredType;
      structure_components: ABAPgen.Components;
    }
  >;

  constructor(openapi: T) {
    super();
    this.openapi = openapi;

    this.output = {
      methods: [],
      types: [],
    };

    this._refs = new Set();
    this.typesMap = new Map();
    this.structureTypesMap = new Map();
  }

  async resolveRefs() {
    this.$refs = await SwaggerParser.resolve(this.openapi);
  }

  get components(): ABAPgen.InterfaceComponents {
    return [this.output.methods, this.output.types].flat();
  }
  get_interface({
    interface_name,
  }: {
    interface_name: string;
  }): ABAPgen.Interface {
    return [
      { interface: interface_name, public: true },
      ...this.components,
      'endinterface',
    ];
  }
  parse() {
    throw 'Method is not implemented';
  }

  createRefStructures($ref: string): void {
    // loop variables
    let abap_type = '';
    let structure_components: ABAPgen.Components = [];

    make.ref_segments($ref).forEach((segment, index, array) => {
      const abap_component = toSnakeCase(segment);
      abap_type = [abap_type, abap_component].filter((s) => s).join('-');

      // if type already exists - skip it
      if (this.typesMap.has(abap_type)) {
        return;
      }

      // if it's not a last line - we need to create am intermediate structure type
      if (index + 1 < array.length) {
        const structure_type = structure_components;
        structure_components = [];

        // we create a structure type and components instances separately for convenience
        // we can fetch later this type by abap name
        structure_type.push(
          ...make.structured_type(abap_component, structure_components)
        );

        // add to map
        this.structureTypesMap.set(abap_type, {
          structure_type,
          structure_components,
        });

        // also let's update a regular types map
        this.typesMap.set(abap_type, structure_type);

        // add top-level structure type to output
        if (!index) {
          this.output.types.push({ types: [':', structure_type] });
        }
      }
    });
  }

  parseReferenceType($ref: string): true | void {
    // do not parse empty ref or already parsed
    if (!$ref || this._refs.has($ref)) {
      return;
    }
    this._refs.add($ref);

    // create intermediate ref structures like components-responses..
    this.createRefStructures($ref);
    return true;
  }
}

class ParserOpenAPIV3 extends OpenapiParser<OpenAPIV3.Document> {
  override parse(options?: ParseOptions) {
    Object.entries(this.openapi.paths).forEach(([, path]) => {
      path &&
        Object.values(OpenAPIV3.HttpMethods)
          .filter((method) => method in path)
          .forEach((method) => {
            const operation = path[method];
            const operationId = operation?.operationId;
            const operations_filter = options?.operations;

            if (
              !operationId ||
              (operations_filter && !operations_filter.includes(operationId))
            ) {
              return;
            }

            //parse request body
            if (operation?.requestBody) {
              const body = this.parseRequestBody(
                operation?.requestBody,
                'request'
              );
              // body && console.log(body);
            }

            this.output.methods.push({
              [$comment.before]: operationId,
              methods: toSnakeCase(operationId),
              // importing,
            });
          });
    });
  }

  parseRequestBody(
    body: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject,
    context: string
  ) {
    if (!body) {
      return;
    }
    return (
      this.parseReference(body as OpenAPIV3.ReferenceObject, context) ||
      this.parseSchema(
        (body as OpenAPIV3.RequestBodyObject)?.content['application/json']
          ?.schema,
        context
      )
    );
  }

  parseResponse(
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject | undefined,
    context: string
  ): ABAPgen.Component | ABAPgen.Type | void {
    if (!response) {
      return;
    }

    return (
      this.parseReference(response as OpenAPIV3.ReferenceObject, context) ||
      (response &&
        this.parseSchema(
          (response as OpenAPIV3.ResponseObject)?.content?.['application/json']
            ?.schema,
          context
        ))
    );
  }
  parseSchema(
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | void,
    context: string
  ): ABAPgen.Type | ABAPgen.StructuredType | void | ABAPgen.Component {
    if (!schema) {
      return;
    }
    return (
      this.parseReference(schema as OpenAPIV3.ReferenceObject, context) ||
      this.parseArray(schema as OpenAPIV3.ArraySchemaObject, context) ||
      this.parseNonArray(schema as OpenAPIV3.NonArraySchemaObject, context)
    );
  }
  parseArray(
    array: OpenAPIV3.ArraySchemaObject,
    context: string
  ): ABAPgen.Type | ABAPgen.StructuredType | void {
    if (array?.type !== 'array') {
      return;
    }
    return (
      this.parseReference(array.items as OpenAPIV3.ReferenceObject, context) ||
      this.parseSchema(array.items as OpenAPIV3.SchemaObject, context)
    );
  }
  parseNonArray(
    object: OpenAPIV3.NonArraySchemaObject,
    context: string
  ): ABAPgen.Type | ABAPgen.StructuredType | void {
    if (!object) {
      return;
    }

    switch (object.type) {
      case 'object':
        return this.parseObject(object, context);
    }

    const type = this.getABAPtype(object);
    if (type) {
      return make.type(type, context);
    }
  }

  getABAPtype(object: OpenAPIV3.NonArraySchemaObject): string | void {
    switch (object.type) {
      case 'boolean':
        return `xsdboolean`;
      case 'integer':
        return object.format && ['int32', 'int64'].includes(object.format)
          ? 'string'
          : 'i';
      case 'number':
        return `string`;
      case 'string':
        return object.format === 'date-time' ? 'XSDDATETIME_Z' : 'string';
    }
  }

  parseObject(
    object: OpenAPIV3.NonArraySchemaObject,
    context: string
  ): ABAPgen.StructuredType | void {
    if (!object || !object?.properties) {
      return;
    }

    const components = Object.entries(object.properties)
      .map(
        ([key, value]) =>
          this.parseReference(value as OpenAPIV3.ReferenceObject, key) ||
          this.parseSchema(value as OpenAPIV3.SchemaObject, key) ||
          ''
      )
      .filter((o) => o) as Array<ABAPgen.Component>;

    return make.structured_type(context,components );
  }
  getABAPstructureType(segments: Array<string>): string {
    return segments.map((s) => toSnakeCase(s)).join('-');
  }
  parseReference(
    ref: OpenAPIV3.ReferenceObject,
    context: string
  ): ABAPgen.Component | ABAPgen.Type | void {
    if (!ref?.$ref) {
      return;
    }
    this.parseReferenceType(ref?.$ref);
    const segments = make.ref_segments(ref.$ref);
    const type = this.getABAPstructureType(segments);
    return context ? { [context]: { type } } : { type };
  }

  override parseReferenceType($ref: string): void {
    if (!super.parseReferenceType($ref)) {
      return;
    }

    const segments = make.ref_segments($ref);

    if (segments.length !== 3) {
      throw 'Unexpected reference';
    }

    // search for structure type
    const components = this.structureTypesMap.get(
      this.getABAPstructureType(segments.slice(0, 2))
    )?.structure_components;
    if (!components) {
      return;
    }

    const [components_key, type_key, ref_key] = segments;
    switch (components_key) {
      case 'components':
        switch (type_key) {
          case 'responses':
            components.push(
              this.parseResponse(
                this.openapi?.components?.responses?.[ref_key],
                ref_key
              ) as ABAPgen.Component
            );
            break;
          case 'schemas':
            components.push(
              this.parseSchema(
                this.openapi?.components?.schemas?.[ref_key],
                ref_key
              ) as ABAPgen.Component
            );
            break;
          default:
            break;
        }

        break;

      default:
        break;
    }
  }
}
