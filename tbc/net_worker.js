//#region ui/worker/utils.ts
var noop = () => {};
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
//#endregion
//#region ui/worker/worker_interface.ts
/**
* Communication with the UI.
*/
var WorkerInterface = class {
	constructor(handlers) {
		this._workerId = "";
		this.handlers = handlers;
		addEventListener("message", async ({ data }) => {
			const { id, msg, inputData } = data;
			if (msg === "setID") {
				this._workerId = id;
				this.postMessage({ msg: "idConfirm" });
				return;
			}
			const handlerFunc = this.handlers?.[msg];
			if (!handlerFunc) {
				console.error(`Request msg: ${msg}, id: ${id}, is not handled!`);
				return;
			}
			const progressCallback = (prog) => {
				this.postMessage({
					msg: "progress",
					id: `${id}progress`,
					outputData: prog
				});
			};
			const outputData = await handlerFunc(inputData, progressCallback, id, msg);
			this.postMessage({
				msg,
				id,
				outputData
			});
		});
	}
	postMessage(m) {
		postMessage(m);
	}
	get workerId() {
		return this._workerId;
	}
	/**
	* Tell UI that the worker is ready.
	* @param isWasm true if worker is using wasm.
	*/
	ready(isWasm) {
		this.postMessage({
			msg: "ready",
			outputData: new Uint8Array([+isWasm])
		});
	}
};
//#endregion
//#region ui/worker/worker_http.ts
var defaultRequestOptions = {
	method: "POST",
	headers: { "Content-Type": "application/x-protobuf" }
};
var setupHttpWorker = (baseURL) => {
	const makeHttpApiRequest = (endPoint, inputData, requestId) => fetch(`${baseURL}/${endPoint}?requestId=${requestId}`, {
		...defaultRequestOptions,
		body: inputData
	});
	const syncHandler = async (inputData, _, id, msg) => {
		const ab = await (await makeHttpApiRequest(msg, inputData, id)).arrayBuffer();
		return new Uint8Array(ab);
	};
	const asyncHandler = async (inputData, progress, id, msg) => {
		const asyncApiResult = await syncHandler(inputData, noop, id, msg);
		let outputData = /* @__PURE__ */ new Uint8Array();
		while (true) {
			const progressResponse = await makeHttpApiRequest("asyncProgress", asyncApiResult, id);
			if ([204, 404].includes(progressResponse.status)) break;
			const ab = await progressResponse.arrayBuffer();
			outputData = new Uint8Array(ab);
			progress(outputData);
			await sleep(500);
		}
		return outputData;
	};
	const noWasmConcurrency = (_, __, msg) => {
		const errmsg = `Tried to use ${msg} while using a http worker! This is only supported for wasm!`;
		console.error(errmsg);
		return /* @__PURE__ */ new Uint8Array();
	};
	new WorkerInterface({
		computeStats: syncHandler,
		computeStatsJson: syncHandler,
		raidSim: syncHandler,
		raidSimJson: syncHandler,
		raidSimAsync: asyncHandler,
		statWeights: syncHandler,
		statWeightsAsync: asyncHandler,
		statWeightRequests: syncHandler,
		statWeightCompute: syncHandler,
		raidSimRequestSplit: noWasmConcurrency,
		raidSimResultCombination: noWasmConcurrency,
		abortById: syncHandler
	}).ready(false);
};
//#endregion
//#region ui/worker/net_worker.ts
setupHttpWorker("");
//#endregion
