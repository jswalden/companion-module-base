import type { JsonValue } from '../common/json-value.js'
import type { PointerAndType } from '../pointer.js'
import type { StringKeys } from '../util.js'

/**
 * The definition of a variable
 */
export interface CompanionVariableDefinition<_TManifest extends CompanionVariableValues = CompanionVariableValues> {
	// variableId: StringKeys<TManifest>
	name: string
}
/**
 * The definition of a variable
 */
export type CompanionVariableDefinitions<TManifest extends CompanionVariableValues = CompanionVariableValues> = {
	[variableId in StringKeys<TManifest>]: CompanionVariableDefinition<TManifest>
}

type UpdateRecord<PointerWithType> = PointerWithType extends [infer Pointer, infer SubcomponentType]
	? {
			/**
			 * A property path indicating the list of properties to access on
			 * the existing variable value to find the subcomponent to be
			 * changed to `partial`.  A property is:
			 *
			 *   * a string specifying a property of that name,
			 *   * a number specifying an in-bounds array element, or
			 *   * `'-'` indicating the element one past the end of an array.
			 *
			 * An empty property path refers to the entire variable value.
			 *
			 * For example, for a value of this type:
			 *
			 * ```ts
			 * type T = {
			 *     one: number
			 *     y: []
			 * }
			 * ```
			 *
			 * these property paths would refer to the specified components:
			 *
			 *   * `[]`: the entirety of `T`
			 *   * `['one']`: `T['one']`
			 *   *
			 *
			 *
			 * The root value the property path resolves against is the variable
			 * value.  Updating a variable by specifying
			 * `{ pointer: [], partial: value }` therefore is the same as
			 * directly setting the variable to `value`.
			 *
			 * (This property walk is patterned upon
			 * [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901),
			 * but it uses the type system to guarantee correctness.)
			 */
			path: Pointer

			/**
			 * The new value to use to replace the subcomponent specified by the
			 * pointer.  (If the pointer is `""`, the variable's value is set.)
			 */
			partial: SubcomponentType
		}
	: never

type UnsetVariable = {
	/** Property path to the variable value itself. */
	path: []
	/** Specify no value to clear the variable. */
	partial: undefined
}

/**
 * A set of updates to perform to variables.
 */
export type CompanionVariableUpdate<TManifest extends CompanionVariableValues = CompanionVariableValues> = {
	[variableId in StringKeys<TManifest>]?:
		| UnsetVariable
		| UpdateRecord<PointerAndType<Exclude<TManifest[variableId], undefined>>>
}

/**
 * A set of values of some variables
 */
export interface CompanionVariableValues {
	[variableId: string]: CompanionVariableValue | undefined
}

/**
 * The value of a variable
 */
export type CompanionVariableValue = JsonValue | undefined
