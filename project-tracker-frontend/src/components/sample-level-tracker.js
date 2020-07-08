import {Col, Container, Row} from "react-bootstrap";
import StageLevelTracker from "./stage-level-tracker";
import Tree from "react-d3-tree";
import React, {useState} from "react";
import {faFlask} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const treeContainerHeight = 600;

const treeContainerStyle = {
    height: `${treeContainerHeight}px`
};

const translate = {
    y: treeContainerHeight/2,
    x: 20
};

function SampleTree({sample, idx}){
    const [showTree, setShowTree] = useState(false);

    const root = sample['root'] || {};
    const sampleId = sample['sampleId'];
    const plus1Idx = idx+1;
    const status = sample['status'];

    let toggleClasses = "request-selector-icon fa-layers fa-fw hover inline-block";
    if(showTree) {
        toggleClasses += ' fade-color'
    }

    // TODO - api constants
    if(status === 'Complete'){
        toggleClasses += ' mskcc-black';
    } else if (status === 'Failed'){
        toggleClasses += ' mskcc-red';
    } else {
        toggleClasses += ' mskcc-dark-blue';
    }

    return <Row key={sampleId} className={"border"}>
        <Col xs={3} sm={2} md={1} className={"padding-vert-10"}>
            <span className={toggleClasses}
                  onClick={() => setShowTree(!showTree)}>
                <FontAwesomeIcon icon={faFlask}/>
                <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{plus1Idx}</span>
            </span>
        </Col>
        <Col xs={9} sm={10} md={11} className={"padding-vert-10 overflow-x-auto"}>
            <StageLevelTracker label={sample['sampleId']}
                               stages={sample.stages}
                               orientation={"horizontal"}
                               projectView={false}></StageLevelTracker>
        </Col>
        {
            showTree ? <Col xs={12} className={"sample-tree-container"} style={treeContainerStyle}>
                <Row className={"sample-info"}>
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
                <Tree data={sample.root}
                      translate={translate}
                      orientation={"horizontal"}
                      nodeSize={
                          {x: 300, y: 100}
                      }
                      zoom={0.5}/>
                </Col>
                :
                <div></div>
        }
    </Row>;
}

function SampleLevelTracker({samples}) {
    return <Container>
        {
            (samples.length > 0) ? samples.map((sample, idx) => {
                return <SampleTree  sample={sample}
                                    idx={idx}
                                    key={`${sample}-${idx}`}></SampleTree>;
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
