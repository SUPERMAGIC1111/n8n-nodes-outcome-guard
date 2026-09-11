const { OutcomeGuard } = require('../dist/nodes/OutcomeGuard/OutcomeGuard.node.js');

function makeContext(items, params) {
	return {
		getInputData: () => items,
		getNodeParameter: (name, i) => params(name, i),
		getNode: () => ({ name: 'Outcome Guard' }),
		helpers: {
			httpRequest: async () => ({ data: { status: 'confirmed' } }),
		},
	};
}

async function run(name, items, params) {
	const node = new OutcomeGuard();
	try {
		const result = await node.execute.call(makeContext(items, params));
		console.log(`[PASS-THROUGH] ${name}:`, JSON.stringify(result[0][0].json.outcomeGuard));
	} catch (err) {
		console.log(`[THROWN ERROR]  ${name}:`, err.message);
	}
}

(async () => {
	// 1. Hidden error in a 200 response -> should THROW
	await run(
		'HTTP 200 with hidden error',
		[{ json: { status: 200 } }],
		(name) => {
			if (name === 'checkType') return 'noErrorKeyword';
			if (name === 'responseBody') return '{"success": false, "message": "insufficient funds"}';
			if (name === 'errorKeywords') return 'error,failed,"success":false';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 2. Clean response -> should PASS
	await run(
		'Clean response',
		[{ json: { status: 200 } }],
		(name) => {
			if (name === 'checkType') return 'noErrorKeyword';
			if (name === 'responseBody') return '{"success": true, "id": "abc123"}';
			if (name === 'errorKeywords') return 'error,failed,"success":false';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 3. Field equals mismatch -> should THROW
	await run(
		'Field equals mismatch',
		[{ json: { status: 'pending' } }],
		(name) => {
			if (name === 'checkType') return 'fieldEquals';
			if (name === 'fieldValue') return 'pending';
			if (name === 'expectedValue') return 'confirmed';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 4. httpRecheck confirms outcome -> should PASS
	await run(
		'HTTP re-check confirms record',
		[{ json: { id: 42 } }],
		(name) => {
			if (name === 'checkType') return 'httpRecheck';
			if (name === 'verifyUrl') return 'https://example.com/records/42';
			if (name === 'expectedFieldPath') return 'data.status';
			if (name === 'expectedFieldValue') return 'confirmed';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 5. Failure with onFailure = tag -> should PASS-THROUGH with passed:false
	await run(
		'Failure but tagged instead of thrown',
		[{ json: { status: 'pending' } }],
		(name) => {
			if (name === 'checkType') return 'fieldEquals';
			if (name === 'fieldValue') return 'pending';
			if (name === 'expectedValue') return 'confirmed';
			if (name === 'onFailure') return 'tag';
		},
	);
})();
