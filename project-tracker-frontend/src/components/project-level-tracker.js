import React, {useState} from 'react';
import {convertUnixTimeToDateStringFull} from '../utils/utils';
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import StageLevelTracker from "./stage-level-tracker";
import SampleLevelTracker from "./sample-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight, faFlask} from "@fortawesome/free-solid-svg-icons";

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
    const sourceProjects = project.getSourceProjects();
    const bankedSampleId = project.getBankedSampleId();

    // TODO - delete?
    const projectManager = project.getProjectManager();

    // Filter Samples
    const completedSamples = samples.filter((sample) => {
        const status = sample['status'];
        return status === 'Complete';
    });
    const pendingSamples = samples.filter((sample) => {
        const status = sample['status'];
        return status === 'Pending';
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

    return <Container className={"border"}>
                    <Row className={"padding-vert-10 border"}>
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
                            bankedSampleId ?  <Col xs={12} sm={6}>
                                 <p className={"text-align-left"}>
                                     <span className={"bold"}>Banked Sample Id: </span>: {bankedSampleId}
                                 </p>
                             </Col> : <span></span>
                        }
                        {
                            sourceProjects.length > 0 ? <Col xs={12} sm={6}>
                                <p className={"text-align-left"}>
                                    <span className={"bold"}>Source Projects</span>: { sourceProjects.join(',') }
                                </p>
                            </Col> : <span></span>
                        }
                    </Row>
                    <Row className={"parent-sample-level-stages"}>
                        <StageLevelTracker isProjectComplete={project.getIgoComplete()}
                                           stages={stages}
                                           orientation={"horizontal"}
                                           projectView={true}></StageLevelTracker>
                    </Row>
                    <Row className={"padding-vert-10"}>
                        <Col xs={6} className={"hover"} onClick={() => setViewSamples(!viewSamples)}>
                            <FontAwesomeIcon className="request-selector-icon inline-block" icon={ viewSamples ? faAngleDown : faAngleRight }/>
                            <p className={"sample-viewer-toggle inline-block"}>{ viewSamples ? "Hide Samples" : "View Samples" }</p>
                        </Col>
                        {
                            viewSamples? <Col xs={6}>
                                <Container>
                                    <Row>
                                        {
                                            completedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <p>Completed</p>
                                                <span className={`small-icon mskcc-black fa-layers fa-fw hover inline-block ${showCompleted ? '' : 'fade-color'}`}
                                                      onClick={() => setShowCompleted(!showCompleted)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{completedSamples.length}</span>
                                                </span>
                                            </Col> : <span></span>
                                        }
                                        {
                                            failedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <p>Failed</p>
                                                <span className={`small-icon fail-red fa-layers fa-fw hover inline-block ${showFailed ? '' : 'fade-color'}`}
                                                      onClick={() => setShowFailed(!showFailed)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{failedSamples.length}</span>
                                                </span>
                                            </Col> : <span></span>
                                        }
                                        {
                                            pendingSamples.length > 0 ? <Col xs={6} sm={4}>
                                                <p>Pending</p>
                                                <span className={`small-icon update-blue fa-layers fa-fw hover inline-block ${showPending ? '' : 'fade-color'}`}
                                                      onClick={() => setShowPending(!showPending)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{pendingSamples.length}</span>
                                                </span>
                                            </Col> : <span></span>
                                        }
                                    </Row>
                                </Container>
                            </Col> : <span></span>
                        }
                    </Row>
                    {
                        viewSamples ? <Row>
                            <SampleLevelTracker isProjectComplete={project.getIgoComplete()}
                                                samples={filteredSamples}></SampleLevelTracker>
                        </Row> : <span></span>
                    }

                </Container>;
}

export default ProjectLevelTracker;

ProjectLevelTracker.propTypes = {
    project: Project
};
