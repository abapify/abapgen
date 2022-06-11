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

    return parser;
  }
}

class CallbackMap<T> extends Map<string, ((key?: string) => T) | T> {
  override set(key: string, callback: (key?: string) => T) {
    if (!this.has(key)) {
      super.set(key, callback(key));
    }
    return this;
  }
}

interface ParseOptions {
  operations?: Array<string>;
}

interface Parser {
  parse(options?: ParseOptions): void;
}

class OpenapiParser<T extends OpenAPI.Document> implements Parser {
  readonly openapi: T;

  protected readonly output: {
    methods: Array<ABAPgen.InterfaceMethods>,
    types: Array<ABAPgen.InterfaceTypes>
  }

  private _refs: Map<string, unknown>;
  readonly $refs: ReturnType<SwaggerParser['resolve']>;  
  private typesMap: Map<string, Array<ABAPgen.InterfaceTypes['types']>>;
  private structureTypesMap: Map<
    string,
    {
      structure_type: ABAPgen.StructuredType;
      structure_components: ABAPgen.StructuredType;
    }
  >;

  constructor(openapi: T) {
    this.openapi = openapi;

    this.output = {
      methods:[],
      types:[]
    }
    
    this.$refs = SwaggerParser.resolve(openapi);
    this._refs = new CallbackMap<unknown>();
    this.typesMap = new Map();
    this.structureTypesMap = new Map();
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
  parseRef($ref: string) {
    this._refs.set($ref, () => {
      // we need to update components
      
      let abap_type = '';

      //let structure_type: ABAPgen.StructuredType;
      let structure_components: ABAPgen.StructuredType = [];

      $ref
        .split('/')
        .filter((s) => s !== '#')
        .forEach((segment, index, array) => {

          const abap_component = toSnakeCase(segment);
          abap_type = [abap_type, abap_component].filter((s) => s).join('-');
          
          // if type already exists - skip it
          if (this.typesMap.has(abap_type)) {
            return;
          }

          // if it's not a last line - we need to create am intermediate structure type
          if (index++ < array.length) {
            const structure_type = structure_components;
            structure_components = [];

            // we create a structure type and components instances separately for convenience
            // we can fetch later this type by abap name
            structure_type.push(
              { begin: { of: toSnakeCase(abap_component) } },
              structure_components,
              { end: { of: abap_type } }
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
              this.output.types.push({types:structure_type});
            }            
          }
        });

      return {};
    });
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

            // const importing: any[] = [];

            operation?.parameters?.forEach((parameter) => {
              const reference = parameter as OpenAPIV3.ReferenceObject;
              if (reference?.$ref) {
                this.parseRef(reference.$ref);
              }
            });

            this.output.methods.push({
              [$comment.before]: operationId,
              methods: toSnakeCase(operationId),
              // importing,
            });
          });
    });
  }
}
