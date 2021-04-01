import {convertUnixTimeToDateStringFull} from "./utils";
import {REQ_receivedDate} from "./api-util";

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
            "ProjectManager": "NO PM",
            "bankedSampleId": "IGO-201927"
        }
     */
    #metaData;
    #requestId;         // IGO Id of Request
    #stages;            // List of tracking stages (E.g. "Awaiting Processing", "SampleQC")
    #samples;           // List of "Tree" of LIMS sample DataRecords that descend from the root sample record
    #igoComplete;       // Has the project been marked isIgoComplete
    #summary;           // Summary of progress of the request, i.e. tracking data
    #igoRequestInfo;    // Basic information used to initialize the project instance w/o tracking information

    /**
     * Creation of a project has two steps,
     *      1) constructor - initializes project w/ basic info
     *      2) addRequestTrackingInfo - provides tracking info for the request
     *
     * @param requestId
     * @param igoCompleteDate
     * @param receivedDate
     * @param recipe
     */
    constructor(requestId, igoCompleteDate, receivedDate, dueDate, recipe, isIgoComplete){
        this.#igoRequestInfo = { requestId, igoCompleteDate, receivedDate, dueDate, recipe };
        this.#igoComplete = isIgoComplete;
    }

    /**
     * Returns whether the Project instance has been populated with tracking information via @addRequestTrackingInfo
     * @returns {boolean}
     */
    isEnriched() {
        return ( this.#metaData !== undefined &&
            this.#stages !== undefined &&
            this.#samples !== undefined &&
            this.#summary !== undefined &&
            this.#igoComplete !== undefined );
    }

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
        const summary = this.#summary || {};
        return summary['isIgoComplete'] || false;
    }

    /**
     * Returns whether the projects has been delivered by IGO
     *
     * @returns {*|boolean}
     */
    isDelivered() {
        const summary = this.#summary || {};
        return summary['isDelivered'] || false;
    }

    /**
     * Returns date IGO project was marked complete
     *
     * @returns {*}
     */
    getIgoCompleteDate() {
        return this.#igoRequestInfo.igoCompleteDate;
    }

    getDueDate() {
        return this.#igoRequestInfo.dueDate;
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
     * Returns recipe from metadata
     * @returns {*|string}
     */
    getRecipe() {
        return this.#igoRequestInfo.recipe || 'Not Available';
    }

    /**
     * RecentDeliveryDate is only set on projects that are IGO Complete
     * @returns {*|number}
     */
    getRecentDeliveryDate() {
        return this.#summary['RecentDeliveryDate'] || 'Not Available';
    }

    /**
     * Retruns date project was received
     *
     * @returns {*}
     */
    getReceivedDate() {
        return this.#igoRequestInfo['receivedDate'];
    }

    /**
     * Turn-Around Time
     * @returns {*|string}
     */
    getTATFromReceiving() {
        return this.#metaData['RecentDeliveryDate'] || 'Not Available';
    }

    getServiceId() {
        return this.#metaData['serviceId'];
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

    getSourceRequests() {
        return this.#metaData['sourceRequests'] || [];
    }

    getChildRequests() {
        return this.#metaData['childRequests'] || [];
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
     * Enriches the request instance with sample-tracking information
     *
     * @param request
     */
    addRequestTrackingInfo(request){
        const metaData = request['metaData'] || {};
        const requestId = request['requestId'] || '';
        const bankedSampleId = request['bankedSampleId'] || '';
        const stages = request['stages'] || [];
        const samples = request['samples'] || [];
        const igoComplete = request['igoComplete'] || false;
        const summary = request['summary'] || {};

        this.#metaData = metaData;
        this.#requestId = requestId;
        this.#stages = stages;
        this.#samples = this.processSamples(samples);
        this.#summary = summary;
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


                next['attributes'].startTime = convertUnixTimeToDateStringFull(next['attributes'].startTime);
                next['attributes'].updateTime = convertUnixTimeToDateStringFull(next['attributes'].updateTime);

                for(const child of next.children){
                    stack.push(child)
                }
            }

            sample.root = root;

            return sample;
        })
    }
}

export default Project;
