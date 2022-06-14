# ABAPgen

The purpose of this module is to convert Javascript object to a text file representing ABAP. It's not supposed to be used directly but created as a dependency for ABAP generators such as @abapify/abapgen-openapi. 
Module @abapify/abapgen-types is designed to introduce type limitations and to provide code suggestions.

## Installation

```
npm install @abapify/abapgen
```

## Usage
```typescript
import abapgen from './abapgen';
```

### Rules
Simple object
```
{ type: 'string' } ==> type string
```

Nested objects
```
{ type: { ref: { to: 'string' } } } ==> type ref to string
```

Boolean true converts to empty character
```
{ interface: "lif_test", public: true } ==> interface lif_test public
```

Top-level array ends with dots
Strings parsed directly
```
[{interface: 'lif_test'}, {types:"dummy", type:'string'},"endinterface"] 
==> 
interface lif_test.
types dummy type string.
enditerface.
```

Nested arrays end with commas (default behavior)
Chain construction is triggered with a first colon(:) element
Please note there is no array separator after chain trigger
```
[{interface: 'lif_test'}, {types:[":",{dummy:{ type:'string'}}, {foo:{ type: "bar"}}],"endinterface"] 
==> 
interface lif_test.
types:
dummy type string,
foo type bar.
enditerface.
```

Sometimes elements have arrays without comma
This can be reached by using records or arrays with a first symbol &
```
{methods:[do_this:{importing:{p1:{type:"string"},p2:{type:"i"}}}]} or
{methods:[do_this:{importing:["&",{p1:{type:"string"}},{p2:{type:"i"}}] }]} 
==>
methods:
do_this importing
p1 type string
p2 type string
```

## Formatting
This module intentionally doesn't apply any formatting except line breaks
To force formatting we will need to use later any linter such as abaplint for example.






