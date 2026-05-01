// @ts-check

/* eslint-disable n/no-extraneous-import */
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url'
import Ajv2020 from 'ajv/dist/2020.js'
import standaloneCode from 'ajv/dist/standalone/index.js'
import { compile } from 'json-schema-to-typescript'
import { $ } from 'zx'

const SchemaVersion = 'https://json-schema.org/draft/2020-12/schema'

const SchemaProtocol = 'schemas'

/**
 * @typedef {`${typeof SchemaProtocol}://${string}`} SchemaId
 */

/**
 * @param {string} path
 * @returns {SchemaId}
 */
const getSchemaId = (path) => `${SchemaProtocol}://${path}`

const BonjourQuery = 'bonjour-query'
const ModuleManifest = 'module-manifest'
const LooseModuleManifest = 'loose-module-manifest'

const BonjourQueryId = getSchemaId(BonjourQuery)
const LooseModuleManifestId = getSchemaId(LooseModuleManifest)
const ModuleManifestId = getSchemaId(ModuleManifest)

/**
 * @param {boolean} loose
 * @returns {import('ajv').SchemaObject}
 */
function generateModuleSchema(loose) {
	/**
	 * @param {string} pattern
	 * @returns {Record<string, never> | { pattern: string }}
	 */
	const pattern = (pattern) => (loose ? {} : { pattern })

	return {
		$schema: SchemaVersion,
		$id: getSchemaId(loose ? LooseModuleManifest : ModuleManifest),
		type: 'object',
		title: loose ? 'LooseModuleManifest' : 'ModuleManifest',
		properties: {
			$schema: {
				type: 'string',
			},
			type: {
				type: 'string',
				enum: ['connection'],
				description: 'Type of module. Must be: connection',
			},
			id: {
				type: 'string',
				description: 'Unique identifier for the module',
				...pattern('^((?!companion-module-your-module-name).)*$'),
			},
			name: {
				type: 'string',
				description: 'Name of the module',
				...pattern('^((?!companion-module-your-module-name).)*$'),
			},
			shortname: {
				type: 'string',
				...pattern('^((?!module-shortname).)*$'),
			},
			description: {
				type: 'string',
				description: 'Description of the module ',
				...pattern('^((?!A short one line description of your module).)*$'),
			},
			version: {
				type: 'string',
				description: 'Current version of the module',
			},
			isPrerelease: {
				type: 'boolean',
				description: 'Is this a pre-release version',
			},
			license: {
				type: 'string',
				description: 'SPDX identifier for license of the module',
			},
			repository: {
				type: 'string',
				description: 'URL to the source repository',
			},
			bugs: {
				type: 'string',
				description: 'URL to bug tracker',
			},
			maintainers: {
				type: 'array',
				description: 'List of active maintainers',
				uniqueItems: true,
				items: {
					type: 'object',
					title: 'ModuleManifestMaintainer',
					properties: {
						name: {
							type: 'string',
							...pattern('^((?!Your name).)*$'),
						},
						email: {
							type: 'string',
							...pattern('^((?!Your email).)*$'),
						},
						github: {
							type: 'string',
						},
						url: {
							type: 'string',
						},
					},
					required: ['name'],
					additionalProperties: false,
				},
			},
			legacyIds: {
				type: 'array',
				description: 'If the module had a different unique identifier previously, then specify it here',
				uniqueItems: true,
				items: {
					type: 'string',
				},
			},
			runtime: {
				type: 'object',
				title: 'ModuleManifestRuntime',
				description: 'Information on how to execute the module',
				properties: {
					type: {
						type: 'string',
						description: 'Type of the module. Must be: node22',
						enum: ['node22'],
					},
					api: {
						type: 'string',
						description: 'Which host-api does it use. In the future alternate options will be allowed',
						enum: ['nodejs-ipc'],
					},
					apiVersion: {
						type: 'string',
						description: 'The version of the host-api used',
					},
					entrypoint: {
						type: 'string',
						description: 'Entrypoint to pass to the runtime. eg index.js',
					},
					permissions: {
						type: 'object',
						description:
							'Permissions required by the module. This is used to inform the user of the permissions required by the module.\nNote: this requires the node22 or newer runtime',
						properties: {
							'worker-threads': {
								type: 'boolean',
								description: 'Enable if the module uses worker threads',
							},
							'child-process': {
								type: 'boolean',
								description: 'Enable if the module uses child processes',
							},
							'native-addons': {
								type: 'boolean',
								description: 'Enable if the module uses native addons',
							},
							filesystem: {
								type: 'boolean',
								description: 'Enable if the module requires read/write access to the filesystem',
							},
							'insecure-algorithms': {
								type: 'boolean',
								description: 'Enable if the module requires legacy openssl algorithms',
							},
						},
						additionalProperties: false,
					},
				},
				required: ['type', 'api', 'apiVersion', 'entrypoint'],
			},
			manufacturer: {
				type: 'string',
				...pattern('^((?!Your company).)*$'),
			},
			products: {
				type: 'array',
				uniqueItems: true,
				items: {
					type: 'string',
					...pattern('^((?!Your product).)*$'),
				},
				minItems: 1,
			},
			keywords: {
				type: 'array',
				uniqueItems: true,
				items: {
					type: 'string',
				},
			},
			bonjourQueries: {
				type: 'object',
				description:
					"If the device or software for your module supports bonjour announcements, Companion will offer an easy way to watch for these announcements.\nEach query you define must have a matching config field of type 'bonjour-device' with the same name",
				patternProperties: {
					'': {
						oneOf: [
							{
								$ref: BonjourQueryId,
							},
							{
								type: 'array',
								items: {
									$ref: BonjourQueryId,
								},
							},
						],
					},
				},
			},
		},
		required: [
			'type',
			'id',
			'name',
			'shortname',
			'description',
			'version',
			'license',
			'repository',
			'bugs',
			'maintainers',
			'legacyIds',
			'runtime',
			'manufacturer',
			'products',
			'keywords',
		],
	}
}

