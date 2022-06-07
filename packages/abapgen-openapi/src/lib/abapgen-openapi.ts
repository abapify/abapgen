//convert openapi to abapgen format
import * as SwaggerParser from '@apidevtools/swagger-parser';
import ABAPgen from '@abapify/abapgen-types';
import { toSnakeCase } from 'js-convert-case';

import { OpenAPI, OpenAPIV3, OpenAPIV2, OpenAPIV3_1 } from 'openapi-types';
import { $comment } from '@abapify/abapgen';
import * as semver from "semver";

export default abstract class OpenapiToABAP {
  // openapi: OpenAPI.Document;

  // constructor(openapi: OpenAPI.Document) {
  //   // this.openapi = openapi;
  // }

  static async load(path: string): Promise<Parser<{}>> {
    const openapi = await SwaggerParser.parse(path);

    let parser;

    // is it version 2?
    if ((openapi as OpenAPIV2.Document)?.swagger === '2.0') {
      parser = new Parser<OpenAPIV2.Document>(openapi as OpenAPIV2.Document);
    } else if ( semver.satisfies((openapi as OpenAPIV3.Document)?.openapi, '^3.0') ) {
      parser = new ParserOpenAPIV3(openapi as OpenAPIV3.Document);
    } else if ((openapi as OpenAPIV3_1.Document)?.openapi === '3.1') {
      parser = new Parser<OpenAPIV3_1.Document>(
        openapi as OpenAPIV3_1.Document
      );
    } else {
      throw 'Not supported openapi version';
    }

    return parser;
  }
}



interface ParseOptions {
  operations?: Array<string>;
}

class Parser<T> {
  openapi: T;
  protected methods: ABAPgen.InterfaceMethods;
  constructor(openapi: T) {
    this.openapi = openapi;
    this.methods = [];
  }
  get_interface({
    interface_name,
  }: {
    interface_name: string;
  }): ABAPgen.Interface {
    return [
      { interface: interface_name, public: true },
      ...this.methods,
      'endinterface',
    ];
  }
  parse(options?: ParseOptions) {
    throw 'Method is not implemented';
  }
}

class ParserOpenAPIV3 extends Parser<OpenAPIV3.Document> {
  override parse(options?: ParseOptions) {
    Object.entries(this.openapi.paths).forEach(([pattern, path]) => {
      path &&
        Object.values(OpenAPIV3.HttpMethods)
          .filter((method) => method in path)
          .forEach((method) => {
            let operation = path[method];
            let operationId = operation?.operationId;
            let operations_filter = options?.operations;

            if (
              !operationId ||
              (operations_filter && !operations_filter.includes(operationId))
            ) {
              return;
            }
            this.methods.push({
              [$comment.before]: operationId,
              methods: toSnakeCase(operationId),
            });
          });
    });
  }
}
