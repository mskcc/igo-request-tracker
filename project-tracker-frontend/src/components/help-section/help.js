import {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS} from "../../redux/reducers";
import React, {useState} from "react";
import {getHumanReadable, goToTeamWorks} from "../../utils/utils";
import requestView from './assets/request_view.png';
import requestViewMultiple from './assets/request-view-multiple.png';
import requestStatus from './assets/project_status.png';
import sampleView from './assets/sample_filter.png';
import treeView from './assets/sample_level.png';
import aliquot from './assets/aliquot.png';
import aliquotStatus from './assets/aliquot_status.png';
import conservativeStage from './assets/conservative-stage.png';
import {Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight, faComment, faUsers} from "@fortawesome/free-solid-svg-icons";
import {stagesRows} from './assets/stages-table';
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";

function HelpSection() {
    const REQUEST_SECTION = 'REQUEST_SECTION';
    const REQUEST_VIEW = 'REQUEST_VIEW';
    const STAGE_SECTION = 'STAGE_SECTION';

    const [showRequestSections, setShowRequestSections] = useState(false);
    const [showRequestView, setShowRequestView] = useState(false);
    const [showStageSection, setShowStageSection] = useState(false);

    const toggleShow = (type) => {
        if(REQUEST_SECTION === type){
            setShowRequestSections(!showRequestSections);
        } else if(REQUEST_VIEW === type){
            setShowRequestView(!showRequestView);
        } else if(STAGE_SECTION === type){
            setShowStageSection(!showStageSection);
        }
    };

    return <div className={"border padding-vert-10 padding-hor-20"}>
        <div className={"padding-hor-20 padding-vert-10"}>
            <h1>Documentation</h1>
            <p>Welcome to the Request Tracker (Beta). If you are seeing this help page, thank you for visiting!</p>
            <p> Below is brief documentation of the request tracker and how it can be used.
                Feedback is always welcome, if something doesn't make sense or you have questions, please submit a request on Teamworks <span>
                    <FontAwesomeIcon onClick={goToTeamWorks}
                                     className={"hover"}
                                     icon={faUsers}/></span>.</p>
        </div>
        <div className={"padding-hor-20 padding-vert-10 border"}>
            <div onClick={() => toggleShow(REQUEST_SECTION)} className={"hover"}>
                <h1 className={"inline-block"}>Request Sections</h1>
                <FontAwesomeIcon className="request-selector-icon inline-block float-right" icon={ showRequestSections ? faAngleDown : faAngleRight }/>
            </div>
            {
                showRequestSections ? <div className={"margin-left-20"}>
                    <p>There are two sections for for {getHumanReadable(STATE_PENDING_REQUESTS)} and {getHumanReadable(STATE_DELIVERED_REQUESTS)}</p>
                    <h3>{getHumanReadable(STATE_PENDING_REQUESTS)}</h3>
                    <p>These requests have NOT been marked for delivery in the LIMs.</p>
                    <h3>{getHumanReadable(STATE_DELIVERED_REQUESTS)}</h3>
                    <p>These requests have been marked for delivery in the LIMs.</p>
                    <p>Only requests delivered in the last 7 days are returned.</p>
                </div>
                    : <div></div>
            }
        </div>
        <div className={"padding-hor-20 padding-vert-10 border"}>
            <div onClick={() => toggleShow(REQUEST_VIEW)} className={"hover"}>
                <h1 className={"inline-block"}>Request View</h1>
                <FontAwesomeIcon className="request-selector-icon inline-block float-right" icon={ showRequestView ? faAngleDown : faAngleRight }/>
            </div>
            {
                showRequestView ? <div className={"margin-left-20"}>
                    <p>In each section, requests available to the logged-in user will begin populating. Loading requests will have an ellipsis icon.</p>
                    <img className={"help-img"} src={requestViewMultiple} alt={"request-view-multiple"}></img>
                    <p>Once loaded, requests will display an icon on the right that indicates the stage completion status of the request samples in the workflow.
                        For more information on stages, please take a look at the "Stages" section</p>
                    <img className={"help-img"} src={requestStatus} alt={"request-status-icons"}></img>
                    <p>Each request can be toggled to view a more detailed description of the request</p>
                    <img className={"help-img"} src={requestView} alt={"request-view"}></img>
                    <p>To investigate individual samples in the request, toggling the "View Samples" button will display more samples</p>
                    <img className={"help-img"} src={sampleView} alt={"sample-view"}></img>
                    <p>To Admin users, a tree view is available by clicking on the sample icon</p>
                    <img className={"help-img"} src={treeView} alt={"tree-view"}></img>
                    <Row>
                        <Col xs={6}>
                            <p>Each node in the tree represents the progress of the sample in a LIMS workflow</p>
                            <img className={"help-img"} src={aliquot} alt={"tree-view"}></img>
                        </Col>
                        <Col xs={6}>
                            <p>Each node has a status that indicates its status at that step in a workflow</p>
                            <img className={"help-img"} src={aliquotStatus} alt={"tree-view"}></img>
                        </Col>
                    </Row>
                </div> : <div></div>
            }
        </div>
        <div className={"padding-hor-20 padding-vert-10 border"}>
            <div onClick={() => toggleShow(STAGE_SECTION)} className={"hover"}>
                <h1 className={"inline-block"}>Stages</h1>
                <FontAwesomeIcon className="request-selector-icon inline-block float-right" icon={ showStageSection ? faAngleDown : faAngleRight }/>
            </div>
            {
                showStageSection ? <div className={"margin-left-20"}>
                    <p> Stages are the steps an IGO sample must progress through before being delivered.
                        Workflows are categorized into the stage they belong to. For example, the "10x Genomics Library
                        Preparation" workflow belongs to the "Library Prepration" stage.
                        A sample or request with a pending stage is waiting for a sample in that stage to progress.
                    </p>
                    <p> A request will have the stages of the samples in that request.
                        However, it is important to note that a request will be more conservative than one of its
                        samples in reporting its overall progress. <span className={"bold"}>A request will report it has
                        completed a stage ONLY if all samples in that request have completed that stage</span>.
                        This means that if there is a lagging sample, the request will report it hasn't completed a
                        stage even if most of the samples are at a more advanced stage in the workflow. For instance,
                        below one sample is still pending "Library Preparation" even though two samples have advanced to
                        "STR Analysis". The request will remain in the "Library Preparation" stage until the lagging
                        sample has either failed or completed that stage.
                    </p>
                    <img className={"help-img"} src={conservativeStage} alt={"conservative-stage"}></img>
                    <p> Some notes on stage completion,</p>
                    <ul>A sample is considered to have completed a stage if it has either failed or moved onto the next stage</ul>
                    <ul>A request is considered to have completed a stage if all of its samples have completed that stage.
                        For example, a request with four samples at stage II and two samples at stage III will report that it is pending stage II.</ul>
                    <h2>How are stages determined?</h2>
                    <p> Every sample IGO receives enters a workflow defined in our Laboratory Information Management System (LIMS).
                        It is tracked in our LIMS through each workflow by creating representative data records at each step in a workflow.
                        Each one of these data records has a status that summarizes the step the physical sample was at.
                        This status record of a data record is mapped to a corresponding stage (below).</p>
                    <div className={"help-stage-mapper"}>
                        <TableContainer component={Paper}>
                            <Table aria-label="stage-mapper">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><span className={"bold"}>Stage</span></TableCell>
                                        <TableCell><span className={"bold"}>Workflow</span></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stagesRows.map((row) => (
                                        <TableRow key={`${row.stage}-${row.workflow}`}>
                                            <TableCell align="right">{row.stage}</TableCell>
                                            <TableCell align="right">{row.workflow}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <h3>Special Cases</h3>
                    <p><span className={"bold"}>Data QC</span></p>
                    <p> The Data QC stage is determined by whether a LIMS Sample Data Record is "linked" to a "SeqAnalysisSampleQC" Data Record.
                        This is unlike the other stages for which there is a direct mapping of status-to-stage, the Data QC stage.</p>
                </div> : <div></div>
            }

        </div>
    </div>
};

export default HelpSection;
