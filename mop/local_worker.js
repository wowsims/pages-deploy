//#region ui/worker/types.ts
/**
* API endpoints and exposed wasm function names. Also used as request identifier.
*/
var SimRequest = /* @__PURE__ */ function(SimRequest) {
	SimRequest["computeStats"] = "computeStats";
	SimRequest["computeStatsJson"] = "computeStatsJson";
	SimRequest["reforgeOptimizeAsync"] = "reforgeOptimizeAsync";
	SimRequest["raidSim"] = "raidSim";
	SimRequest["raidSimJson"] = "raidSimJson";
	SimRequest["raidSimAsync"] = "raidSimAsync";
	SimRequest["bulkSimAsync"] = "bulkSimAsync";
	SimRequest["bulkCombinationCount"] = "bulkCombinationCount";
	SimRequest["bulkCandidates"] = "bulkCandidates";
	SimRequest["statWeights"] = "statWeights";
	SimRequest["statWeightsAsync"] = "statWeightsAsync";
	SimRequest["statWeightRequests"] = "statWeightRequests";
	SimRequest["statWeightCompute"] = "statWeightCompute";
	SimRequest["raidSimRequestSplit"] = "raidSimRequestSplit";
	SimRequest["raidSimResultCombination"] = "raidSimResultCombination";
	SimRequest["abortById"] = "abortById";
	return SimRequest;
}({});
var ASYNC_SIM_REQUESTS = [
	"raidSimAsync",
	"statWeightsAsync",
	"bulkSimAsync",
	"reforgeOptimizeAsync"
];
//#endregion
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
			if (data.msg === "wasmModule") return;
			const { id, msg, inputData } = data;
			if (msg === "setID") {
				this._workerId = id;
				this.postMessage({ msg: "idConfirm" });
				return;
			}
			const handlerFunc = this.handlers?.[msg];
			if (!handlerFunc) {
				console.error(`Request msg: ${msg}, id: ${id}, is not handled!`);
				this.postMessage({
					msg,
					id,
					outputData: /* @__PURE__ */ new Uint8Array()
				});
				return;
			}
			const progressCallback = (prog) => {
				this.postMessage({
					msg: "progress",
					id: `${id}progress`,
					outputData: prog
				});
			};
			try {
				const outputData = await handlerFunc(inputData, progressCallback, id, msg);
				this.postMessage({
					msg,
					id,
					outputData
				});
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error(errorMessage);
				this.postMessage({
					msg,
					id,
					outputData: /* @__PURE__ */ new Uint8Array(),
					error: errorMessage
				});
			}
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
	const readHttpApiResponse = async (response, endPoint) => {
		if (!response.ok) {
			const body = await response.text();
			throw new Error(`HTTP ${response.status} from /${endPoint}: ${body.slice(0, 200)}`);
		}
		const ab = await response.arrayBuffer();
		return new Uint8Array(ab);
	};
	const syncHandler = async (inputData, _, id, msg) => {
		const response = await makeHttpApiRequest(msg, inputData, id);
		return readHttpApiResponse(response, msg);
	};
	const asyncHandler = async (inputData, progress, id, msg) => {
		const asyncApiResult = await syncHandler(inputData, noop, id, msg);
		let outputData = /* @__PURE__ */ new Uint8Array();
		while (true) {
			const progressResponse = await makeHttpApiRequest("asyncProgress", asyncApiResult, id);
			if ([204, 404].includes(progressResponse.status)) break;
			outputData = await readHttpApiResponse(progressResponse, "asyncProgress");
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
	const handlers = Object.fromEntries(Object.values(SimRequest).map((request) => [request, ASYNC_SIM_REQUESTS.includes(request) ? asyncHandler : syncHandler]));
	handlers[SimRequest.raidSimRequestSplit] = noWasmConcurrency;
	handlers[SimRequest.raidSimResultCombination] = noWasmConcurrency;
	new WorkerInterface(handlers).ready(false);
};
//#endregion
//#region ui/worker/local_worker.ts
setupHttpWorker("http://localhost:3333");
//#endregion
