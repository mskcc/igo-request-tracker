import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {
    convertUnixTimeToDateStringFull,
    downloadExcel,
    getDateFromNow,
    getHumanReadable, getSortedRequests
} from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tooltip from '@material-ui/core/Tooltip';
import {faFileExcel} from "@fortawesome/free-solid-svg-icons/faFileExcel";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRecipe, getRequestId, REQ_deliveryDate, REQ_dueDate, REQ_receivedDate} from "../../utils/api-util";
import {faAngleDown} from "@fortawesome/free-solid-svg-icons";
import {makeStyles} from "@material-ui/core/styles";
import {DF_ALL} from "../common/project-filters";
import {STATE_DELIVERED_REQUESTS} from "../../redux/reducers";

const useStyles = makeStyles({
    angleDown: {
        'margin': 'auto',
        'display': 'block',
        'width': '25px !important',
        'height': '40px'
    }
});

function ProjectSection({dateFilter, requestList, projectState, requestIdQuery, filteredRecipes}) {
    const classes = useStyles();
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [numProjectsToShow, setNumProjectsToShow] = useState(5);
    const [descendingDateSort, setDescendingDateSort] = useState(true);
    const deliveryColumnHeader = projectState ===  STATE_DELIVERED_REQUESTS ? 'Delivered' : 'Expected Delivery';

    // @dateFilterField is the field for monitoring delivery
    const dateFilterField = projectState === STATE_DELIVERED_REQUESTS ? REQ_deliveryDate : REQ_dueDate;

    useEffect(() => {
        // FILTERING
        const dateFilteredList = getDateFilteredList(requestList);
        const requestIdFilteredList = getFilteredProjectsFromQuery(dateFilteredList);
        const recipeFilteredList = getFilteredProjectsFromRecipe(requestIdFilteredList);
        const sortedRequests = getSortedRequests(recipeFilteredList, descendingDateSort, dateFilterField);
        setFilteredProjects(sortedRequests);
    }, [requestIdQuery, filteredRecipes, dateFilter, requestList]);



    /**
     * Returning the first 5 results that get returned from the filter
     *
     * @param mapping
     * @returns {string[]}
     */
    const getFilteredProjectsFromQuery = (requests) => {
        const filtered = requests.filter((req) => {
            const requestId = getRequestId(req);
            return requestId.startsWith(requestIdQuery);
        });
        return filtered;
    };

    /**
     * Filters requests by the state value for filteredRequests
     * @param requests
     * @returns {*}
     */
    const getFilteredProjectsFromRecipe = (requests) => {
        // If no filter is applied, return all the requests
        if(filteredRecipes.size === 0){
            return requests;
        }
        const filtered = requests.filter((req) => {
            const recipe = getRecipe(req);
            return filteredRecipes.has(recipe);
        });
        return filtered;
    };

    /**
     * Returns a list of requests that have been filtered on the date field specified in props
     *
     * @param requestList
     * @returns {[]}
     */
    const getDateFilteredList = (requestList) => {
        const numDays = parseInt(dateFilter);
        const oldestDate = getDateFromNow(0, 0, -numDays);
        const dateFilteredList = [];
        for(const req of requestList){
            const receivedDate = req[dateFilterField];
            if(receivedDate && receivedDate > oldestDate){
                // receivedDate needs to be present and that usually means it is new
                dateFilteredList.push(req);
            } else if (!receivedDate && DF_ALL === dateFilter){
                // Only add request w/ missing received date if filtering for all projects
                dateFilteredList.push(req);
            }
        }
        return dateFilteredList;
    };

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
        const dateFields = [REQ_receivedDate, REQ_deliveryDate];
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
                xlsxObj[dField] = (val && val !== "") ? convertUnixTimeToDateStringFull(val) : "Not Available";
            }
            for(const field of boolFields){
                const val = request[field];
                xlsxObj[field] = val ? "yes" : "no";
            }
            xlsxObjList.push(xlsxObj);
        }

        return xlsxObjList;
    };

    /**
     * Reverses sorting order of the filtered Projects in view
     */
    const toggleDateSorting = (dateFilter) => {
        const dateSort = !descendingDateSort;
        setDescendingDateSort(dateSort);
        const sorted = getSortedRequests(filteredProjects, dateSort, dateFilter);
        setFilteredProjects(sorted);
    };

    const projectsInView = filteredProjects.slice(0,numProjectsToShow);
    return <Container className={"border"}>
                <Row  className={"background-mskcc-light-gray padding-top-15"}>
                    <Col xs={4}></Col>
                    <Col xs={4} className={"text-align-center flexbox-center overflow-x-hidden"}>
                        <div className={"padding-hor-20 dark-gray-bottom-border"}>
                            <h4>{projectSection}</h4>
                        </div>
                    </Col>
                    <Col xs={1}></Col>
                    <Col xs={2}>
                        <Tooltip title={`Download ${projectSection}`} aria-label={'Download'} placement="right">
                            <div onClick={() => downloadExcel(convertToXlsx(requestList), getHumanReadable(projectState))}>
                                <FontAwesomeIcon className={"tiny-icon float-right hover"}
                                                 icon={faFileExcel}/>
                            </div>
                        </Tooltip>
                    </Col>
                    <Col xs={1}></Col>
                </Row>
                <Row className={"background-mskcc-light-gray padding-top-15 padding-bottom-10"}>
                    <Col xs={3} sm={2} className={"flexbox-center overflow-x-hidden"}><h4>Request Id</h4></Col>
                    <Col xs={3} sm={4} className={"flexbox-center text-align-center overflow-x-hidden"}><h4>Request Type</h4></Col>
                    <Col xs={2} className={"flexbox-center text-align-center overflow-x-hidden hover"}
                         onClick={() => toggleDateSorting(REQ_receivedDate)}>
                            <Tooltip title={`Sort`}
                                     aria-label={'Received Sort'}
                                     placement="right"><h4>Received</h4>
                            </Tooltip>
                    </Col>
                    <Col xs={2} className={"flexbox-center text-align-center overflow-x-hidden hover"}
                         onClick={() => toggleDateSorting(dateFilterField)}>
                        <Tooltip title={`Sort`}
                                 aria-label={'Received Sort'}
                                 placement="right">
                            <h4>{deliveryColumnHeader}</h4>
                        </Tooltip>
                    </Col>
                    <Col xs={2} className={"flexbox-center text-align-center overflow-x-hidden"}><h4>Status</h4></Col>
                </Row>
                <Row>
                    {
                        projectsInView.length > 0 ? projectsInView.map((request) => {
                        const reqId = getRequestId(request);
                        return <ProjectTracker key={reqId}
                                               projectName={reqId}
                                               projectState={projectState}/>
                        }) : <Container>
                                <Row className={"hover border padding-top-15 flexbox-center"}>
                                    <Tooltip title={`Please email zzPDL_SKI_IGO_DATA@mskcc.org if you should see ${getHumanReadable(projectState)}`}
                                             aria-label={'No requests tooltip'}
                                             placement="right">
                                        <p className={"italic"}>No {getHumanReadable(projectState)}</p>
                                    </Tooltip>
                                </Row>
                        </Container>
                    }
                </Row>
                {
                    (filteredProjects.length > numProjectsToShow) ?
                        <Row className={"hover border padding-vert-5 padding-hor-20"}
                             onClick={() => setNumProjectsToShow(numProjectsToShow + 5)}>
                            <div className={"margin-auto"}>
                                <p className={"no-margin-bottom text-align-center"}>{`Show More (Remaining: ${filteredProjects.length - numProjectsToShow})`}</p>
                                <FontAwesomeIcon className={classes.angleDown}
                                                 icon={faAngleDown}/>
                            </div>
                        </Row> : <div></div>
                }
            </Container>
}

export default ProjectSection;

ProjectSection.propTypes = {
    projectName: PropTypes.object,
    dateFilter: PropTypes.string,
    requestList: PropTypes.array,
    projectState: PropTypes.string,
    dateFilterField: PropTypes.string
};
