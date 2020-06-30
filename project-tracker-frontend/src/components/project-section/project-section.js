import ProjectTracker from "../project-tracker";
import React, {useState} from "react";
import PropTypes from "prop-types";
import {generateTextInput, getHumanReadable} from "../../utils/utils";
import TextField from "@material-ui/core/TextField/TextField";

function ProjectSection({projectMapping, projectState}) {
    const [query, setQuery] = useState('');

    /**
     * Returning the first 5 results that get returned from the filter
     * 
     * @param mapping
     * @returns {string[]}
     */
    const getFilteredProjectsFromQuery = (mapping) => {
        const projects = Object.keys(projectMapping);
        const filtered = projects.filter((prj) => {
            return prj.startsWith(query);
        });
        return filtered.slice(0,5);
    };

    // TODO - pagination
    return <div className={"border"}>
        <div className={"light-gray-background border padding-vert-10 padding-hor-20"}>
            <h2>{getHumanReadable(projectState)}</h2>

            {generateTextInput("Request ID", query, setQuery)}
        </div>
        { getFilteredProjectsFromQuery(projectMapping).map((projectName) => {
            return <ProjectTracker key={projectName}
                                   projectName={projectName}
                                   projectState={projectState}/>
        })}
    </div>
}

export default ProjectSection;

ProjectSection.propTypes = {
    projectName: PropTypes.object
};
