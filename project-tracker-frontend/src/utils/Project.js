import {convertUnixTimeToDateString} from "./utils";

class Project {
    // API Responses
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
    #metaData;
    #requestId;
    #bankedSampleId;
    #stages;
    #samples;
    #igoComplete;
    #summary;

    getSamples() {
        return this.#samples;
    }
    getRequestId() {
        return this.#requestId;
    }

    /**
     * Returns whether the project has been marked completed by IGO (This flag is the one used to indicate the project
     * has been delivered by IGO).
     *
     * @returns {*|boolean}
     */
    getIgoComplete() {
        return this.#igoComplete || false;
    }

    /**
     * Returns project summary information
     *
     *   "summary": {
     *       "total": 10,
     *       "RecentDeliveryDate": null,
     *       "stagesComplete": false,
     *       "isIgoComplete": false,
     *       "completed": 9,
     *       "failed": 0
     *   }
     */
    getSummary(){
        return this.#summary || {};
    }

    /**
     * RecentDeliveryDate is only set on projects that are IGO Complete
     * @returns {*|number}
     */
    getRecentDeliveryDate() {
        return this.#metaData['RecentDeliveryDate'] || 'Not Available';
    }

    /**
     * Turn-Around Time
     * @returns {*|string}
     */
    getTATFromReceiving() {
        return this.#metaData['RecentDeliveryDate'] || 'Not Available';
    }

    getGroupLeader() {
        return this.#metaData['GroupLeader'] || 'Not Available';
    }

    getLabHeadEmail() {
        return this.#metaData['LabHeadEmail'] || 'Not Available';
    }

    getLabHead() {
        return this.#metaData['LaboratoryHead'] || 'Not Available';
    }

    getTATFromInProcessing() {
        return this.#metaData['TATFromInProcessing'] || 'Not Available';
    }

    getInvestigator() {
        return this.#metaData['Investigator'] || 'Not Available';
    }

    getProjectManager() {
        return this.#metaData['ProjectManager'] || 'Not Available';
    }

    getStages() {
        return this.#stages;
    }

    /**
     * Returns the time the project was started
     *
     * @returns {*}
     */
    getStartTime() {
        return this.#metaData['ReceivedDate'];
    }

    /**
     * Returns when any of the project stages were last updated
     *
     * @returns {*}
     */
    getUpdateTime() {
        return this.#stages.reduce((accumulator, stage) => {
            const updateTime = stage['updateTime'] || 0;
            if(accumulator > updateTime){
                return accumulator;
            }
            return updateTime;
        }, 0);
    }

    /**
     * Transforms the service response into a Project instance for the client
     *
     * @param data
     */
    processRequest(data){
        const request = data['request'] || {};

        const metaData = request['metaData'] || {};
        const requestId = request['requestId'] || '';
        const bankedSampleId = request['bankedSampleId'] || '';
        const stages = request['stages'] || [];
        const samples = request['samples'] || [];
        const igoComplete = request['igoComplete'] || false;
        const summary = request['summary'] || {};

        this.#metaData = metaData;
        this.#requestId = requestId;
        this.#bankedSampleId = bankedSampleId;
        this.#stages = stages;
        this.#samples = this.processSamples(samples);
        this.#summary = summary;
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
                        fill: attributes.failed ? 'red' : attributes.complete ? 'green' : 'yellow'
                    },
                };

                delete next['attributes'].totalSamples;
                delete next['attributes'].failed;
                delete next['attributes'].completed;
                delete next['attributes'].complete;


                next['attributes'].startTime = convertUnixTimeToDateString(next['attributes'].startTime);
                next['attributes'].updateTime = convertUnixTimeToDateString(next['attributes'].updateTime);

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
