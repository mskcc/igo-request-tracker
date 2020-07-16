import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {convertUnixTimeToDate, downloadExcel, generateTextInput, getHumanReadable} from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRequestId} from "../../utils/api-util";

function ProjectSection({requestList, projectState, parentQuery}) {
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
        return filtered.slice(0,5);
    };

    const filtered = getFilteredProjectsFromQuery(requestList);

    const projectSection = getHumanReadable(projectState);

    const convertToXlsx = (requestList) => {
        const xlsxObjList = [];
        const boolFields = [ "analysisRequested" ];
        const stringFields = [
            "requestId",
            "requestType",
            "pi",
            "investigator",
            "analysisType",
            "dataAccessEmails",
            "labHeadEmail",
            "qcAccessEmail"
        ];
        const dateFields = ["receivedDate", "deliveryDate"];
        const numFields = [
            "recordId",
            "sampleNumber"
        ];
        const noFormattingFields = [...stringFields, ...numFields];

        for(const request of requestList){
            const xlsxObj = {};
            for(const field of noFormattingFields){
                const val = request[field];
                xlsxObj[field] = val ? val : "Not Available";
            }
            for(const dField of dateFields){
                const val = request[dField];
                xlsxObj[dField] = val ? convertUnixTimeToDate(val) : "Not Available";
            }
            for(const field of boolFields){
                const val = request[field];
                xlsxObj[field] = val ? "yes" : "no";
            }
            xlsxObjList.push(xlsxObj);
        }

        return xlsxObjList;
    };

    convertToXlsx(requestList);

    // TODO - pagination
    return <div className={"border"}>
            <Container>
                <Row  className={"black-border backgorund-light-gray padding-vert-20 padding-hor-20"}>
                    <Col xs={4}>
                        <h2>{projectSection}</h2>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <h4>Total {getHumanReadable(projectState)}: {requestList.length}</h4>
                    </Col>
                    <Col xs={2}>
                        <div onClick={() => downloadExcel(convertToXlsx(requestList), getHumanReadable(projectState))}>
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
