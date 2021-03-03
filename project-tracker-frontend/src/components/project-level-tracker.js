import React, {useState} from 'react';
import {
    convertUnixTimeToDateStringFull,
    downloadExcel, getDateFileSuffix,
    getMaterialInfo
} from "../utils/utils";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import StageLevelTracker from "./stage-level-tracker";
import SampleLevelTracker from "./sample-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight, faFlask} from "@fortawesome/free-solid-svg-icons";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";

const extractQuantifyInfoXlsx = function(samples) {
    const sampleInfoList = [];
    for(const sample of samples){
        const dataRecordId = sample['sampleId'];
        const root = sample['root'] || {};
        const igoId = root['recordName'];
        const status = sample['status'];
        const sampleInfo = sample['sampleInfo'] || {};
        const dnaInfo = sampleInfo['dna_material'] || {};
        const libraryInfo = sampleInfo['library_material'] || {};
        let dnaConcentration, dnaVolume, dnaMass = getMaterialInfo(dnaInfo);
        let libraryConcentration, libraryVolume, libraryMass = getMaterialInfo(libraryInfo);

        const xlsxObj = {
            igoId,
            dataRecordId,
            status,
            dnaConcentration,
            dnaVolume,
            dnaMass,
            libraryConcentration,
            libraryVolume,
            libraryMass
        };
        sampleInfoList.push(xlsxObj);
    }

    return sampleInfoList;
};

