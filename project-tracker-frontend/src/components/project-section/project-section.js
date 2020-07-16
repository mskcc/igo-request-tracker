import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {
    convertUnixTimeToDateString,
    downloadExcel,
    generateTextInput,
    getDateFromNow,
    getHumanReadable
} from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRequestId} from "../../utils/api-util";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

export const DF_WEEK = "7";
export const DF_MONTH = "30";
export const DF_YEAR = "365";
export const DF_ALL = "5000";

function ProjectSection({initialDateFilter, requestList, projectState, parentQuery}) {
    const [query, setQuery] = useState(parentQuery);
    const [dateFilter, setDateFilter] = useState(initialDateFilter);

    const handleDateFilterToggle = (evt) => {
        const val = evt.target.value;
        setDateFilter(val);
    };

    useEffect(() => {
        setQuery(parentQuery);
        setDateFilter(initialDateFilter);
    }, [parentQuery, initialDateFilter]);

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

    const getDateFilteredList = (requestList) => {
        const numDays = parseInt(dateFilter);
        const oldestDate = getDateFromNow(0, 0, -numDays);

        const dateFilteredList = [];
        for(const req of requestList){
            const receivedDate = req["receivedDate"];
            if(!receivedDate){
                // When the receivedDate isn't present, that usually means it is new
                dateFilteredList.push(req);
            } else {
                if(receivedDate > oldestDate){
                    dateFilteredList.push(req);
                }
            }
        }
        return dateFilteredList;
    };

    const dateFilteredList = getDateFilteredList(requestList);

    const filtered = getFilteredProjectsFromQuery(dateFilteredList);

    const projectSection = getHumanReadable(projectState);

    const convertToXlsx = (requestList) => {
        const xlsxObjList = [];
        // TODO - constants
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
                xlsxObj[dField] = val ? convertUnixTimeToDateString(val) : "Not Available";
            }
            for(const field of boolFields){
                const val = request[field];
                xlsxObj[field] = val ? "yes" : "no";
            }
            xlsxObjList.push(xlsxObj);
        }

        return xlsxObjList;
    };

    // TODO - pagination
    return <div className={"border"}>
            <Container>
                <Row  className={"black-border backgorund-light-gray padding-vert-20 padding-hor-20"}>
                    <Col xs={4}>
                        <h2>{projectSection}</h2>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={4}>
                        <h4>Total {getHumanReadable(projectState)}: {dateFilteredList.length}</h4>
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
                    <Col xs={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">From Past</FormLabel>
                            <RadioGroup value={dateFilter}
                                        onChange={handleDateFilterToggle}
                                        defaultValue={initialDateFilter}
                                        row
                                        name="dateFilter"
                                        aria-label="date-filter">
                                <FormControlLabel value={DF_WEEK} control={<Radio color={"black"}/>} label="Week" />
                                <FormControlLabel value={DF_MONTH} control={<Radio color={"black"}/>} label="Month" />
                                <FormControlLabel value={DF_YEAR} control={<Radio color={"black"}/>} label="Year" />
                                <FormControlLabel value={DF_ALL} control={<Radio color={"black"}/>} label="Show All" />
                            </RadioGroup>
                        </FormControl>
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
