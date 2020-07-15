import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {downloadExcel, generateTextInput, getHumanReadable} from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function ProjectSection({projectMapping, projectState, parentQuery, xlsxData}) {
    const [query, setQuery] = useState(parentQuery);

    useEffect(() => {
        setQuery(parentQuery);
    }, [parentQuery]);

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
        return filtered.slice(0,3);
    };

    const filtered = getFilteredProjectsFromQuery(projectMapping);

    const projectSection = getHumanReadable(projectState);

    // TODO - pagination
    return <div className={"border"}>
            <Container>
                <Row  className={"black-border backgorund-light-gray padding-vert-20 padding-hor-20"}>
                    <Col xs={4}>
                        <h2>{projectSection}</h2>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <h4>Total {getHumanReadable(projectState)}: {Object.keys(projectMapping).length}</h4>
                    </Col>
                    <Col xs={2}>
                        <div onClick={() => downloadExcel(xlsxData, getHumanReadable(projectState))}>
                            <FontAwesomeIcon className={"small-icon float-right hover"}
                                             icon={faFileExcel}/>
                        </div>
                    </Col>
                    <Col xs={6}>
                        {generateTextInput("Request ID", query, setQuery)}
                    </Col>
                </Row>
            </Container>

        { filtered.map((projectName) => {
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
