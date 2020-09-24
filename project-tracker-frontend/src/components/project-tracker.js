import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {useDispatch, useSelector, useStore} from "react-redux";
import {getProjectTrackingDataRequest} from "../services/services";
import {updateDelivered, updateUndelivered} from "../redux/dispatchers";
import ProjectLevelTracker from "./project-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleRight, faAngleDown, faCheck, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
import Project from '../utils/Project';
import {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS} from "../redux/reducers";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { IndicatorFlask } from "./common/indicator-icons";
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
        if( !projectHasData(project) ){
            // Need to request the tracking information of the project
            getProjectTrackingDataRequest(projectName)
                .then(data => {
                    const storeProjects = store.getState()[projectState] || {};  // Retrieve latest version of the store
                    const clone = Object.assign({}, storeProjects);
                    clone[projectName] = new Project(data);
                    if(STATE_DELIVERED_REQUESTS === projectState){
                        updateDelivered(dispatch, clone);
                    } else if(STATE_PENDING_REQUESTS === projectState) {
                        updateUndelivered(dispatch, clone);
                    }

                })
        }
    }, [dispatch, project, projectName, store]);

    const getSummaryIcon = (projectName) => {
        const mapping = stateProjects[projectName];
        // If mapping isn't present, or null, this should show a pending icon
        if(mapping === null || mapping === undefined){
            return <span className={`small-icon mskcc-black fa-layers fa-fw hover inline-block`}>
            <FontAwesomeIcon icon={faEllipsisH}/>
        </span>;
        }

        const summary = mapping.getSummary();

        // igoComplete projects should just show completed icon
        const isIgoComplete = summary['isIgoComplete'] || false;
        if(isIgoComplete){
            return <span className={`small-icon fa-layers fa-fw hover inline-block success-green`}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>;
        }

        // TODO - api constants
        // Show an icon w/ an overall status
        const completed = summary['completed'];
        const failed = summary['failed'];
        const total = summary['total'];
        const summaryColor = (failed && failed > 0) ? 'fail-red' : 'update-blue';
        return <IndicatorFlask summaryColorClass={summaryColor}
                label={`${completed}/${total}`}></IndicatorFlask>;
    };

    /**
     * Retrieves human-readable received date from project
     * @param project
     * @returns {string}
     */
    const getFormattedDate = (project) => {
        const deliveredDate = project ? project.getRecentDeliveryDate() : null;
        const receivedDate = project ? project.getReceivedDate() : null;

        if(STATE_DELIVERED_REQUESTS === projectState){
            return convertUnixTimeToDateString_Day(deliveredDate);
        } else if (receivedDate) {
            return convertUnixTimeToDateString_Day(receivedDate);
        }
        return '...';
    };

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
                    <h5 className={"padding-12"}>{project ? project.getRecipe() : '...'}</h5>
                </Col>
                <Col xs={3} md={2} className={"overflow-x-hidden"}>
                    {getSummaryIcon(projectName)}
                </Col>
            </Row>
            <Row>
                {
                    showProject ?
                        projectHasData(project) ?
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
