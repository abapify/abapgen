type CodeUnit = object | string | Array<CodeUnit>;

// const ARRAY_BEGIN = ':';
// const ARRAY_SEPARATOR = ',';
// const ARRAY_END = '.';

class codegen {
  chain_level = 0;
  array_level = 0;
  from(code: CodeUnit): string {
    return (
      (Array.isArray(code) && this.from_array(code)) ||
      (typeof code === 'object' && this.from_object(code)) ||
      code.toString()
    );
  }

  from_object(code: object): string {
    // {type: "c", length: 1} => type c length 1
    return Object.entries(code).reduce(
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
    );
  }

  from_array(code: Array<CodeUnit>) {
    const control_element = code[0].toString();

    // start of chain
    const is_chain = control_element === ':';

    is_chain && this.chain_level++;
    this.array_level++;

    const result = code
      .map((code, index, array) => {
        let array_separator = '';

        const is_last = index + 1 === array.length;

        // if it's chain - we separate by comma
        // but in case if it's a last element of chain, but there is another chain on top - it should inherit parent

        if (
          // no comma after chain trigger (:)
          (is_chain && index === 0) ||
          // we also keep it blank for last element of nested array
          (this.array_level > 1 && is_last)
        ) {
          // keep it blank
        } else if (this.array_level > 1) {
          array_separator = ',';
        } else {
          array_separator = '.';
        }

        return this.from(code) + array_separator;
      })
      .join('\n');

    this.array_level--;

    is_chain && this.chain_level--;

    return result;
  }
}

export default (code: CodeUnit) => new codegen().from(code);
