// eslint-disable-next-line n/no-extraneous-import
import type { IsNever } from 'type-fest'
// eslint-disable-next-line n/no-missing-import
import type { Expect, Equal } from 'type-testing'
import type { JsonObject, JsonValue } from './main.js'

// Construct `(len - 1) | (len - 2) | ... | 0`.  Presumes it won't be passed a
// crazy-long tuple type that could exceed recursion limits.
type TupleIndexes<A extends any[] | readonly any[]> = A extends [any, ...infer T] | readonly [any, ...infer T]
	? T['length'] | TupleIndexes<T>
	: never

type _EmptyIndexes = Expect<Equal<TupleIndexes<[]>, never>>
type _ZeroIndex = Expect<Equal<TupleIndexes<[1]>, 0>>
type _ZeroOneIndex = Expect<Equal<TupleIndexes<[17, 42]>, 0 | 1>>

type GenericPointer = readonly (number | string)[]

/**
 * Return `Root` if there are no further pointer components to traverse.
 */
type RootIfEmptyPointer<Root extends JsonValue, Pointer extends GenericPointer> = Pointer extends [] ? Root : never

type _PrimitiveRootIfEmptyPointer = Expect<Equal<RootIfEmptyPointer<boolean, []>, boolean>>
type _ObjectRootIfEmptyPointer = Expect<Equal<RootIfEmptyPointer<{ x: number }, []>, { x: number }>>
type _TupleRootIfEmptyPointer = Expect<Equal<RootIfEmptyPointer<[number, [], boolean], []>, [number, [], boolean]>>
type _ArrayRootIfEmptyPointer = Expect<Equal<RootIfEmptyPointer<boolean[], []>, boolean[]>>

type _PrimitiveRootWhenNonEmptyPointer = Expect<IsNever<RootIfEmptyPointer<boolean, ['x']>>>
type _ObjectRootWhenNonEmptyPointer = Expect<IsNever<RootIfEmptyPointer<{ z: string }, ['x']>>>
type _TupleRootWhenNonEmptyPointer = Expect<IsNever<RootIfEmptyPointer<[true, []], ['x']>>>
type _ArrayRootWhenNonEmptyPointer = Expect<IsNever<RootIfEmptyPointer<number[], ['x']>>>

/**
 * Traverse into an object (non-array, non-tuple) `Root` for one or more
 * remaining components in `Pointer`, the first of which must be a string or
 * numeric key of `Root`.
 */
type TraverseIntoObject<Root extends JsonValue, Pointer extends GenericPointer> = Pointer extends readonly [
	infer K extends keyof Root,
	...infer Rest extends GenericPointer,
]
	? Root extends JsonObject
		? Root extends JsonValue[]
			? never
			: Referent<Root[K], Rest>
		: never
	: never

type _ObjectTraverseIntoObjectNonEmpty = Expect<Equal<TraverseIntoObject<{ x: number }, ['x']>, number>>
type _ObjectTraverseIntoObjectNonEmptyNumberStringKey = Expect<
	Equal<TraverseIntoObject<{ '1': number }, ['1']>, number>
>
type _ObjectTraverseIntoObjectNonEmptyNumberLiteralKey = Expect<Equal<TraverseIntoObject<{ 1: number }, [1]>, number>>

type _ObjectTraverseIntoObjectEmpty = Expect<IsNever<TraverseIntoObject<{ x: number }, []>>>
type _ObjectTraverseIntoObjectNonEmptyBadKey = Expect<IsNever<TraverseIntoObject<{ x: number }, ['y']>>>

type _PrimitiveTraverseIntoObjectEmpty = Expect<IsNever<TraverseIntoObject<null, []>>>
type _PrimitiveTraverseIntoObjectNonEmpty = Expect<IsNever<TraverseIntoObject<null, ['x']>>>
type _TupleTraverseIntoObjectEmpty = Expect<IsNever<TraverseIntoObject<[string], []>>>
type _TupleTraverseIntoObjectNonEmpty = Expect<IsNever<TraverseIntoObject<[string], [0]>>>
type _TupleTraverseIntoObjectLength = Expect<IsNever<TraverseIntoObject<[string], ['length']>>>
type _ArrayTraverseIntoObjectEmpty = Expect<IsNever<TraverseIntoObject<string[], []>>>
type _ArrayTraverseIntoObjectNonEmpty = Expect<IsNever<TraverseIntoObject<string[], [0]>>>

