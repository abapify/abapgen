import { has_comments, $comment } from '@abapify/abapgen-common';

const parentMap = new WeakMap();
// top-level call without parent
const abapgen = (code: unknown) => ABAPgen(code);
export default abapgen;

// factory function
function ABAPgen(code: unknown, parent?: unknown): string {
  const proxy =
    (Array.isArray(code) && new Proxy(code, ArrayProxy)) ||
    (code && typeof code === 'object' && new Proxy(code, ObjectProxy));

  if (proxy && typeof proxy === 'object') {
    // fill parent map
    parent && parentMap.set(proxy, parent);
    return proxy.toString();
  }

  switch (typeof code) {
    case 'boolean':
      return '';
    case 'string':
      return code;
  }

  return new String(code).toString() || '';
}

const ObjectProxy: ProxyHandler<object> = {
  get(target, p) {
    switch (p) {
      case 'toString':
        return () => {
          const comments = target as has_comments;

          const result = Reflect.ownKeys(target).reduce(
            (result, ownKey) => {
              // comments are processed separately
              switch (ownKey) {
                case $comment.after:
                case $comment.before:
                  return result;
              }

              return (
                [result, ownKey, ABAPgen(Reflect.get(target, ownKey), this)]
                  .filter((word) => word)
                  .join(' ') //start of array may not have spaces in front of :
                  .replace(/\s*:/g, ':')
                  // no manual indent - code must use some formatter later
                  .replace(/^\s*|\s*$/gm, '')                  
                  //.replace(/\s\s+/g, ' ')
              );
            },
            comments?.[$comment.before]
              ? `"${comments?.[$comment.before]}\n`
              : ''
          ) as string;
          return result;
        };
    }
    return Reflect.get(target, p);
  },
};

const ArrayProxy: ProxyHandler<Array<unknown>> = {
  get(target, p, receiver) {
    switch (p) {
      case 'toString':
        return () => {
          let chain_trigger = '\n';
          let separator = '';
          let end_of_array = '';

          if (!parentMap.has(receiver)) {
            chain_trigger = '';
            separator = '.';
            end_of_array = '.';
          }

          // even if top-level array - also comma
          if (target[0] === ':') {
            chain_trigger = (target.shift() + '\n') as string;
            separator = ',';
          }

          const result =
            chain_trigger +
            target.reduce((result, value, index, array) => {
              const has_comments = value as has_comments;

              return (
                result +
                // rendered array item
                ABAPgen(value, this) +
                // separator
                (index + 1 === array.length ? '' : separator) +
                // comment after
                (has_comments?.[$comment.after]
                  ? ` "${has_comments?.[$comment.after]}`
                  : '') +
                // end of line
                (index + 1 === array.length ? '' : '\n')
              );
            }, '') +
            end_of_array;

          return result;
        };
    }
    return Reflect.get(target, p);
  },
};

