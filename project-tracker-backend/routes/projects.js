var express = require("express");
const LimsController = require("../controllers/lims-controller");
var router = express.Router();

/* Application Endpoints */
router.get("/delivered", LimsController.getDeliveredProjects);
router.get("/undelivered", LimsController.getUndeliveredProjects);
router.get("/all", LimsController.getIgoRequests);
router.get("/:requestId", LimsController.getProjectTrackingData);

/* API Endpoints */
/**
 * @swagger
 * tags:
 *   name: RequestList
 *   description: Endpoint to retrieve list of delivered/pending IGO request summaries
 */
/**
 * @swagger
 * tags:
 *   name: RequestInfo
 *   description: Endpoint to retrieve tracking information of one request
 */
/**
 * @swagger
 * /all:
 *   get:
 *     summary: Retrieves list of IGO requests (sequencing & non-sequencing)
 *     tags:
 *       - RequestList
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         required: false
 *         description: maximum number of days from now for which to return requests
 *         example:
 *           7
 *     name: IGO Requests
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: List of IGO requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestListResponse'
 * /{requestId}:
 *   get:
 *     summary: Retrieve tracking information about input request Id
 *     tags:
 *       - RequestInfo
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the IGO request
 *         example:
 *           08822_AH
 *     name: Request Info
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Tracking information about IGO request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrackingInfoResponse'
 */
