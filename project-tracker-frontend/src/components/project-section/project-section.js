import ProjectTracker from "../project-tracker";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import { getHumanReadable, getSortedRequests } from "../../utils/utils";
import {Container} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tooltip from '@material-ui/core/Tooltip';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getRequestId, REQ_receivedDate} from "../../utils/api-util";
import {faAngleDown} from "@fortawesome/free-solid-svg-icons";
import {makeStyles} from "@material-ui/core/styles";
import {STATE_DELIVERED_REQUESTS, STATE_USER_SESSION} from "../../redux/reducers";

const useStyles = makeStyles({
    angleDown: {
        'margin': 'auto',
        'display': 'block',
        'width': '25px !important',
        'height': '40px'
    }
});

function ProjectSection({requestList, projectState, dateFilterField}) {
    const classes = useStyles();
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [numProjectsToShow, setNumProjectsToShow] = useState(5);
    const [descendingDateSort, setDescendingDateSort] = useState(true);
    const deliveryColumnHeader = projectState ===  STATE_DELIVERED_REQUESTS ? 'Delivered' : 'Expected Delivery';

    useEffect(() => {
        const sortedRequests = getSortedRequests(requestList, descendingDateSort, dateFilterField);
        setFilteredProjects(sortedRequests);
    }, [requestList, descendingDateSort]);

    const projectSection = getHumanReadable(projectState);

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
    return <Container className={"interactiveContainer  border"}>
                <Row  className={"background-mskcc-light-gray padding-top-15"}>
                    <Col xs={4}></Col>
                    <Col xs={4} className={"text-align-center flexbox-center overflow-x-hidden"}>
                        <div className={"padding-hor-20 dark-gray-bottom-border"}>
                            <h4>{projectSection}</h4>
                        </div>
                    </Col>
                    <Col xs={4}></Col>
                </Row>
                <Row className={"background-mskcc-light-gray padding-top-15 padding-bottom-10"}>
                    <Col xs={3} sm={2} className={"flexbox-center overflow-x-hidden"}>
                        <h4>Request Id</h4>
                    </Col>
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
                        }) : <Container className={"interactiveContainer "}>
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
