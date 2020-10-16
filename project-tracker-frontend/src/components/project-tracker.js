import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {useDispatch, useSelector, useStore} from "react-redux";
import {getProjectTrackingDataRequest} from "../services/services";
import {updateDelivered, updateUndelivered} from "../redux/dispatchers";
import ProjectLevelTracker from "./project-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Tooltip from '@material-ui/core/Tooltip';
import {faAngleRight, faAngleDown, faCheck} from "@fortawesome/free-solid-svg-icons";

import {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS} from "../redux/reducers";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { RequestStatusIndicator, LoadingIcon } from "./common/indicator-icons";
import {convertUnixTimeToDateString_Day} from "../utils/utils";

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
            // Need to request the tracking information of the project
            getProjectTrackingDataRequest(projectName)
                .then(data => {
                    const storeProjects = store.getState()[projectState] || {};  // Retrieve latest version of the store
                    const clone = Object.assign({}, storeProjects);

                    const request = clone[projectName];
                    request.addRequestTrackingInfo(data);

                    if(STATE_DELIVERED_REQUESTS === projectState){
                        updateDelivered(dispatch, clone);
                    } else if(STATE_PENDING_REQUESTS === projectState) {
                        updateUndelivered(dispatch, clone);
                    }

                })
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
     * Retrieves human-readable received date from project
     * @param project
     * @returns {string}
     */
    const getFormattedDate = (project) => {
        const deliveredDate = project.getIgoCompleteDate();
        const receivedDate = project.getReceivedDate();
        if(STATE_DELIVERED_REQUESTS === projectState && deliveredDate){
            return convertUnixTimeToDateString_Day(deliveredDate);
        } else if (receivedDate) {
            return convertUnixTimeToDateString_Day(receivedDate);
        }
        return '...';
    };

    if(! project){
        return <Container></Container>
    }

    return <Container>
            <Row className={"hover border padding-vert-5"}
                 onClick={() => setShowProject(!showProject)}>
                <Col xs={1} className={"overflow-x-hidden"}>
                    <FontAwesomeIcon className="request-selector-icon" icon={showProject ? faAngleDown : faAngleRight}/>
                </Col>
                <Col xs={3} sm={2} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{projectName}</h5>
                </Col>
                <Col xs={2} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{getFormattedDate(project)}</h5>
                </Col>
                <Col xs={3} md={5} className={"overflow-x-hidden"}>
                    <h5 className={"padding-12"}>{project.getRecipe()}</h5>
                </Col>
                <Col xs={3} md={2} className={"overflow-x-hidden"}>
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