/**
 *  @swagger
 *  components:
 *    schemas:
 *      RequestListResponse:
 *        type: object
 *        required:
 *          - data
 *          - status
 *          - message
 *        properties:
 *          data:
 *            type: object
 *            description: payload of request list response
 *            required:
 *              - requests
 *            properties:
 *              requests:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    recentDeliveryDate:
 *                      type: integer
 *                      description: Timestamp when request was delivered (Not present for non-sequencing requests)
 *                    completedDate:
 *                      type: integer
 *                      description: Timestamp when request was marked complete by IGO (not delivery)
 *                    requestId:
 *                      type: string
 *                      description: ID of IGO request ID
 *                    requestType:
 *                      type: string
 *                      description: Type of request (e.g. "PED-PEG", "RNAExtraction", "IMPACT505")
 *                    investigator:
 *                      type: string
 *                      description: Investigator name of request
 *                    pi:
 *                      type: string
 *                      description: PI name
 *                    analysisRequested:
 *                      type: boolean
 *                    isCmoRequest:
 *                      type: boolean
 *                    recordId:
 *                      type: integer
 *                      description: IGO Request DataRecord ID
 *                    receivedDate:
 *                      type: integer
 *                      description: Date request was received by IGO
 *                    dueDate:
 *                      type: integer
 *                      description: Expected time for delivery of request
 *                    restStatus:
 *                      type: string
 *                    labHeadEmail:
 *                      type: string
 *                      description: Lab head email
 *                    qcAccessEmail:
 *                      type: string
 *                      description: Emails listed to have access to SampleQC report
 *                    dataAccessEmails:
 *                      type: string
 *                      description: Emails listed to have access to data
 *                    isIgoComplete:
 *                      type: boolean
 *                      description: Flag of whether a request has been marked complete by IGO
 *                    autorunnable:
 *                      type: boolean
 *                    deliveryDate:
 *                      type: integer
 *                      description: Timestamps of when data from the request has been delivered
 *                    igoCompleteDate:
 *                      type: integer
 *                      description: Timestamp of when the request has been marked IGO-complete
 *          status:
 *            type: boolean
 *            description: whether the request succeeded
 *          message:
 *            type: string
 *            description: success, or description of error
 *      TrackingInfoResponse:
 *        type: object
 *        required:
 *          - data
 *          - status
 *          - message
 *        properties:
 *          data:
 *            type: object
 *            description: Tracking information about request
 *            required:
 *              - summary
 *              - metaData
 *              - requestId
 *              - stages
 *              - samples
 *            properties:
 *              requestId:
 *                type: string
 *                description: Request ID being tracked
 *              summary:
 *                type: object
 *                description: Summary of tracking information for request
 *                properties:
 *                  total:
 *                    type: integer
 *                    description: total number of samples in request
 *                  completed:
 *                    type: integer
 *                    description: Number of samples that have completed the LIMS workflow
 *                  failed:
 *                    type: integer
 *                    description: Number of samples that have failed their LIMS workflow
 *                  CompletedDate:
 *                    type: integer
 *                    description: TimeStamp of when completed request was approved by IGO
 *                  RecentDeliveryDate:
 *                    type: integer
 *                    description: Timestamp of when IGO-approved request was sent for delivery
 *                  pendingStage:
 *                    type: string
 *                    description: Current stage request is being processed at ("Completed" if finished)
 *                  stagesComplete:
 *                    type: boolean
 *                    description: Flag of whether the sample has completed its LIMS workflow (BEFORE isIgoComplete = true)
 *                  isIgoComplete:
 *                    type: boolean
 *                    description: Flag indicating IGO's approval of a request that has completed its LIMS workflow (BEFORE isDelivered = true, AFTER stagesComplete = true)
 *                  isDelivered:
 *                    type: boolean
 *                    description: Flag that indicates request has been delivered (AFTER isIgoComplete = true)
 *              metaData:
 *                type: object
 *                properties:
 *                  ProjectName:
 *                    type: string
 *                    description: Name submitted for request in iLabs
 *                  LaboratoryHead:
 *                    type: string
 *                    description: PI name
 *                  RequestName:
 *                    type: string
 *                    description: Type of request (e.g. "PED-PEG", "RNAExtraction", "IMPACT505")
 *                  TATFromInProcessing:
 *                    type: string
 *                    description: estimated turn-around-time from time request has started processing
 *                  Investigator:
 *                    type: string
 *                    description: Investigator name of request
 *                  ProjectManager:
 *                    type: string
 *                    description: Project Manager of request
 *                  ReceviedDate:
 *                    type: integer
 *                    description: timestamp request was received by IGO
 *                  TATFromReceiving:
 *                    type: string
 *                    description: estimated turn-around-time from time request was received
 *                  GroupLeader:
 *                    type: string
 *                    description: IGO member leading request
 *                  requestId:
 *                    type: string
 *                    description: IGO ID for request
 *                  LabHeadEmail:
 *                    type: string
 *                  DueDate:
 *                    type: integer
 *                    description: Expected time for delivery of request
 *                  serviceId:
 *                    type: string
 *                    description: iLabs request ID
 *                  sourceRequests:
 *                    type: array
 *                    description: List of parent request IDs
 *                    items:
 *                      type: string
 *                  childRequests:
 *                    type: array
 *                    description: List of child request IDs
 *                    items:
 *                      type: string
 *              stages:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    stage:
 *                      type: string
 *                      description: name of stage
 *                    complete:
 *                      type: boolean
 *                      description: Flag of whether all samples in request have completed stage
 *                    totalSamples:
 *                      type: integer
 *                      description: number of samples that have progressed to stage
 *                    completedSamples:
 *                      type: integer
 *                      description: number of samples in request that have completed stage
 *                    failedSamples:
 *                      type: integer
 *                      description: Number of samples that have failed at stage
 *                    startTime:
 *                      type: integer
 *                      description: Time first sample entered stage in LIMS workflow
 *                    updateTime:
 *                      type: integer
 *                      description: Last time a sample at stage was updated
 *              samples:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    sampleId:
 *                      type: string
 *                      description: Record number of Sample in IGO's LIMS
 *                    status:
 *                      type: string
 *                      description: Stage sample is currently at ("Completed" if workflow is complete, "Failed" if failed)
 *                    stages:
 *                      type: array
 *                      description: Stage tracking information of the sample
 *                      items:
 *                        type: object
 *                        properties:
 *                          stage:
 *                            type: string
 *                            description: Name of stage
 *                          complete:
 *                            type: boolean
 *                            description: flag of whether sample has completed stage
 *                          startTime:
 *                            type: integer
 *                            description: timestamp sample entered stage in LIMS workflow
 *                          updateTime:
 *                            type: integer
 *                            description: latest timestamp sample was updated by a LIMS workflow of stage
 *                    sampleInfo:
 *                      description: physical properties of sample
 *                      type: object
 *                      properties:
 *                        volume:
 *                          type: integer
 *                          description: Remaining volume of sample
 *                        concentration:
 *                          type: integer
 *                          description: concentration of sample
 *                        concentrationUnits:
 *                          type: string
 *                          description: concentration units
 *          status:
 *            type: boolean
 *            description: whether the request succeeded
 *          message:
 *            type: string
 *            description: success, or description of error
 */

module.exports = router;
