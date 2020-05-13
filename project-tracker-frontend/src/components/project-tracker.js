import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {useDispatch, useSelector, useStore} from "react-redux";
import {getProjectTrackingData} from "../services/services";
import {updateProjects} from "../redux/dispatchers";
import ProjectLevelTracker from "./project-level-tracker";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleRight, faAngleDown, faCheck} from "@fortawesome/free-solid-svg-icons";
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

    return <div>
        <div className={"hover"}
             onClick={() => setShowProject(!showProject)}>
            <FontAwesomeIcon className="project-selector-icon" icon={showProject ? faAngleDown : faAngleRight}/>
            <h1 className={"inline-block"}>{projectName}</h1>
            {
                (projectHasData(project) && project.getIgoComplete()) ? <FontAwesomeIcon className="request-complete" icon={faCheck}/>
                    : <span></span>
            }
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
