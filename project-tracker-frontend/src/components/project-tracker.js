import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {useDispatch, useSelector, useStore} from "react-redux";
import {getProjectTrackingData} from "../services/services";
import {updateProjects} from "../redux/dispatchers";
import ProjectLevelTracker from "./project-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleRight, faAngleDown, faCheck, faCircle, faEllipsisH, faFlask} from "@fortawesome/free-solid-svg-icons";
import Project from '../utils/Project';

function ProjectTracker({projectName}) {
    const store = useStore();
    const stateProjects = useSelector(state => state.projects );
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
        return proj !== null;
    };

    const projectMap = useSelector(state => state['projects']);

    useEffect(() => {
        if( !projectHasData(project) ){
            // Need to request the tracking information of the project
            getProjectTrackingData(projectName)
                .then(data => {
                    const storeProjects = store.getState().projects || {};  // Retrieve latest version of the store
                    const clone = Object.assign({}, storeProjects);
                    clone[projectName] = new Project(data);
                    updateProjects(dispatch, clone);
                })
        }
    }, [dispatch, project, projectName, store]);

    const getSummaryIcon = (projectName) => {
        const mapping = projectMap[projectName];
        // If mapping isn't present, or null, this should show a pending icon
        if(mapping === null || mapping === undefined){
            return <span className={`float-right large-icon width-100 black-color fa-layers fa-fw hover inline-block`}>
            <FontAwesomeIcon icon={faEllipsisH}/>
        </span>;
        }

        const summary = mapping.getSummary();

        // igoComplete projects should just show completed icon
        const isIgoComplete = summary['isIgoComplete'] || false;
        if(isIgoComplete){
            return <span className={`float-right small-icon black-color fa-layers fa-fw hover inline-block width-100 mskcc-dark-green`}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>;
        }

        // TODO - api constants
        // Show an icon w/ an overall status
        const completed = summary['completed'];
        const failed = summary['failed'];
        const total = summary['total'];
        const summaryColor = (failed && failed > 0) ? 'red-color' : 'blue-color';
        return <span className={`float-right large-icon black-color fa-layers fa-fw hover inline-block width-100 ${summaryColor}`}>
            <FontAwesomeIcon icon={faFlask}/>
            <span className="fa-layers-bottom fa-layers-text fa-inverse project-summary-text-override">{completed}/{total}</span>
        </span>;

    };

    return <div>
        <div className={"hover"}
             onClick={() => setShowProject(!showProject)}>
            <FontAwesomeIcon className="project-selector-icon" icon={showProject ? faAngleDown : faAngleRight}/>
            <h1 className={"inline-block"}>{projectName}</h1>
            {
                (projectHasData(project) && project.getIgoComplete()) ? <FontAwesomeIcon className="request-complete" icon={faCheck}/>
                    : <span></span>
            }
            {getSummaryIcon(projectName)}
        </div>
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
    </div>
}

export default ProjectTracker;

ProjectTracker.propTypes = {
    projectName: PropTypes.string
};
