import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {downloadExcel, generateTextInput, getHumanReadable} from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRequestId} from "../../utils/api-util";

function ProjectSection({projectState, parentQuery, xlsxData}) {
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
    const getFilteredProjectsFromQuery = (requests) => {
        const filtered = requests.filter((req) => {
            const requestId = getRequestId(req);
            return requestId.startsWith(query);
        });
        return filtered.slice(0,3);
    };

    const filtered = getFilteredProjectsFromQuery(xlsxData);

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
                        <h4>Total {getHumanReadable(projectState)}: {Object.keys(xlsxData).length}</h4>
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

        { filtered.map((request) => {
            const reqId = getRequestId(request);
            return <ProjectTracker key={reqId}
                                   projectName={reqId}
                                   projectState={projectState}/>
        })}
    </div>
}

export default ProjectSection;

ProjectSection.propTypes = {
    projectName: PropTypes.object
};
