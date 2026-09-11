import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

function getByPath(obj: unknown, path: string): unknown {
	if (!path) return obj;
	return path
		.split('.')
		.reduce<unknown>((acc, key) => {
			if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
				return (acc as Record<string, unknown>)[key];
			}
			return undefined;
		}, obj);
}

export class OutcomeGuard implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Outcome Guard',
		name: 'outcomeGuard',
		icon: 'file:outcomeGuard.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["checkType"]}}',
		description:
			'Catch silent failures: verify what actually happened, not just whether the previous node threw an error',
		defaults: {
			name: 'Outcome Guard',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Check Type',
				name: 'checkType',
				type: 'options',
				options: [
					{
						name: 'Field Exists / Not Empty',
						value: 'fieldExists',
						description: 'Fail if an expected field is missing, null, or empty',
					},
					{
						name: 'Field Equals',
						value: 'fieldEquals',
						description: 'Fail if a field does not match the expected value',
					},
					{
						name: 'Response Has Hidden Error',
						value: 'noErrorKeyword',
						description:
							'Fail if the response body contains error indicators even though the step reported success (e.g. HTTP 200 with an error payload)',
					},
					{
						name: 'Re-Fetch URL and Check Field',
						value: 'httpRecheck',
						description:
							'Call an API afterwards to independently confirm the real-world result actually happened',
					},
				],
				default: 'fieldExists',
				description: 'What kind of real-world outcome to verify',
			},
			{
				displayName: 'Field (Expression)',
				name: 'fieldValue',
				type: 'string',
				default: '',
				placeholder: '={{ $json.status }}',
				description: 'The value to check — usually an expression pointing at the field to verify',
				displayOptions: {
					show: {
						checkType: ['fieldEquals', 'fieldExists'],
					},
				},
			},
			{
				displayName: 'Expected Value',
				name: 'expectedValue',
				type: 'string',
				default: '',
				description: 'The value the field above must equal',
				displayOptions: {
					show: {
						checkType: ['fieldEquals'],
					},
				},
			},
			{
				displayName: 'Response Body (Expression)',
				name: 'responseBody',
				type: 'string',
				default: '={{ JSON.stringify($json) }}',
				description: 'The raw response/body to scan for hidden error indicators',
				displayOptions: {
					show: {
						checkType: ['noErrorKeyword'],
					},
				},
			},
			{
				displayName: 'Error Keywords',
				name: 'errorKeywords',
				type: 'string',
				default: 'error,failed,exception,"success":false,"ok":false',
				description:
					'Comma-separated keywords/phrases that indicate a hidden failure even on an HTTP 200',
				displayOptions: {
					show: {
						checkType: ['noErrorKeyword'],
					},
				},
			},
			{
				displayName: 'Verification URL',
				name: 'verifyUrl',
				type: 'string',
				default: '',
				placeholder: '={{ "https://api.example.com/records/" + $json.id }}',
				description:
					'URL to call AFTER the main action to independently confirm the record/result actually exists',
				displayOptions: {
					show: {
						checkType: ['httpRecheck'],
					},
				},
			},
			{
				displayName: 'Expected Field Path',
				name: 'expectedFieldPath',
				type: 'string',
				default: '',
				placeholder: 'data.status',
				description:
					'Dot-path into the verification response that must match the expected value below',
				displayOptions: {
					show: {
						checkType: ['httpRecheck'],
					},
				},
			},
			{
				displayName: 'Expected Field Value',
				name: 'expectedFieldValue',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						checkType: ['httpRecheck'],
					},
				},
			},
			{
				displayName: 'On Failure',
				name: 'onFailure',
				type: 'options',
				options: [
					{
						name: 'Throw Error (Recommended — Triggers Your n8n Error Workflow)',
						value: 'throw',
					},
					{
						name: 'Continue and Tag Item as Failed',
						value: 'tag',
					},
				],
				default: 'throw',
				description: 'What to do when the outcome check fails',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const checkType = this.getNodeParameter('checkType', i) as string;
			const onFailure = this.getNodeParameter('onFailure', i) as string;

			let passed = true;
			let reason = '';

			try {
				if (checkType === 'fieldExists') {
					const value = this.getNodeParameter('fieldValue', i);
					passed = value !== undefined && value !== null && value !== '';
					reason = `Expected field to be present and non-empty, got: ${JSON.stringify(value)}`;
				} else if (checkType === 'fieldEquals') {
					const value = this.getNodeParameter('fieldValue', i);
					const expected = this.getNodeParameter('expectedValue', i) as string;
					passed = String(value) === String(expected);
					reason = `Expected field to equal "${expected}", got: ${JSON.stringify(value)}`;
				} else if (checkType === 'noErrorKeyword') {
					const body = this.getNodeParameter('responseBody', i) as string;
					const keywordsRaw = this.getNodeParameter('errorKeywords', i) as string;
					const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
					const bodyNormalized = normalize(body);
					const originalKeywords = keywordsRaw
						.split(',')
						.map((k) => k.trim())
						.filter(Boolean);
					// A plain word like "error" must match as a whole word — otherwise it also
					// matches harmless fields like "errorCount": 0 or "hasError": false.
					// A punctuation-containing pattern like "success":false is matched as a
					// literal substring instead, since word boundaries don't apply to it.
					const found = originalKeywords.find((k) => {
						const normalizedK = normalize(k);
						if (/^\w+$/.test(normalizedK)) {
							return new RegExp(`\\b${normalizedK}\\b`).test(bodyNormalized);
						}
						return bodyNormalized.includes(normalizedK);
					});
					passed = !found;
					reason = found
						? `Response looked successful but contains a hidden failure indicator: "${found}"`
						: '';
				} else if (checkType === 'httpRecheck') {
					const verifyUrl = this.getNodeParameter('verifyUrl', i) as string;
					const expectedFieldPath = this.getNodeParameter('expectedFieldPath', i) as string;
					const expectedFieldValue = this.getNodeParameter('expectedFieldValue', i) as string;

					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: verifyUrl,
						json: true,
					});

					const actual = getByPath(response, expectedFieldPath);
					passed = String(actual) === String(expectedFieldValue);
					reason = `Re-checked ${verifyUrl} — expected "${expectedFieldPath}" to equal "${expectedFieldValue}", got: ${JSON.stringify(
						actual,
					)}`;
				}
			} catch (error) {
				passed = false;
				reason = `The verification check itself failed to run: ${(error as Error).message}`;
			}

			const item = items[i];

			if (!passed) {
				if (onFailure === 'throw') {
					throw new NodeOperationError(
						this.getNode(),
						`Outcome Guard caught a silent failure: ${reason}`,
						{ itemIndex: i },
					);
				}

				returnData.push({
					json: {
						...item.json,
						outcomeGuard: { passed: false, reason },
					},
					pairedItem: { item: i },
				});
				continue;
			}

			returnData.push({
				json: {
					...item.json,
					outcomeGuard: { passed: true },
				},
				pairedItem: { item: i },
			});
		}

		return [returnData];
	}
}
