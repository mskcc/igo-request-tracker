import React, {useState} from 'react';
import {
    convertUnixTimeToDateString_Day,
    convertUnixTimeToDateStringFull
} from "../utils/utils";
import {Step, StepLabel, Stepper} from "@material-ui/core";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import {
    faCheck,
    faEllipsisH
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from '@material-ui/core/Tooltip';

const getPendingIndex = (stages) => {
    let stage;
    for(let i = 0; i<stages.length; i++){
        stage = stages[i];
        if(!stage['complete']){
            return i;
        }
    }
    return stages.length;
};


/**
 *
 * @param isProjectComplete - Is the Project complete? This will override all view indications of pending status
 * @param stages
 * @param orientation
 * @param projectView
 * @returns {*}
 * @constructor
 */
function StageLevelTracker({igoCompleteDate, stages, orientation, projectView}) {
    const isProjectComplete = igoCompleteDate !== null && igoCompleteDate !== '';

    const [pendingIndex, setPendingIndex] = useState(getPendingIndex(stages));     // Index of least-progressed step
    const [activeIndex, setActiveIndex] = useState(pendingIndex);       // Active state to show user
    const [labelSize, setLabelSize] = useState(projectView ? 0 : 2);

    /**
     * Shows to the user whether a step is complete. All stages preceding the pending index are considered complete
     *
     * @param step, int - Step of the step being considered
     * @returns {boolean}
     */
    const showStepIsCompleted = (stepIdx) => {
        return (stepIdx < pendingIndex) || isProjectComplete;
    };

    const generateStageSummary = (stage, isStageComplete) => {
        const completedCount = stage.completedSamples || 0;
        const failedCount = stage.failedSamples || 0;
        const progressCount = completedCount + failedCount;
        const total = stage.totalSamples;

        // Only render failed samples if there are any failed
        const failedSpan = () => {
            if(failedCount > 0){
                return <p><span className={"underline"}>
                    Failed</span>: {failedCount}</p>
            }
            return <span></span>
        };

        // It's confusing for a stage's update time to be after the completion date. This can happen if someone edits a
        // sample after it has been delivered (e.g. add more info), then its update time will be after the date is has
        // been manually marked for completion.
        let updateTime = stage.updateTime;
        if(isProjectComplete && igoCompleteDate < updateTime){
            updateTime = igoCompleteDate;
        }

        const updateField = isStageComplete ? 'Completed' : 'Updated';
        const updateTimeMessage = updateTime ? `UPDATED: ${convertUnixTimeToDateStringFull(updateTime)}` : '';
        const startTimeMessage = stage.startTime ? `STARTED: ${convertUnixTimeToDateStringFull(stage.startTime)}` : '';
        const updateSpan = (updateTime, updateField) => {
            if(updateTime === null || updateTime === undefined) {
                return <p></p>
            }
            return <p>
                <span className={"underline"}>{updateField}</span>: {convertUnixTimeToDateString_Day(updateTime)}
            </p>
        };

        // 1) STARTED: ..., UPDATED: ...       2) STARTED: ...       3) UPDATED: ...
        const stageInfoMessage = `${startTimeMessage}${startTimeMessage !== '' && updateTimeMessage !== '' ? ', ' : ''}${updateTimeMessage}`;
        return <Tooltip title={stageInfoMessage} aria-label={'Download'} placement="left" className={"hover"}>
            <span>
                { isStageComplete ? <FontAwesomeIcon className="stage-tracker-icon success-green" icon={ faCheck }/>
                    : <FontAwesomeIcon className="stage-tracker-icon update-blue" icon={ faEllipsisH }/> }
                        {updateSpan(updateTime, updateField)}
                        <p><span className={"underline"}>
                    Progress</span>: {progressCount}/{total}
                </p>
                {failedSpan()}
            </span>
        </Tooltip>

    };

    return <Container>
        <Row>
            <Col xs={12-labelSize}>
                <Stepper activeStep={activeIndex} orientation={orientation}>
                    {stages.map((stage, index) => {
                        const isStageComplete = showStepIsCompleted(index);
                        const stageProps = {
                            completed: isStageComplete
                        };
                        const labelProps = {};
                        if(projectView){
                            labelProps.optional = generateStageSummary(stage, isStageComplete);
                        };
                        const name = stage.stage;
                        return (
                            <Step key={name} {...stageProps}>
                                <StepLabel {...labelProps}>
                                    <p className={"text-align-center bold"}>{name}</p>
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Col>
        </Row>
    </Container>;
}

export default StageLevelTracker;

StageLevelTracker.propTypes = {
    project: Project
};
