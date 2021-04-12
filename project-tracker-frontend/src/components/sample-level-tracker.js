import {Col, Container, Row} from "react-bootstrap";
import React, {useState} from "react";
import Tooltip from '@material-ui/core/Tooltip';
import {useTooltipStyles} from "../utils/materialClasses";
import SampleTree from "./sample-tree";
import {sampleIsCorrected} from "../utils/utils";

/**
 *
 * @param isProjectComplete - Is the project complete?
 * @param samples
 * @returns {*}
 * @constructor
 */
function SampleLevelTracker({igoCompleteDate, samples, requestName}) {
    const tooltipClasses = useTooltipStyles();
    const [showCorrected, setShowCorrected] = useState(true);

    const hasCorrectedSampleId = samples.reduce((foundCorrectedId, currSample) => {
        const isCorrected = sampleIsCorrected(currSample)
        if(isCorrected) {
            const sampleInfo = currSample['sampleInfo'] || {};
            const sampleName = sampleInfo['sampleName'];
            console.log(sampleName);
        }
        return isCorrected || foundCorrectedId;
    }, false);

    const indicateCorrections = showCorrected && hasCorrectedSampleId;
    const sampleIdTooltip = indicateCorrections ? 'Corrected Sample ID' : hasCorrectedSampleId ? 'Submitted Sample ID - currently not showing corrections' : 'Sample ID submitted by investigator - request has no corrected samples';
    const sampleIdOnClick = function() {
        if(hasCorrectedSampleId){
            setShowCorrected(!showCorrected);
        }
    };

    return <Container className={"interactiveContainer"}>
        <Row>
            <Col xs={3} lg={1} className={"padding-vert-10 text-align-center"}>
                <Tooltip title={`ID of the sample in IGO's workflow`}
                         aria-label={'IGO ID label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <p>IGO ID</p>
                </Tooltip>
            </Col>
            <Col xs={3} lg={2} className={"padding-vert-10 text-align-center"}>
                <Tooltip title={sampleIdTooltip}
                         aria-label={'Sample ID label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <div>
                    <p className={hasCorrectedSampleId ? 'hover' : ''}
                        onClick={sampleIdOnClick}>Sample ID
                        <span className={'fail-red'}>{indicateCorrections ? '*' : ''}</span>
                    </p>
                    </div>
                </Tooltip>
            </Col>
            <Col xs={2} lg={1} className={"text-align-center"}>
                <Tooltip title={`Remaining DNA/RNA mass of the sample`}
                         aria-label={'NA Mass label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <p>Remaining DNA/RNA</p>
                </Tooltip>
            </Col>
            <Col xs={2} lg={1} className={"text-align-center"}>
                <Tooltip title={`Remaining library mass of the sample`}
                         aria-label={'Library Mass label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <p>Remaining Library</p>
                </Tooltip>
            </Col>
            <Col lg={5} className={"padding-vert-10 text-align-center overflow-x-auto d-none d-lg-block"}>
                <Tooltip title={`Progression of the sample through the LIMS workflow`}
                         aria-label={'workflow progress label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <p>Workflow Progress</p>
                </Tooltip>
            </Col>
            <Col xs={2} md={2}  className={"padding-vert-10 text-align-center"}>
                <Tooltip title={`Current status of the sample in the LIMS workflow`}
                         aria-label={'status label'}
                         placement='top'
                         classes={tooltipClasses}>
                    <p>Status</p>
                </Tooltip>

            </Col>
        </Row>
        {
            (samples.length > 0) ? samples.map((sample, idx) => {
                return <SampleTree  igoCompleteDate={igoCompleteDate}
                                    sample={sample}
                                    key={`${sample}-${idx}`}
                                    requestName={requestName}
                                    showCorrected={showCorrected}></SampleTree>;
            }) :
                <Row className={"sample-row"}>
                    <Col xs={12}>
                        <p className={"text-align-center"}>No Samples selected</p>
                    </Col>
                </Row>
        }
    </Container>
}

export default SampleLevelTracker;