/**
 * Traverse into a tuple `Root` for one or more remaining components in
 * `Pointer`, the first of which must be an in-range index in `Root`.
 */
type TraverseIntoTuple<Root extends JsonValue, Pointer extends GenericPointer> = Root extends [
	JsonValue,
	...JsonValue[],
]
	? Pointer extends readonly [infer Part extends TupleIndexes<Root>, ...infer Rest extends GenericPointer]
		? Referent<Root[Part], Rest>
		: never
	: never

type _TupleTraverseIntoEmptyTuple0 = Expect<IsNever<TraverseIntoTuple<[], [0]>>>
type _TupleTraverseIntoEmptyTuple1 = Expect<IsNever<TraverseIntoTuple<[], [1]>>>
type _TupleTraverseIntoEmptyTupleLength = Expect<IsNever<TraverseIntoTuple<[], ['length']>>>

type _TupleTraverseIntoTupleNonEmptyFirst = Expect<Equal<TraverseIntoTuple<[boolean, number, string], [0]>, boolean>>
type _TupleTraverseIntoTupleNonEmptyMid = Expect<Equal<TraverseIntoTuple<[number, string, null], [1]>, string>>
type _TupleTraverseIntoTupleNonEmptyLast = Expect<Equal<TraverseIntoTuple<[string, boolean, null], [2]>, null>>

type _TupleTraverseIntoTupleOnePast = Expect<IsNever<TraverseIntoTuple<[42, string, null], [3]>>>
type _TupleTraverseIntoTupleTwoPast = Expect<IsNever<TraverseIntoTuple<[42, string, null], [4]>>>
type _TupleTraverseIntoTupleNegative = Expect<IsNever<TraverseIntoTuple<[42, string, null], [-1]>>>
type _TupleTraverseIntoTupleLength = Expect<IsNever<TraverseIntoTuple<[42, string, null], ['length']>>>
type _TupleTraverseIntoTupleSentinel = Expect<IsNever<TraverseIntoTuple<[42, string, null], ['-']>>>

type _TupleTraverseIntoTupleEmpty = Expect<IsNever<TraverseIntoTuple<[null, 42, boolean, number, string], []>>>

type _PrimitiveTraverseIntoTupleEmpty = Expect<IsNever<TraverseIntoTuple<number, []>>>
type _PrimitiveTraverseIntoTupleNonEmptyNumber = Expect<IsNever<TraverseIntoTuple<number, [0]>>>
type _PrimitiveTraverseIntoTupleNonEmptyLength = Expect<IsNever<TraverseIntoTuple<number, ['length']>>>
type _ObjectTraverseIntoTupleEmpty = Expect<IsNever<TraverseIntoTuple<{ z: string }, []>>>
type _ObjectTraverseIntoTupleNonEmptyNumber = Expect<IsNever<TraverseIntoTuple<{ z: string }, [0]>>>
type _ObjectTraverseIntoTupleNonEmptyNumericString = Expect<IsNever<TraverseIntoTuple<{ z: string }, ['0']>>>
type _ObjectTraverseIntoTupleNonEmptyString = Expect<IsNever<TraverseIntoTuple<{ z: string }, ['z']>>>
type _ObjectTraverseIntoTupleNonEmptySentinel = Expect<IsNever<TraverseIntoTuple<{ z: string }, ['-']>>>
type _ArrayTraverseIntoTupleEmpty = Expect<IsNever<TraverseIntoTuple<{ x: number }[], []>>>
type _ArrayTraverseIntoTupleNonEmptyNumber = Expect<IsNever<TraverseIntoTuple<{ x: number }[], [0]>>>
type _ArrayTraverseIntoTupleNonEmptyLength = Expect<IsNever<TraverseIntoTuple<{ x: number }[], ['length']>>>
type _ArrayTraverseIntoTupleNonEmptyProp = Expect<IsNever<TraverseIntoTuple<{ x: number }[], ['x']>>>

