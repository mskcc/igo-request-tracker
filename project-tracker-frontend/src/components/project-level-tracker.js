import React, {useState} from 'react';
import {convertUnixTimeToDate} from "../utils/utils";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import StageLevelTracker from "./stage-level-tracker";
import SampleLevelTracker from "./sample-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight, faFlask} from "@fortawesome/free-solid-svg-icons";

function ProjectLevelTracker({project}) {
    const [viewSamples, setViewSamples] = useState(false);

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

    // Grab
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
                    <Row>
                        <Col xs={3}
                             className={"hover"}
                             onClick={() => setViewSamples(!viewSamples)}>
                            <FontAwesomeIcon className="project-selector-icon inline-block" icon={ viewSamples ? faAngleDown : faAngleRight }/>
                            <p className={"sample-viewer-toggle inline-block"}>{ viewSamples ? "Hide Samples" : "View Samples" }</p>
                        </Col>
                    </Row>
                    {
                        viewSamples ? <Row>
                            <SampleLevelTracker samples={samples}></SampleLevelTracker>
                        </Row> : <span></span>
                    }

                </Container>;
}

export default ProjectLevelTracker;

ProjectLevelTracker.propTypes = {
    project: Project
};
