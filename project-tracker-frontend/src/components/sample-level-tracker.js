import {Col, Container, Row} from "react-bootstrap";
import StageLevelTracker from "./stage-level-tracker";
import Tree from "react-d3-tree";
import React, {useState} from "react";
import {faFlask, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Tooltip from '@material-ui/core/Tooltip';
import {useSelector} from "react-redux";
import {STATE_USER_SESSION} from "../redux/reducers";
import {getMaterialInfo} from "../utils/utils";

const treeContainerHeight = 600;

const treeContainerStyle = {
    height: `${treeContainerHeight}px`
};

const translate = {
    y: treeContainerHeight/2,
    x: 20
};

/**
 * Generates the row to display quantity information about the sample
 * @param concentration
 * @param volume
 * @param mass
 * @param sampleType
 * @returns {*}
 */
const generateSampleQuantityRow = function(concentration, volume, mass, sampleType) {
    return (volume || mass) ? <Row>
        <Col xs={4} md={2}>
            <p className={"bold"}>{`${sampleType} Volume:`}</p>
        </Col>
        <Col md={2}>
            <p className={"float-left"}>{ volume || 'Not Available' }</p>
        </Col>
        <Col xs={4} md={2}>
            <p className={"bold"}>{`${sampleType} Concentration:`}</p>
        </Col>
        <Col xs={8} md={2}>
            <p className={"float-left"}>{concentration}</p>
        </Col>
        <Col xs={4} md={2}>
            <p className={"bold"}>{`${sampleType} Mass:`}</p>
        </Col>
        <Col xs={8} md={2}>
            <p className={"float-left"}>{mass}</p>
        </Col>
    </Row> : <Row></Row>
}

/**
 *
 * @param isProjectComplete - Is the project complete?
 * @param sample
 * @param idx
 * @returns {*}
 * @constructor
 */
function SampleTree({igoCompleteDate, sample, requestName}){
    const userSession = useSelector(state => state[STATE_USER_SESSION] );

    // TODO - constant
    // TODO - temporarliy allow 'selcukls' to see
    const isUser = (userSession['isUser'] || false) && (userSession['username'] !== 'selcukls');;

    const [showTree, setShowTree] = useState(false);
    const root = sample['root'] || {};
    const attributes = root['attributes'] || {};
    const sourceSampleId = attributes['sourceSampleId'] || '';
    const sampleId = root['recordName'] || sample['sampleId'];
    const status = sample['status'];

    let toggleClasses = "large-icon fa-layers fa-fw hover inline-block";
    if(showTree) {
        toggleClasses += ' fade-color'
    }

    let tooltip = '';
    // TODO - api constants
    if(status === 'Complete'){
        toggleClasses += ' success-green';
        tooltip = 'Completed';
    } else if (status === 'Failed'){
        toggleClasses += ' fail-red';
        tooltip = 'Failed';
    } else {
        toggleClasses += ' update-blue';
        tooltip = `Pending (${status})`;
    }
    // Investigator pools should not report the volume b/c they have been pooled outside of our LIMS
    const isInvestigatorPreparedPool = requestName === 'Investigator Prepared Pools';
    // These are all fields from the LimsRest API
    const sampleInfo = sample['sampleInfo'] || {};
    const dnaInfo = sampleInfo['dna_material'] || {}
    const libraryInfo = sampleInfo['library_material'] || {};
    const [dnaConcentration, dnaVolume, dnaMass] = getMaterialInfo(dnaInfo);
    const [libraryConcentration, libraryVolume, libraryMass] = getMaterialInfo(libraryInfo);
    debugger;
    if(libraryMass) {
        tooltip += ` (Library Mass: ${libraryMass})`;
    } else if(dnaMass){
        tooltip += ` (NA Mass: ${libraryMass})`;
    }

    /**
     * Toggles the tree view of a sample
     *      NOTE - This feature should NOT be available for the user
     */
    const toggleTree = () => {
        if(!isUser){
            setShowTree(!showTree);
        }
    };

    return <Row key={sampleId} className={"border"}>
        <Col xs={3} sm={2} md={1}>
            <div className={"table"}>
                <div className={"table-cell"}>
                    <p>{sampleId}</p>
                    {
                        sourceSampleId && sourceSampleId !== '' ? <p className={"font-p8em"}>({sourceSampleId})</p>
                            : <span></span>
                    }
                    {
                        isUser ? <span></span> : <FontAwesomeIcon className={"tiny-icon hover"}
                                         icon={faProjectDiagram}
                                         onClick={toggleTree}/>
                    }
                </div>
            </div>
        </Col>
        <Col xs={6} sm={7} md={9} className={"padding-vert-10 overflow-x-auto"}>
            <StageLevelTracker igoCompleteDate={igoCompleteDate}
                               stages={sample.stages}
                               orientation={"horizontal"}
                               projectView={false}></StageLevelTracker>
        </Col>
        <Col xs={3} md={2}  className={"padding-vert-10"}>
            <Tooltip title={tooltip} aria-label={tooltip} placement="right">
                <span className={toggleClasses}
                      onClick={toggleTree}>
                    <FontAwesomeIcon icon={faFlask}/>
                    <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{
                        (dnaMass || libraryMass) ? 'ng' : ''
                    }</span>
                </span>
            </Tooltip>
        </Col>
            {
            showTree ? <Col xs={12} className={"sample-tree-container"} style={treeContainerStyle}>
                <Container className={"sample-info"}>
                    <Row>
                        <Col xs={4}>
                            <p className={"bold"}>Record ID:</p>
                        </Col>
                        <Col xs={8}>
                            <p> {sampleId}</p>
                        </Col>
                        <Col xs={4}>
                            <p className={"bold"}>IGO ID:</p>
                        </Col>
                        <Col xs={8}>
                            <p>{root['recordName']}</p>
                        </Col>
                    </Row>
                    { generateSampleQuantityRow(dnaConcentration, dnaVolume, dnaMass, 'NA') }
                    { generateSampleQuantityRow(libraryConcentration, libraryVolume, libraryMass, 'Library') }
                </Container>
                <Tree data={sample.root}
                      translate={translate}
                      orientation={"horizontal"}
                      nodeSize={
                          {x: 300, y: 100}
                      }
                      zoom={0.5}/>
            </Col> : <div></div>
        }
    </Row>;
}

/**
 *
 * @param isProjectComplete - Is the project complete?
 * @param samples
 * @returns {*}
 * @constructor
 */
function SampleLevelTracker({igoCompleteDate, samples, requestName}) {
    return <Container>
        <Row>
            <Col xs={3} sm={2} md={1} className={"padding-vert-10 text-align-center"}>
                <p>Sample</p>
            </Col>
            <Col xs={6} sm={7} md={9} className={"padding-vert-10 text-align-center overflow-x-auto"}>
                <p>Workflow Progress</p>
            </Col>
            <Col xs={3} md={2}  className={"padding-vert-10 text-align-center"}>
                <p>Status</p>
            </Col>
        </Row>
        {
            (samples.length > 0) ? samples.map((sample, idx) => {
                return <SampleTree  igoCompleteDate={igoCompleteDate}
                                    sample={sample}
                                    key={`${sample}-${idx}`}
                                    requestName={requestName}></SampleTree>;
            }) :
                <Row>
                    <Col xs={12}>
                        <p className={"text-align-center"}>No Samples selected</p>
                    </Col>
                </Row>
        }
    </Container>
}

export default SampleLevelTracker;