const schemas = {
	[BonjourQuery]: /** @type {import('ajv').SchemaObject} */ ({
		$schema: SchemaVersion,
		$id: BonjourQueryId,
		type: 'object',
		title: 'ModuleBonjourQuery',
		description: '',
		properties: {
			type: {
				type: 'string',
			},
			protocol: {
				type: 'string',
				enum: ['tcp', 'udp'],
			},
			port: {
				type: 'number',
			},
			txt: {
				type: 'object',
				description:
					"Match on any txt values returned in the query. This is useful to filter out devices of the same 'type' that are not supported",
				patternProperties: {
					'': {
						type: 'string',
					},
				},
			},
			addressFamily: {
				type: 'string',
				description:
					'The address family to use when connecting to the device. If not specified, it will default to ipv4. This is useful for devices or modules that do not support ipv4 and ipv6, but discovery will find them on both',
				enum: ['ipv4', 'ipv6', 'ipv4+6'],
			},
		},
		required: ['type', 'protocol'],
	}),
	[LooseModuleManifest]: generateModuleSchema(true),
	[ModuleManifest]: generateModuleSchema(false),
}

const IdRegexp = new RegExp(`^${SchemaProtocol}://(?<path>.+)$`)

/**
 * @param {string} url
 * @returns {string | null}
 */
function extractPath(url) {
	const path = IdRegexp.exec(url)?.groups?.path
	console.log(`extractPath path: ${path}`)
	if (!path || !(path in schemas)) return null
	return path
}

/**
 * @param {string} url
 * @returns {import('ajv').SchemaObject}
 */
function loadSchema(url) {
	console.log(`loadSchema ${url}`)
	const path = extractPath(url)
	console.log(`path: ${path}`)
	if (path === null) throw new Error(`path ${url} not found`)
	return schemas[/** @type {keyof typeof schemas} */ (path)]
}

/** @type {import('json-schema-to-typescript').Options['$refOptions']['resolve']} */
const schemaResolver = {
	file: undefined,
	[SchemaProtocol]: {
		order: 1,
		/**
		 * @param {import('@apidevtools/json-schema-ref-parser').FileInfo} file
		 */
		canRead(file) {
			console.log(`canRead for ${file.url}`)
			const res = extractPath(file.url) !== null
			console.log(`canRead returning ${res}`)
			return res
		},
		/**
		 * @param {import('@apidevtools/json-schema-ref-parser').FileInfo} file
		 */
		read(file) {
			console.log(`reading ${file.url}`)
			const result = JSON.stringify(loadSchema(file.url))
			console.log(`result is`, result)
			return result
		},
	},
}

// Compile Typescript definitions from the JSON schema
{
	const tsdefs = await compile(schemas[ModuleManifest], 'ModuleManifest', {
		additionalProperties: false,
		$refOptions: {
			resolve: schemaResolver,
		},
	})

	const outputPath = new URL('../generated/manifest.d.ts', import.meta.url)
	await fs.writeFile(outputPath, tsdefs)
}

// Compile validation routines.
{
	// The generated code be in esm export format:
	const ajv = new Ajv2020({
		schemas: Object.values(schemas),
		code: { source: true, esm: true },
		async loadSchema(uri) {
			return loadSchema(uri)
		},
	})

	for (const schema of Object.values(schemas)) {
		await ajv.compileAsync(schema)
	}

	const moduleCode = standaloneCode(ajv, {
		LooseModuleManifest: LooseModuleManifestId,
		ModuleManifest: ModuleManifestId,
	})

	// Now you can write the module code to file
	const outputPath = new URL('../generated/validate_manifest.js', import.meta.url)
	await fs.writeFile(outputPath, moduleCode)

	// the reference to ajv runtime makes some consumers grumpy, so pre-bundle it with esbuild
	await $`esbuild --bundle ${fileURLToPath(outputPath)} --outfile=${fileURLToPath(outputPath)} --target=node22 --platform=node --format=esm --allow-overwrite`
}

// Write out module manifest schema.
{
	const outputDir = new URL('../assets', import.meta.url)
	console.log(`outputDir: ${outputDir}`)
	await fs.mkdir(outputDir, { recursive: true })

	const outputPath = new URL('../assets/manifest.schema.json', import.meta.url)
	console.log(`outputPath: ${outputPath}`)
	await fs.writeFile(outputPath, JSON.stringify(schemas[ModuleManifest], null, '\t'))
}
