import { SomeCompanionActionInputField, SomeCompanionFeedbackInputField } from '../main.js'

export function hasAnyOldIsVisibleFunctions(
	options: (SomeCompanionActionInputField | SomeCompanionFeedbackInputField)[] | undefined,
): boolean {
	if (!options) return false

	for (const option of options) {
		if ('isVisible' in option && !!option.isVisible) return true
	}

	return false
}

export function hasAnyOldRequiredProperties(
	options: (SomeCompanionActionInputField | SomeCompanionFeedbackInputField)[] | undefined,
): boolean {
	if (!options) return false

	for (const option of options) {
		if ('required' in option && typeof option.required === 'boolean') return true
	}

	return false
}

const SpecialChars = /~\//g

export function translateToJsonPointer(pointer: readonly (string | number)[]): readonly (string | number)[] {
	const components = Object.entries(pointer);

	for (const [i, component] of Object.entries(pointer)) {
		if (typeof component !== 'string' || !SpecialChars.test(component)) {
			continue;
		}


	}
	return pointer
}
