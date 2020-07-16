import React, {useState} from 'react';
import {convertUnixTimeToDateString} from "../utils/utils";
import {Step, StepLabel, Stepper} from "@material-ui/core";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';
import {
    faCheck,
    faEllipsisH
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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


function StageLevelTracker({label, stages, orientation, projectView}) {
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
        return stepIdx < pendingIndex
    };

    const generateStageSummary = (stage) => {
        const stageName = stage['stage'] || '';

        // TODO - Submitted is often inconsistent w/ its number of samples
        if('Submitted' === stageName){
            return <span></span>
        }

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

        // Renders the updated field
        const updateSpan = (stage) => {
            let updateField = 'Updated';
            if(stage.complete){
                updateField = 'Completed';
            }
            if(stage.updateTime === null || stage.updateTime === undefined) {
                return <p></p>
            }
            return <p>
                <span className={"underline"}>{updateField}</span>: {convertUnixTimeToDateString(stage.updateTime)}
            </p>
        };

        const startedSpan = (stage) => {
            const startTime = stage.startTime;

            if(startTime === null || startTime === undefined) {
                return <p></p>
            }
            return <p>
                <span className={"underline"}>Started</span>: {convertUnixTimeToDateString(startTime)}
            </p>
        };

        /*
        {startedSpan(stage)}
        {updateSpan(stage)}
        */

        return <span>
            { stage.complete ? <FontAwesomeIcon className="stage-tracker-icon mskcc-dark-green" icon={ faCheck }/>
                : <FontAwesomeIcon className="stage-tracker-icon mskcc-dark-blue" icon={ faEllipsisH }/> }
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
                        const isCompleted = showStepIsCompleted(index);
                        const stageProps = {
                            completed: isCompleted
                        };
                        const labelProps = {};
                        if(projectView){
                            labelProps.optional = generateStageSummary(stage);
                        };

                        const name = stage.stage;
                        return (
                            <Step key={name} {...stageProps}>
                                <StepLabel {...labelProps}><span className={"hover bold"}>{name}</span></StepLabel>
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
