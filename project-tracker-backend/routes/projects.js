var express = require("express");
const LimsController = require("../controllers/lims-controller");
var router = express.Router();

/* Application Endpoints */
router.get("/delivered", LimsController.getDeliveredProjects);
router.get("/undelivered", LimsController.getUndeliveredProjects);
router.get("/:id", LimsController.getProjectTrackingData);

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
 *   description: Endpoint to retrieve tracking information about a request
 */
/**
 * @swagger
 * /delivered:
 *   get:
 *     summary: Retrieve list of requests delivered by IGO
 *     tags:
 *       - RequestList
 *     name: Delivered Requests
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: List of requests that have been delivered by IGO
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestListResponse'
 * /undelivered:
 *   get:
 *     summary: Retrieve list of pending requests from IGO
 *     tags:
 *       - RequestList
 *     name: Pending Requests
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: List of requests that are pending from IGO, i.e. not marked for delivery
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestListResponse'
 * /{requestId}:
 *   get:
 *     summary: Retrieve tracking information about input requestId
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
 *           02021_AD
 *     name: Request Info
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Tracking information about IGO request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestInfoResponse'
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
 *                    completedDate:
 *                      type: integer
 *                    requestId:
 *                      type: string
 *                    requestType:
 *                      type: string
 *                    investigator:
 *                      type: string
 *                    pi:
 *                      type: string
 *                    analysisRequested:
 *                      type: boolean
 *                    isCmoRequest:
 *                      type: boolean
 *                    recordId:
 *                      type: integer
 *                    receivedDate:
 *                      type: integer
 *                    dueDate:
 *                      type: integer
 *                    restStatus:
 *                      type: string
 *                    labHeadEmail:
 *                      type: string
 *                    qcAccessEmail:
 *                      type: string
 *                    dataAccessEmails:
 *                      type: string
 *                    isIgoComplete:
 *                      type: boolean
 *                    autorunnable:
 *                      type: boolean
 *                    deliveryDate:
 *                      type: integer
 *                    igoCompleteDate:
 *                      type: integer
 *          status:
 *            type: boolean
 *            description: whether the request succeeded
 *          message:
 *            type: string
 *            description: success, or description of error
 *      RequestInfoResponse:
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
 *                properties:
 *                  total:
 *                    type: integer
 *                  RecentDeliveryDate:
 *                    type: integer
 *                  stagesComplete:
 *                    type: boolean
 *                  pendingStage:
 *                    type: string
 *                  isIgoComplete:
 *                    type: boolean
 *                  completed:
 *                    type: integer
 *                  failed:
 *                    type: integer
 *                  CompletedDate:
 *                    type: integer
 *              metaData:
 *                type: object
 *                properties:
 *                  ProjectName:
 *                    type: string
 *                  LaboratoryHead:
 *                    type: string
 *                  RequestName:
 *                    type: string
 *                  TATFromInProcessing:
 *                    type: string
 *                  Investigator:
 *                    type: string
 *                  ProjectManager:
 *                    type: integer
 *                  ReceviedDate:
 *                    type: integer
 *                  TATFromReceiving:
 *                    type: string
 *                  GroupLeader:
 *                    type: string
 *                  requestId:
 *                    type: string
 *                  LabHeadEmail:
 *                    type: string
 *                  DueDate:
 *                    type: integer
 *                  serviceId:
 *                    type: string
 *                  sourceRequests:
 *                    type: array
 *                    items:
 *                      type: string
 *                  childRequests:
 *                    type: array
 *                    items:
 *                      type: string
 *              stages:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    stage:
 *                      type: string
 *                    completedSamples:
 *                      type: integer
 *                    totalSamples:
 *                      type: integer
 *                    startTime:
 *                      type: integer
 *                    updateTime:
 *                      type: integer
 *                    complete:
 *                      type: boolean
 *                    failedSamples:
 *                      type: integer
 *              samples:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    sampleId:
 *                      type: string
 *                    root:
 *                      type: object
 *                    attributes:
 *                      type: object
 *                      properties:
 *                        stage:
 *                          type: string
 *                        childSampleId:
 *                          type: integer
 *                        totalSamples:
 *                          type: integer
 *                        startTime:
 *                          type: integer
 *                        updateTime:
 *                          type: integer
 *                        failed:
 *                          type: boolean
 *                        sourceSampleId:
 *                          type: string
 *                        complete:
 *                          type: boolean
 *                        status:
 *                          type: string
 *                    stages:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          stage:
 *                            type: string
 *                          completedSamples:
 *                            type: integer
 *                          totalSamples:
 *                            type: integer
 *                          startTime:
 *                            type: integer
 *                          updateTime:
 *                            type: integer
 *                          complete:
 *                            type: boolean
 *                          failedSamples:
 *                            type: integer
 *          status:
 *            type: boolean
 *            description: whether the request succeeded
 *          message:
 *            type: string
 *            description: success, or description of error
 */

module.exports = router;
