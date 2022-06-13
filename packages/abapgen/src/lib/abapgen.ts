import { has_comments, $comment } from '@abapify/abapgen-common';

interface Options {
  end_of_line: string;
}

type CodeUnit = (object & has_comments) | string | Array<CodeUnit>;

class codegen {
  // chain_level = 0;
  array_level = 0;
  from(code: CodeUnit, options?: Options): string {
    return (
      (Array.isArray(code) && this.from_array(code, options)) ||
      (typeof code === 'object' && this.from_object(code, options)) ||
      code.toString() + (options?.end_of_line || '')
    );
  }

  from_object(code: object, options?: Options): string {
    // {type: "c", length: 1} => type c length 1
    const result =
      Object.entries(code).reduce(
        (result, [key, value]) =>
          // if value is boolean and true - we'll just output the key
          [
            result,
            key,
            typeof value === 'boolean' && value ? '' : this.from(value),
          ]
            .filter((word) => word)
            // in general everything needs to be separated by space
            .join(' ')
            //start of array may not have spaces in front of :
            .replace(/\s*:/g, ':'),
        ''
      ) + (options?.end_of_line || '');

    // fetch comments from object definition

    const comments = this.fetch_comments(code);
    return `${comments.before ? `" ${comments.before}\n` : ''}${result}${
      comments.after ? ` "${comments.after}` : ''
    }`;
  }

  fetch_comments(code: CodeUnit): Partial<Record<'before' | 'after', string>> {
    let comments = {};
    if (typeof code === 'object' && !Array.isArray(code)) {
      comments = {
        before: code[$comment.before] || '',
        after: code[$comment.after] || '',
      };
    }
    return comments;
  }

  from_array(code: Array<CodeUnit>, options?: Options) {
    // is_chain && this.chain_level++;
    this.array_level++;

    const result = code
      .map((code, index, array) => {
        const is_chain = !index && typeof code === 'string' && code === ':';

        let array_separator = options?.end_of_line || '';

        const is_last = index + 1 === array.length;

        // if it's chain - we separate by comma
        // but in case if it's a last element of chain, but there is another chain on top - it should inherit parent
        if (
          // no comma after chain trigger (:)
          is_chain ||
          // we also keep it blank for last element of nested array
          (this.array_level > 1 && is_last)
        ) {
          // keep it blank
        } else if (this.array_level > 1) {
          array_separator = ',';
        } else {
          array_separator = '.';
        }

        return this.from(code, { end_of_line: array_separator });
      })
      .join('\n');

    this.array_level--;

    return result;
  }
}

export function abapgen(code: CodeUnit) {
  return new codegen().from(code);
}

export default (code: CodeUnit) => new codegen().from(code);