// project: Project.js instance
function ProjectLevelTracker({project}) {
    const [viewSamples, setViewSamples] = useState(false);
    const [showFailed, setShowFailed] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);

    const [samples, setSamples] = useState(project.getSamples());
    const stages = project.getStages();

    const startTime = project.getStartTime() ? convertUnixTimeToDateStringFull(project.getStartTime()) : 'Not Available';
    const igoCompleteDate = project.getIgoCompleteDate();
    const tatFromReceiving = project.getTATFromReceiving();
    const tatFromInProcessing = project.getTATFromInProcessing();
    const labHeadEmail = project.getLabHeadEmail();
    const labHead = project.getLabHead();
    const investigator = project.getInvestigator();
    const sourceRequests = project.getSourceRequests().filter( request => request !== "INVALID" );
    const childRequests = project.getChildRequests();
    const serviceId = project.getServiceId();
    const requestName = project.getRecipe();
    const requestId = project.getRequestId();

    // TODO - delete?
    const projectManager = project.getProjectManager();

    // Filter Samples
    const completedSamples = samples.filter((sample) => {
        const status = sample['status'];
        return status === 'Complete';
    });
    const pendingSamples = samples.filter((sample) => {
        // Pending samples will have the status of the stage they are currently at in processing
        const status = sample['status'];
        return (status !== 'Complete' && status !== 'Failed');
    });
    const failedSamples = samples.filter((sample) => {
        const status = sample['status'];
        return status === 'Failed';
    });

    // Show samples in order of filtered, pending, and completed
    let filteredSamples = [];
    if(showFailed) {
        filteredSamples = filteredSamples.concat(failedSamples);
    }
    if(showPending){
        filteredSamples = filteredSamples.concat(pendingSamples);
    }
    if(showCompleted) {
        filteredSamples = filteredSamples.concat(completedSamples);
    }

    // Sort on recordName, e.g. [08470_E_42, 08470_E_11, 08470_E_4, 08470_E_1] -> [08470_E_1, 08470_E_4, 08470_E_11, 08470_E_42]
    filteredSamples.sort((s1, s2) => {
        let s1Root = s1.root || {};
        let s1Name = s1Root['recordName'] || '';
        s1Name = s1Name.toUpperCase();

        let s2Root = s2.root || {};
        let s2Name = s2Root['recordName'] || '';
        s2Name = s2Name.toUpperCase();

        if (s1Name.length - s2Name.length !== 0) {
            return s1Name.length - s2Name.length;
        }

        return (s1Name < s2Name) ? -1 : (s1Name > s2Name) ? 1 : 0;
    });

    const getOtherTimeField = () => {
        if(igoCompleteDate && "Not Available" !== igoCompleteDate) {
            return <Col xs={12} sm={6}>
                <p className={"text-align-left"}><span className={"bold"}>Recent Delivery Date</span>: {igoCompleteDate}</p>
            </Col>
        } else if(tatFromInProcessing){
            return <Col xs={12} sm={6}>
                <p className={"text-align-left"}><span className={"bold"}>Turn Around Time From In Processing</span>: {tatFromInProcessing}</p>
            </Col>
        }
        return <Col xs={12} sm={6}>
            <p className={"text-align-left"}><span className={"bold"}>Turn Around Time From Receiving</span>: {tatFromReceiving}</p>
        </Col>
    };

    return <Container>
                    <Row className={"padding-vert-10"}>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Project Start</span>: {startTime}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Investigator</span>: {investigator}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Lab Head Email</span>: {labHeadEmail}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Laboratory Head</span>: {labHead}</p>
                        </Col>
                        {
                            serviceId ?  <Col xs={12} sm={6}>
                                 <p className={"text-align-left"}>
                                     <span className={"bold"}>Service Id: </span> {serviceId}
                                 </p>
                             </Col> : <span></span>
                        }
                        {
                            sourceRequests.length > 0 ? <Col xs={12} sm={6}>
                                <p className={"text-align-left"}>
                                    <span className={"bold"}>Source Requests</span>: { sourceRequests.join(', ') }
                                </p>
                            </Col> : <span></span>
                        }
                        {
                            childRequests.length > 0 ? <Col xs={12} sm={6}>
                                <p className={"text-align-left"}>
                                    <span className={"bold"}>Child Requests</span>: { childRequests.join(', ') }
                                </p>
                            </Col> : <span></span>
                        }
                    </Row>
                    <Row className={"parent-sample-level-stages"}>
                        <StageLevelTracker igoCompleteDate={project.getIgoCompleteDate()}
                                           stages={stages}
                                           orientation={"horizontal"}
                                           projectView={true}></StageLevelTracker>
                    </Row>
                    <Row className={"padding-vert-10"}>
                        <Col xs={4} className={"hover"} onClick={() => setViewSamples(!viewSamples)}>
                            <FontAwesomeIcon className="request-selector-icon inline-block" icon={ viewSamples ? faAngleDown : faAngleRight }/>
                            <p className={"sample-viewer-toggle inline-block"}>{ viewSamples ? "Hide Samples" : "View Samples" }</p>
                        </Col>
                        <Col xs={2}>
                            <Tooltip title={`Download ${requestId} sample Info`} aria-label={'Sample list tooltip'} placement="right">
                            <div className={"sample-viewer-toggle"}
                                 onClick={() => downloadExcel(extractQuantifyInfoXlsx(samples), `${requestId}_${getDateFileSuffix()}`)}>
                                <FontAwesomeIcon className={"tiny-icon float-right hover"}
                                                 icon={faFileExcel}/>
                            </div>
                            </Tooltip>
                        </Col>
                        {
                            viewSamples? <Col xs={6}>
                                <Container>
                                    <Row>
                                        {
                                            completedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <span className={`small-icon success-green fa-layers fa-fw hover inline-block ${showCompleted ? '' : 'fade-color'}`}
                                                      onClick={() => setShowCompleted(!showCompleted)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{completedSamples.length}</span>
                                                </span>
                                                <p className={'text-align-center'}>Completed</p>
                                            </Col> : <span></span>
                                        }
                                        {
                                            failedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <span className={`small-icon fail-red fa-layers fa-fw hover inline-block ${showFailed ? '' : 'fade-color'}`}
                                                      onClick={() => setShowFailed(!showFailed)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{failedSamples.length}</span>
                                                </span>
                                                <p className={'text-align-center'}>Failed</p>
                                            </Col> : <span></span>
                                        }
                                        {
                                            pendingSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <span className={`small-icon update-blue fa-layers fa-fw hover inline-block ${showPending ? '' : 'fade-color'}`}
                                                      onClick={() => setShowPending(!showPending)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{pendingSamples.length}</span>
                                                </span>
                                                <p className={'text-align-center'}>Pending</p>
                                            </Col> : <span></span>
                                        }
                                    </Row>
                                </Container>
                            </Col> : <span></span>
                        }
                    </Row>
                    {
                        viewSamples ? <Row>
                            <SampleLevelTracker igoCompleteDate={project.getIgoCompleteDate()}
                                                samples={filteredSamples}
                                                requestName={requestName}></SampleLevelTracker>
                        </Row> : <span></span>
                    }

                </Container>;
}

export default ProjectLevelTracker;

ProjectLevelTracker.propTypes = {
    project: Project
};
