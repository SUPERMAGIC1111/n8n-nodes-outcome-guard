const { OutcomeGuard } = require('../dist/nodes/OutcomeGuard/OutcomeGuard.node.js');

function makeContext(items, params, httpRequestMock) {
	return {
		getInputData: () => items,
		// Mirrors real n8n behavior: an explicit default (3rd arg) is used when
		// the test doesn't care about that parameter, instead of silently
		// returning undefined and breaking anything that expects an array/object.
		getNodeParameter: (name, i, defaultValue) => {
			const value = params(name, i);
			return value === undefined ? defaultValue : value;
		},
		getNode: () => ({ name: 'Outcome Guard' }),
		helpers: {
			httpRequest: httpRequestMock || (async () => ({ data: { status: 'confirmed' } })),
		},
	};
}

async function run(name, items, params, httpRequestMock) {
	const node = new OutcomeGuard();
	try {
		const result = await node.execute.call(makeContext(items, params, httpRequestMock));
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

	// 6. A harmless field name containing "error" as a substring -> must PASS, not false-positive
	await run(
		'Harmless "errorCount": 0 field must not false-positive',
		[{ json: {} }],
		(name) => {
			if (name === 'checkType') return 'noErrorKeyword';
			if (name === 'responseBody') return '{"errorCount": 0, "data": "ok"}';
			if (name === 'errorKeywords') return 'error,failed,exception';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 7. A genuine whole-word "failed" -> must still THROW (word-boundary fix must not break true positives)
	await run(
		'Genuine whole-word "failed" must still be caught',
		[{ json: {} }],
		(name) => {
			if (name === 'checkType') return 'noErrorKeyword';
			if (name === 'responseBody') return '{"status": "failed"}';
			if (name === 'errorKeywords') return 'error,failed,exception';
			if (name === 'onFailure') return 'throw';
		},
	);

	// 8. Different casing with caseInsensitive=false (default) -> must THROW
	await run(
		'"Confirmed" vs "confirmed", case-sensitive (default) -> should fail',
		[{ json: { status: 'Confirmed' } }],
		(name) => {
			if (name === 'checkType') return 'fieldEquals';
			if (name === 'fieldValue') return 'Confirmed';
			if (name === 'expectedValue') return 'confirmed';
			if (name === 'caseInsensitive') return false;
			if (name === 'onFailure') return 'throw';
		},
	);

	// 9. Same casing mismatch, but caseInsensitive=true -> must PASS
	await run(
		'"Confirmed" vs "confirmed", case-insensitive -> should pass',
		[{ json: { status: 'Confirmed' } }],
		(name) => {
			if (name === 'checkType') return 'fieldEquals';
			if (name === 'fieldValue') return 'Confirmed';
			if (name === 'expectedValue') return 'confirmed';
			if (name === 'caseInsensitive') return true;
			if (name === 'onFailure') return 'throw';
		},
	);

	// 10. Incidental whitespace from a sloppy API -> must PASS even without caseInsensitive
	await run(
		'"confirmed " with trailing space -> should pass (whitespace always trimmed)',
		[{ json: { status: 'confirmed ' } }],
		(name) => {
			if (name === 'checkType') return 'fieldEquals';
			if (name === 'fieldValue') return 'confirmed ';
			if (name === 'expectedValue') return 'confirmed';
			if (name === 'caseInsensitive') return false;
			if (name === 'onFailure') return 'throw';
		},
	);

	// 11. Headers must actually reach the verification HTTP request (e.g. Authorization: Bearer ...)
	let capturedRequest = null;
	await run(
		'Custom headers are sent with the re-check request',
		[{ json: { id: 42 } }],
		(name) => {
			if (name === 'checkType') return 'httpRecheck';
			if (name === 'verifyUrl') return 'https://api.example.com/records/42';
			if (name === 'headers.header') return [{ name: 'Authorization', value: 'Bearer secret-token' }];
			if (name === 'expectedFieldPath') return 'data.status';
			if (name === 'expectedFieldValue') return 'confirmed';
			if (name === 'onFailure') return 'throw';
		},
		async (options) => {
			capturedRequest = options;
			return { data: { status: 'confirmed' } };
		},
	);
	const gotAuthHeader = capturedRequest && capturedRequest.headers && capturedRequest.headers.Authorization;
	console.log(
		gotAuthHeader === 'Bearer secret-token'
			? '[PASS]          Authorization header reached the HTTP request as expected'
			: `[FAIL]          Authorization header missing or wrong: ${JSON.stringify(capturedRequest)}`,
	);
})();
