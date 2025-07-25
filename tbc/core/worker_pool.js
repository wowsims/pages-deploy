import { REPO_NAME } from '/tbc/core/constants/other.js';
import { ComputeStatsRequest, ComputeStatsResult } from './proto/api.js';
import { GearListRequest, GearListResult } from './proto/api.js';
import { RaidSimRequest, RaidSimResult, ProgressMetrics } from './proto/api.js';
import { StatWeightsRequest, StatWeightsResult } from './proto/api.js';
const SIM_WORKER_URL = `/${REPO_NAME}/sim_worker.js`;
export class WorkerPool {
    constructor(numWorkers) {
        this.workers = [];
        for (let i = 0; i < numWorkers; i++) {
            this.workers.push(new SimWorker());
        }
    }
    getLeastBusyWorker() {
        return this.workers.reduce((curMinWorker, nextWorker) => curMinWorker.numTasksRunning < nextWorker.numTasksRunning ?
            curMinWorker : nextWorker);
    }
    async makeApiCall(requestName, request) {
        return await this.getLeastBusyWorker().doApiCall(requestName, request, "");
    }
    async getGearList(request) {
        const result = await this.makeApiCall('gearList', GearListRequest.toBinary(request));
        return GearListResult.fromBinary(result);
    }
    async computeStats(request) {
        const result = await this.makeApiCall('computeStats', ComputeStatsRequest.toBinary(request));
        return ComputeStatsResult.fromBinary(result);
    }
    async statWeightsAsync(request, onProgress) {
        console.log('Stat weights request: ' + StatWeightsRequest.toJsonString(request));
        const worker = this.getLeastBusyWorker();
        const id = worker.makeTaskId();
        // Add handler for the progress events
        worker.addPromiseFunc(id + "progress", this.newProgressHandler(id, worker, onProgress), (err) => { });
        // Now start the async sim
        const resultData = await worker.doApiCall('statWeightsAsync', StatWeightsRequest.toBinary(request), id);
        const result = ProgressMetrics.fromBinary(resultData);
        console.log('Stat weights result: ' + StatWeightsResult.toJsonString(result.finalWeightResult));
        return result.finalWeightResult;
    }
    async raidSimAsync(request, onProgress) {
        console.log('Raid sim request: ' + RaidSimRequest.toJsonString(request));
        const worker = this.getLeastBusyWorker();
        const id = worker.makeTaskId();
        // Add handler for the progress events
        worker.addPromiseFunc(id + "progress", this.newProgressHandler(id, worker, onProgress), (err) => { });
        // Now start the async sim
        const resultData = await worker.doApiCall('raidSimAsync', RaidSimRequest.toBinary(request), id);
        const result = ProgressMetrics.fromBinary(resultData);
        // Don't print the logs because it just clogs the console.
        const resultJson = RaidSimResult.toJson(result.finalRaidResult);
        delete resultJson['logs'];
        console.log('Raid sim result: ' + JSON.stringify(resultJson));
        return result.finalRaidResult;
    }
    newProgressHandler(id, worker, onProgress) {
        return (progressData) => {
            var progress = ProgressMetrics.fromBinary(progressData);
            onProgress(progress);
            // If we are done, stop adding the handler.
            if (progress.finalRaidResult != null || progress.finalWeightResult != null) {
                return;
            }
            worker.addPromiseFunc(id + "progress", this.newProgressHandler(id, worker, onProgress), (err) => { });
        };
    }
}
class SimWorker {
    constructor() {
        this.numTasksRunning = 0;
        this.taskIdsToPromiseFuncs = {};
        this.worker = new window.Worker(SIM_WORKER_URL);
        let resolveReady = null;
        this.onReady = new Promise((_resolve, _reject) => {
            resolveReady = _resolve;
        });
        this.worker.onmessage = event => {
            if (event.data.msg == 'ready') {
                this.worker.postMessage({ msg: 'setID', id: '1' });
                resolveReady();
            }
            else if (event.data.msg == 'idconfirm') {
                // Do nothing
            }
            else {
                const id = event.data.id;
                if (!this.taskIdsToPromiseFuncs[id]) {
                    console.warn('Unrecognized result id: ' + id);
                    return;
                }
                const promiseFuncs = this.taskIdsToPromiseFuncs[id];
                delete this.taskIdsToPromiseFuncs[id];
                this.numTasksRunning--;
                promiseFuncs[0](event.data.outputData);
            }
        };
    }
    addPromiseFunc(id, callback, onError) {
        this.taskIdsToPromiseFuncs[id] = [callback, onError];
    }
    makeTaskId() {
        let id = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 16; i++) {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return id;
    }
    async doApiCall(requestName, request, id) {
        this.numTasksRunning++;
        await this.onReady;
        const taskPromise = new Promise((resolve, reject) => {
            if (!id) {
                id = this.makeTaskId();
            }
            this.taskIdsToPromiseFuncs[id] = [resolve, reject];
            this.worker.postMessage({
                msg: requestName,
                id: id,
                inputData: request,
            });
        });
        return await taskPromise;
    }
}
