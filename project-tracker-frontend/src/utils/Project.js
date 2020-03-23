import {convertUnixTimeToDate} from "./utils";

class Project {
    /*
        "metaData": {
            "IlabRequest": "IGO-013956",
            "ReceivedDate": 1557515778432,
            "RecentDeliveryDate": null,
            "TATFromReceiving": "03 days 20 hours and 35 min.",
            "GroupLeader": "Kety Huberman",
            "LabHeadEmail": "huangfud@mskcc.org",
            "LaboratoryHead": "Danwei Huangfu",
            "TATFromInProcessing": "00 days 22 hours and 26 min.",
            "Investigator": "Gary Dixon",
            "ProjectManager": "NO PM"
        }
     */
    // API Responses
    #metaData;
    #requestId;
    #bankedSampleId;
    #stages;
    #samples;
    #igoComplete;

    getSamples() {
        return this.#samples;
    }

    getRequestId() {
        return this.#requestId;
    }
    getIgoComplete() {
        return this.#igoComplete;
    }

    /**
     * RecentDeliveryDate is only set on projects that are IGO Complete
     * @returns {*|number}
     */
    getRecentDeliveryDate() {
        return this.#metaData['RecentDeliveryDate'];
    }

    /**
     * Turn-Around Time
     * @returns {*|string}
     */
    getTATFromReceiving() {
        return this.#metaData['RecentDeliveryDate'] || "";
    }

    getGroupLeader() {
        return this.#metaData['GroupLeader'] || "";
    }

    getLabHeadEmail() {
        return this.#metaData['LabHeadEmail'] || "";
    }

    getLabHead() {
        return this.#metaData['LaboratoryHead'] || "";
    }

    getTATFromInProcessing() {
        return this.#metaData['TATFromInProcessing'] || '';
    }

    getInvestigator() {
        return this.#metaData['Investigator'] || '';
    }

    getProjectManager() {
        return this.#metaData['ProjectManager'] || '';
    }

    getStages() {
        return this.#stages;
    }

    getStartTime() {
        return this.#metaData['ReceivedDate'] || 0;
    }

    // TODO
    getUpdateTime() {
        return 0;
    }

    processRequest(data){
        const request = data['request'] || {};

        const metaData = request['metaData'] || {};
        const requestId = request['requestId'] || '';
        const bankedSampleId = request['bankedSampleId'] || '';
        const stages = request['stages'] || [];
        const samples = request['samples'] || [];
        const igoComplete = request['igoComplete'] || false;

        this.#metaData = metaData;
        this.#requestId = requestId;
        this.#bankedSampleId = bankedSampleId;
        this.#stages = stages;
        this.#samples = this.processSamples(samples);
        this.#igoComplete = igoComplete;
    }

    /**
     * Returns an enriched list of samples in a format acceptable by the react-d3-tree library
     * See - https://www.npmjs.com/package/react-d3-tree#styling
     * ENRICHMENTS:
     *  - nodeSvgShape
     *  - recordId -> name
     *  - Removal of unneeded attributes
     *  - Formatting of times
     */
    processSamples(samples) {
        return samples.map(sample => {
            const root = sample.root;
            const stack = [ root ];
            let next, attributes;
            while(stack.length > 0){
                next = stack.pop();

                attributes = next.attributes || {};

                next['name'] = `${next['recordId']}`;
                next['nodeSvgShape'] = {
                    shape: 'circle',
                    shapeProps: {
                        r: 10,
                        fill: attributes.failed ? 'red' : attributes.completed ? 'green' : 'yellow'
                    },
                };

                delete next['attributes'].totalSamples;
                delete next['attributes'].failed;
                delete next['attributes'].completed;
                delete next['attributes'].complete;


                next['attributes'].startTime = convertUnixTimeToDate(next['attributes'].startTime);
                next['attributes'].updateTime = convertUnixTimeToDate(next['attributes'].updateTime);

                for(const child of next.children){
                    stack.push(child)
                }
            }

            sample.root = root;

            return sample;
        })
    }

    constructor(data){
        this.processRequest(data);
    }
}

export default Project;