/**
 * Traverse into a non-tuple array `Root` for one or more remaining components
 * in `Pointer`.  The first component must be either a number or, if it's the
 * only component, `'-'` signifying the nonexistent array element one past the
 * end of the array.
 */
type TraverseIntoArray<Root extends JsonValue, Pointer extends GenericPointer> = Root extends JsonValue[]
	? Root extends [] | [JsonValue, ...JsonValue[]]
		? never
		: Pointer extends readonly [number | '-'] | readonly [number, ...infer Rest extends GenericPointer]
			? Referent<Root[number], Rest>
			: never
	: never

type _ArrayTraverseIntoArrayZero = Expect<Equal<TraverseIntoArray<null[], [0]>, null>>
type _ArrayTraverseIntoArraySentinel = Expect<Equal<TraverseIntoArray<string[], ['-']>, string>>

type _ArrayTraverseIntoArrayEmpty = Expect<IsNever<TraverseIntoArray<boolean[], []>>>

type _ArrayTraverseIntoArrayLength = Expect<IsNever<TraverseIntoArray<boolean[], ['length']>>>
type _ArrayTraverseIntoArrayProp = Expect<IsNever<TraverseIntoArray<{ x: 42 }[], ['prop']>>>

type _TupleTraverseIntoArrayEmptyTupleEmpty = Expect<IsNever<TraverseIntoArray<[], []>>>
type _TupleTraverseIntoArrayEmptyTuple0 = Expect<IsNever<TraverseIntoArray<[], [0]>>>
type _TupleTraverseIntoArrayEmptyTuple1 = Expect<IsNever<TraverseIntoArray<[], [1]>>>
type _TupleTraverseIntoArrayEmptyTupleLength = Expect<IsNever<TraverseIntoArray<[], ['length']>>>
type _TupleTraverseIntoArrayEmptyTupleSentinel = Expect<IsNever<TraverseIntoArray<[], ['-']>>>
type _TupleTraverseIntoArrayNonEmptyTupleEmpty = Expect<IsNever<TraverseIntoArray<[number], []>>>
type _TupleTraverseIntoArrayNonEmptyTuple0 = Expect<IsNever<TraverseIntoArray<[string], [0]>>>
type _TupleTraverseIntoArrayNonEmptyTuple1 = Expect<IsNever<TraverseIntoArray<[boolean], [1]>>>
type _TupleTraverseIntoArrayNonEmptyTupleMid = Expect<IsNever<TraverseIntoArray<[true, null, number], [1]>>>
type _TupleTraverseIntoArrayNonEmptyTupleLength = Expect<IsNever<TraverseIntoArray<[], ['length']>>>
type _TupleTraverseIntoArrayNonEmptyTupleSentinel = Expect<IsNever<TraverseIntoArray<[], ['-']>>>

type _PrimitiveTraverseIntoArrayEmpty = Expect<IsNever<TraverseIntoArray<null, []>>>
type _PrimitiveTraverseIntoArrayNonEmptyNumber = Expect<IsNever<TraverseIntoArray<number, [0]>>>
type _PrimitiveTraverseIntoArrayNonEmptyLength = Expect<IsNever<TraverseIntoArray<boolean, ['length']>>>
type _PrimitiveTraverseIntoArrayNonEmptyProp = Expect<IsNever<TraverseIntoArray<number, ['prop']>>>
type _PrimitiveTraverseIntoArrayNonEmptySentinel = Expect<IsNever<TraverseIntoArray<number, ['-']>>>

type _ObjectTraverseIntoArrayEmpty = Expect<IsNever<TraverseIntoArray<{ x: number; y: number }, []>>>
type _ObjectTraverseIntoArrayNonEmptyNumber = Expect<IsNever<TraverseIntoArray<{ x: number; y: number }, [0]>>>
type _ObjectTraverseIntoArrayNonEmptyNumericString = Expect<IsNever<TraverseIntoArray<{ z: [] }, ['0']>>>
type _ObjectTraverseIntoArrayNonEmptyString = Expect<IsNever<TraverseIntoArray<{ x: [boolean] }, ['x']>>>

