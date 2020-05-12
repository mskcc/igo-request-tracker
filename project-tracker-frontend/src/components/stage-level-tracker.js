import React, {useState} from 'react';
import {convertUnixTimeToDate} from "../utils/utils";
import {Step, StepLabel, Stepper, Typography, Button} from "@material-ui/core";
import {Row, Col, Container} from 'react-bootstrap';
import Project from '../utils/Project';

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
                            labelProps.optional = <span className={"hover"}>
                                    <p><span
                                        className={"underline"}>Progress</span>: {stage.completedSamples}/{stage.totalSamples}</p>
                                    <p><span
                                        className={"underline"}>Updated</span>: {convertUnixTimeToDate(stage.updateTime)}</p>
                                    <p><span
                                        className={"underline"}>Started</span>: {convertUnixTimeToDate(stage.startTime)}</p>
                                </span>
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
