import { has_comments, $comment } from '@abapify/abapgen-common';

interface Options {
  end_of_line: string;
}

type CodeUnit = (object & has_comments) | string | Array<CodeUnit>;

class codegen {
  // chain_level = 0;
  array_level = 0;
  from(code: CodeUnit | undefined, options?: Options): string {
    if (Array.isArray(code)) {
      return this.from_array(code, options);
    } else if (typeof code === 'object') {
      return this.from_object(code, options);
    } else {
      return code?.toString() + (options?.end_of_line || '');
    }

    // return (
    //   (Array.isArray(code) &&  ||
    //   (typeof code === 'object' && this.from_object(code, options)) ||
    //   code?.toString() + (options?.end_of_line || '')
    // );
  }

  from_object(code: object, options?: Options): string {
    // {type: "c", length: 1} => type c length 1
    const result =
      Object.entries(code).reduce(
        (result, [key, value]) =>
          // if value is boolean and true - we'll just output the key
          [
            result,
            // array needs to start with a new line if it's an object field
            key + (Array.isArray(value) ? '\n' : ''),
            typeof value === 'boolean' && value ? '' : this.from(value),
          ]
            .filter((word) => word)
            .join(' ')
            //start of array may not have spaces in front of :
            .replace(/\s*:/g, ':')
            // no manual indent - code must use some formatter later
            .replace(/^\s*/gm, '')
            .replace(/\s\s+/g, ' '),
        ''
      ) + (options?.end_of_line || '');

    // fetch comments from object definition

    const comments = this.fetch_comments(code);
    return `${comments.before ? `"${comments.before}\n` : ''}${result}${
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
    let control_separator: string;

    // extract array separator
    if (code[0]?.toString().startsWith('&')) {
      control_separator = code.shift()?.toString().substring(1) || '';
      // } else {
      //   array_separator = this.array_level ? ',' : '.';
    }

    // // extract chain indicator
    // const chain_trigger =
    //   code[0]?.toString() === ':' ? code.shift() + '\n' : '';

    // const result =
    //   chain_trigger +
    //   code
    //     .map((code, index, array) => {
    //       index === 0 && this.array_level++;
    //       index + 1 === array.length && this.array_level--;

    //       let end_of_line = array_separator;
    //       if (end_of_line === undefined) {
    //         end_of_line = this.array_level > 1 ? ',' : '.';
    //       }

    //       return this.from(code, { end_of_line });
    //     })
    //     .join('\n');
    // // this.array_level--;
    // return result;

    // is_chain && this.chain_level++;
    this.array_level++;

    const result = code
      .map((code, index, array) => {
        const is_chain = !index && typeof code === 'string' && code === ':';
        // if (is_chain) {has_chain = true}

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
          array_separator =
            control_separator === undefined ? ',' : control_separator;
        } else {
          array_separator = '.';
        }

        return (
          //`${!index && !is_chain ? '\n' : ''}` +
          this.from(code, { end_of_line: array_separator })
        );
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