type Referent<Root extends JsonValue, Pointer extends GenericPointer> =
	| RootIfEmptyPointer<Root, Pointer>
	| TraverseIntoObject<Root, Pointer>
	| TraverseIntoTuple<Root, Pointer>
	| TraverseIntoArray<Root, Pointer>

type _IntoPrimitive = Expect<Equal<Referent<null, []>, null>>
type _StringIntoPrimitive = Expect<IsNever<Referent<null, ['x']>>>
type _NumberIntoPrimitive = Expect<IsNever<Referent<null, [0]>>>
type _HyphenIntoPrimitive = Expect<IsNever<Referent<null, ['-']>>>
type _StringLengthIntoString = Expect<IsNever<Referent<'hello', ['length']>>>

type _NumberIntoEmptyTuple = Expect<IsNever<Referent<[], [0]>>>
type _StringIntoEmptyTuple = Expect<IsNever<Referent<[], ['x']>>>
type _OnePastIntoEmptyTuple = Expect<IsNever<Referent<[], ['-']>>>

type _ConstNumberIntoSingleTuple = Expect<Equal<Referent<[17], [0]>, 17>>
type _StringIntoSingleTuple = Expect<IsNever<Referent<[17], ['x']>>>
type _NumberIntoSingleTuple = Expect<IsNever<Referent<[17], [number]>>>
type _IndexStringIntoSingleTupleDisallowed = Expect<IsNever<Referent<[17], ['0']>>>

type _PropertyOfObject = Expect<Equal<Referent<{ x: number }, ['x']>, number>>
type _NumberOfObject = Expect<Equal<Referent<{ 1: boolean }, [1]>, boolean>>
type _StringIndexOfObject = Expect<Equal<Referent<{ '1': string }, ['1']>, string>>

type _NumberInArray = Expect<Equal<Referent<number[], [0]>, number>>
type _OnePastInArray = Expect<Equal<Referent<number[], ['-']>, number>>
type _LengthInArray = Expect<IsNever<Referent<number[], ['length']>>>
type _OtherPropertyInArray = Expect<IsNever<Referent<number[], ['foobar']>>>

type _MultipleLevels = Expect<Equal<Referent<{ x: [number, { y: boolean }] }, ['x', 1, 'y']>, boolean>>

type _Point = { x: number; y: number }

type _Good = { point: _Point; type: 'good' }
type _Bad = { point: _Point; type: 'bad' }

type _Arena = (_Good | _Bad)[]

type _NestedUnionSingleType = Expect<Equal<Referent<_Arena, [number, 'point', 'x']>, number>>
type _NestedUnionMultipleTypes = Expect<Equal<Referent<_Arena, [number, 'type']>, 'good' | 'bad'>>

type _WithNullableField = {
	id: number
	name: string
	extended: { boogaloo: string } | null
}

type _Nullable = Expect<Equal<Referent<_WithNullableField, ['extended']>, { boogaloo: string } | null>>

//type _R2 = Referent<{ boogaloo: string } | null, ['boogaloo']>

//type _ThroughNullable = Expect<Equal<Referent<_WithNullableField, ['extended', 'boogaloo']>, string>>

export class PointerSetter<Root extends JsonValue, Pointer extends GenericPointer> {
	#pointer

	constructor(pointer: Pointer) {
		this.#pointer = pointer
	}

	set(root: Root, value: Referent<Root, Pointer>): Root {
		const pointer = this.#pointer
		if (pointer.length === 0) {
			return value as Root
		}

		let current: JsonValue = root
		for (let i = 0; i < pointer.length - 1; i++) {
			const part = pointer[i]
			if (part === '-' && Array.isArray(current)) {
				//
			} else {
				//
			}

			current = (current as any)[pointer[i]]
			if ((current === null || current === undefined) && i < pointer.length - 1) {
				//
			}
		}

		let key = pointer[pointer.length - 1]
		if (key === '-' && Array.isArray(current)) {
			key = current.length
		}
		if (typeof current === 'object' && current !== null) {
			;(current as any)[key] = value
		}

		return root
	}
}
