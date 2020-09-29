import React, {useState} from 'react';
import {convertUnixTimeToDateStringFull} from "../utils/utils";
import {Step, StepLabel, Stepper} from "@material-ui/core";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import {
    faCheck,
    faEllipsisH
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SettingsIcon from '@material-ui/icons/Settings';

const getPendingIndex = (stages) => {
    let stage;
    for(let i = 0; i<stages.length; i++){
        stage = stages[i];
        if(!stage['complete']){
            return i;
        }
    }
    return stages.length-1;
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
function StageLevelTracker({isProjectComplete, stages, orientation, projectView}) {
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
        const stageName = stage['stage'] || '';

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

        /* TODO: Temporarily removed */
        // Renders the updated field
        /*
        const updateSpan = (stage) => {
            let updateField = 'Updated';
            if(isStageComplete){
                updateField = 'Completed';
            }
            if(stage.updateTime === null || stage.updateTime === undefined) {
                return <p></p>
            }
            return <p>
                <span className={"underline"}>{updateField}</span>: {convertUnixTimeToDateStringFull(stage.updateTime)}
            </p>
        };

        const startedSpan = (stage) => {
            const startTime = stage.startTime;

            if(startTime === null || startTime === undefined) {
                return <p></p>
            }
            return <p>
                <span className={"underline"}>Started</span>: {convertUnixTimeToDateStringFull(startTime)}
            </p>
        };
        {startedSpan(stage)}
        {updateSpan(stage)}
        */

        return <span>
            { isStageComplete ? <FontAwesomeIcon className="stage-tracker-icon success-green" icon={ faCheck }/>
                : <FontAwesomeIcon className="stage-tracker-icon update-blue" icon={ faEllipsisH }/> }
            <p><span className={"underline"}>
                Progress</span>: {progressCount}/{total}
            </p>
            {failedSpan()}
        </span>
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
                                    <span className={"hover bold"}>{name}</span>
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
