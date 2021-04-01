import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {useDispatch, useSelector, useStore} from "react-redux";
import ProjectLevelTracker from "./project-level-tracker";
import {STATE_DELIVERED_REQUESTS} from "../redux/reducers";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { RequestStatusIndicator, LoadingIcon } from "./common/indicator-icons";
import {convertUnixTimeToDateString_Day, getRequestTrackingInfoForRequest} from "../utils/utils";

function ProjectTracker({projectName, projectState}) {
    const store = useStore();
    const stateProjects = useSelector(state => state[projectState] );

    const project = stateProjects[projectName];

    const [showProject, setShowProject] = useState(false);
    const dispatch = useDispatch();

    /**
     * Returns whether Project has been populated with data
     *
     * @param proj
     * @returns {*}
     */
    const projectHasData = (proj) => {
        // Possible for proj to be undefined if the state has not been updated
        return proj !== null && proj !== undefined;
    };

    useEffect(() => {
        if( !project || !project.isEnriched() ){
            getRequestTrackingInfoForRequest(projectName, projectState, store, dispatch);
        }
    }, [dispatch, project, projectName, store]);

    const getSummaryIcon = (projectName) => {
        const request = stateProjects[projectName];
        // If request isn't present, or null, this should show a pending icon
        if(!request.isEnriched()){
            return <LoadingIcon/>;
        }

        // TODO - api constants
        // Show an icon w/ an overall status
        const summary = request.getSummary();
        const pendingStage = summary['pendingStage'];
        const isDelivered = summary['isIgoComplete'] || false;
        const isComplete = summary['stagesComplete'] || false;
        const completedCt = summary['completed'];
        const failedCt = summary['failed'];
        const totalCt = summary['total'];

        return <RequestStatusIndicator
                    isDelivered={isDelivered}
                    isComplete={isComplete}
                    pendingStage={pendingStage}
                    completedCt={completedCt}
                    totalCt={totalCt}
                    failedCt={failedCt}></RequestStatusIndicator>;
    };

    /**
     * Retrieves the correct delivery date to report (pending requests won't have an igoComplete date yet, so we
     * report the due date
     *
     * @param project
     * @returns {string}
     */
    const getDeliveryDate = (project) => {
        const deliveredDate = project.getIgoCompleteDate();
        const dueDate = project.getDueDate();
        if(STATE_DELIVERED_REQUESTS === projectState && deliveredDate){
            return convertUnixTimeToDateString_Day(deliveredDate);
        } else if (dueDate) {
            return convertUnixTimeToDateString_Day(dueDate);
        }
        return '...';
    };

    const getReceivedDate = (request) => {
        const receivedDate = request.getReceivedDate();
        return convertUnixTimeToDateString_Day(receivedDate);
    };

    if(! project){
        return <Container></Container>
    }

    return <Container className={showProject ? "border" : "white-border"}>
            <Row className={`hover padding-vert-5 ${showProject ? "selected-request" : ""}`}
                 onClick={() => setShowProject(!showProject)}>
                <Col xs={3} sm={2} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{projectName}</h5>
                </Col>
                <Col xs={3} sm={4} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{project.getRecipe()}</h5>
                </Col>
                <Col xs={2} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{getReceivedDate(project)}</h5>
                </Col>
                <Col xs={2} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{getDeliveryDate(project)}</h5>
                </Col>
                <Col xs={2} className={"overflow-x-hidden text-align-center"}>
                    {getSummaryIcon(projectName)}
                </Col>
            </Row>
            <Row>
                {
                    showProject ?
                        (project && project.isEnriched()) ?
                            <ProjectLevelTracker project={project}></ProjectLevelTracker>
                            :
                            <div>
                                <p>Loading</p>
                            </div>
                        : <div></div>
                }
            </Row>
        </Container>
}

export default ProjectTracker;

ProjectTracker.propTypes = {
    projectName: PropTypes.string
};
