import React, {useEffect, useState} from 'react';
import {convertUnixTimeToDate} from "../utils/utils";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import StageLevelTracker from "./stage-level-tracker";
import SampleLevelTracker from "./sample-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight, faFlask} from "@fortawesome/free-solid-svg-icons";

function ProjectLevelTracker({project}) {
    const [viewSamples, setViewSamples] = useState(false);
    const [showFailed, setShowFailed] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);

    const [samples, setSamples] = useState(project.getSamples());
    const stages = project.getStages();
    const startTime = convertUnixTimeToDate(project.getStartTime());
    const updateTime = convertUnixTimeToDate(project.getUpdateTime());
    const recentDeliveryDate = project.getRecentDeliveryDate();
    const tatFromReceiving = project.getTATFromReceiving();
    const tatFromInProcessing = project.getTATFromInProcessing();
    const groupLeader = project.getGroupLeader();
    const labHeadEmail = project.getLabHeadEmail();
    const labHead = project.getLabHead();
    const investigator = project.getInvestigator();
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
    return <Container className={"border"}>
                    <Row className={"padding-vert-10 border"}>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Project Start</span>: {startTime}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Project Updated</span>: {updateTime}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Group Leader</span>: {groupLeader}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Investigator</span>: {investigator}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Project Manager</span>: {projectManager}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Lab Head Email</span>: {labHeadEmail}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Laboratory Head</span>: {labHead}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Turn Around Time From Receiving</span>: {tatFromReceiving}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Turn Around Time From In Processing</span>: {tatFromInProcessing}</p>
                        </Col>
                        <Col xs={12} sm={6}>
                            <p className={"text-align-left"}><span className={"bold"}>Recent Delivery Date</span>: {recentDeliveryDate}</p>
                        </Col>
                    </Row>
                    <Row className={"parent-sample-level-stages"}>
                        <StageLevelTracker stages={stages}
                                           orientation={"horizontal"}
                                           projectView={true}></StageLevelTracker>
                    </Row>
                    <Row className={"padding-vert-10"}>
                        <Col xs={6} className={"hover"} onClick={() => setViewSamples(!viewSamples)}>
                            <FontAwesomeIcon className="project-selector-icon inline-block" icon={ viewSamples ? faAngleDown : faAngleRight }/>
                            <p className={"sample-viewer-toggle inline-block"}>{ viewSamples ? "Hide Samples" : "View Samples" }</p>
                        </Col>
                        {
                            viewSamples? <Col xs={6}>
                                <Container>
                                    <Row>
                                        {
                                            completedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                Completed
                                                <span className={`sample-filter-icon black-color fa-layers fa-fw hover inline-block ${showCompleted ? '' : 'fade-color'}`}
                                                      onClick={() => setShowCompleted(!showCompleted)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{completedSamples.length}</span>
                                                </span>
                                            </Col> : <span></span>
                                        }
                                        {
                                            failedSamples.length > 0 ? <Col xs={6} sm={4}>
                                                Failed
                                                <span className={`sample-filter-icon red-color fa-layers fa-fw hover inline-block ${showFailed ? '' : 'fade-color'}`}
                                                      onClick={() => setShowFailed(!showFailed)}>
                                                    <FontAwesomeIcon icon={faFlask}/>
                                                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{failedSamples.length}</span>
                                                </span>
                                            </Col> : <span></span>
                                        }
                                        {
                                            pendingSamples.length > 0 ? <Col xs={6} sm={4}>
                                                Pending
                                                <span className={`sample-filter-icon blue-color fa-layers fa-fw hover inline-block ${showPending ? '' : 'fade-color'}`}
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
                            <SampleLevelTracker samples={filteredSamples}></SampleLevelTracker>
                        </Row> : <span></span>
                    }

                </Container>;
}

export default ProjectLevelTracker;

ProjectLevelTracker.propTypes = {
    project: Project
};
