import ProjectTracker from "../project-tracker";
import React from "react";
import PropTypes from "prop-types";
import {getHumanReadable} from "../../utils/utils";

function ProjectSection({projectMapping, projectState}) {
    // TODO - pagination
    return <div className={"border"}>
        <div className={"light-gray-background border padding-vert-10 padding-hor-20"}>
            <h2>{getHumanReadable(projectState)}</h2>
        </div>
        { Object.keys(projectMapping).map((projectName) => {
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
