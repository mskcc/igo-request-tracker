import {STATE_DELIVERED_PROJECTS, STATE_UNDELIVERED_PROJECTS} from "../../redux/reducers";
import React, {useState} from "react";
import {getHumanReadable} from "../../utils/utils";
import projectView from './assets/project_view.png';
import projectViewMultiple from './assets/project-view-multiple.png';
import projectStatus from './assets/project_status.png';
import sampleView from './assets/sample_filter.png';
import treeView from './assets/sample_level.png';
import aliquot from './assets/aliquot.png';
import aliquotStatus from './assets/aliquot_status.png';
import conservativeStage from './assets/conservative-stage.png';
import {Col, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faAngleRight} from "@fortawesome/free-solid-svg-icons";

function HelpSection() {
    const PROJECT_SECTION = 'PROJECT_SECTION';
    const PROJECT_VIEW = 'PROJECT_VIEW';
    const STAGE_SECTION = 'STAGE_SECTION';

    const [showProjectsections, setShowProjectSections] = useState(false);
    const [showProjectView, setShowProjectView] = useState(false);
    const [showStageSection, setShowStageSection] = useState(false);

    const toggleShow = (type) => {
        if(PROJECT_SECTION === type){
            setShowProjectSections(!showProjectsections);
        } else if(PROJECT_VIEW === type){
            setShowProjectView(!showProjectView);
        } else if(STAGE_SECTION === type){
            setShowStageSection(!showStageSection);
        }
    };

    return <div className={"border padding-vert-10 padding-hor-20"}>
        <h1>HELP Section</h1>
        <p>Welcome to the Project Tracker (Beta). If you are seeing this help page, thank you for visiting!</p>
        <p>Below is brief documentation of the project tracker, how it can be used, and what you can do to help.</p>
        <div>
            <div onClick={() => toggleShow(PROJECT_SECTION)} className={"hover"}>
                <h1 className={"inline-block"}>Project Sections</h1>
                <FontAwesomeIcon className="project-selector-icon inline-block float-right" icon={ showProjectsections ? faAngleDown : faAngleRight }/>
            </div>
            {
                showProjectsections ? <div>
                    <p>There are two sections for for {getHumanReadable(STATE_UNDELIVERED_PROJECTS)} and {getHumanReadable(STATE_DELIVERED_PROJECTS)}</p>
                    <h3>{getHumanReadable(STATE_UNDELIVERED_PROJECTS)}</h3>
                    <p>These projects have never been marked IGO-complete</p>
                    <h3>{getHumanReadable(STATE_DELIVERED_PROJECTS)}</h3>
                    <p>These projects have been marekd IGO-complete</p>
                </div>
                    : <div></div>
            }
        </div>
        <div>
            <div onClick={() => toggleShow(PROJECT_VIEW)} className={"hover"}>
                <h1 className={"inline-block"}>Project View</h1>
                <FontAwesomeIcon className="project-selector-icon inline-block float-right" icon={ showProjectView ? faAngleDown : faAngleRight }/>
            </div>
            {
                showProjectView ? <div>
                    <p>In each section, projects available to the logged-in user will begin populating. Loading projects will have an ellipsis icon.</p>
                    <img className={"help-img"} src={projectViewMultiple} alt={"project-view-multiple"}></img>
                    <p>Once loaded, projects will display an icon on the right that indicates the stage completion status of the project samples in the workflow.
                        For more information on stages, please take a look at the "Stages" section</p>
                    <img className={"help-img"} src={projectStatus} alt={"project-status-icons"}></img>
                    <p>Each Project can be toggled to view a more detailed description of the project</p>
                    <img className={"help-img"} src={projectView} alt={"project-view"}></img>
                    <p>To investigate individual samples in the project, toggling the "View Samples" button will display more samples</p>
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
        <div>
            <div onClick={() => toggleShow(STAGE_SECTION)} className={"hover"}>
                <h1 className={"inline-block"}>Stages</h1>
                <FontAwesomeIcon className="project-selector-icon inline-block float-right" icon={ showStageSection ? faAngleDown : faAngleRight }/>
            </div>
            {
                showStageSection ? <div>
                    <p> Stages are the steps an IGO sample must progress through before being delivered.
                        Workflows are categorized into the stage they belong to. For example, the "10x Genomics Library
                        Preparation" workflow belongs to the "Library Prepration" stage.
                        A sample or project with a pending stage is waiting for a sample in that stage to progress.
                    </p>
                    <p> A project will have the stages of the samples in that project.
                        However, it is important to note that a project will be more conservative than one of its
                        samples in reporting its overall progress. <span className={"bold"}>A project will report it has
                        completed a stage ONLY if all samples in that project have completed that stage</span>.
                        This means that if there is a lagging sample, the project will report it hasn't completed a
                        stage even if most of the samples are at a more advanced stage in the workflow. For instance,
                        below one sample is still pending "Library Preparation" even though two samples have advanced to
                        "STR Analysis". The project will remain in the "Library Preparation" stage until the lagging
                        sample has either failed or completed that stage.
                    </p>
                    <img className={"help-img"} src={conservativeStage} alt={"conservative-stage"}></img>
                    <p> Some notes on stage completion,</p>
                    <ul>A sample is considered to have completed a stage if it has either failed or moved onto the next stage</ul>
                    <ul>A project is considered to have completed a stage if all of its samples have completed that stage.
                        For example, a project with four samples at stage II and two samples at stage III will report that it is pending stage II.</ul>
                </div> : <div></div>
            }

        </div>
    </div>
};

export default HelpSection;
