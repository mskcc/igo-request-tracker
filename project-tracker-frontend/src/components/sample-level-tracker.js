import {Col, Container, Row} from "react-bootstrap";
import StageLevelTracker from "./stage-level-tracker";
import Tree from "react-d3-tree";
import React, {useState} from "react";
import {faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const treeContainerHeight = 600;

const treeContainerStyle = {
    height: `${treeContainerHeight}px`
};

const translate = {
    y: treeContainerHeight/2,
    x: 20
};

function SampleTree({sample}){
    const[showTree, setShowTree] = useState(false);
    const sampleId = sample['sampleId'];

    let treeToggleClasses = 'project-selector-icon hover inline-block';
    if(showTree) {
        treeToggleClasses += ' black-color';
    } else {
        treeToggleClasses += ' gray-color';
    }

    return <Row key={sampleId} className={"border"}>
        <Col xs={2} className={"padding-vert-10"}>
            <p>{sampleId}</p>
            <FontAwesomeIcon className={treeToggleClasses} icon={ faProjectDiagram }
                             onClick={() => setShowTree(!showTree)}/>
        </Col>
        <Col xs={10} className={"padding-vert-10"}>
            <StageLevelTracker label={sample['sampleId']}
                               stages={sample.stages}
                               orientation={"horizontal"}
                               projectView={false}></StageLevelTracker>
        </Col>
        {
            showTree ? <Col xs={12} className={"sample-tree-container"} style={treeContainerStyle}>
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
            samples.map(sample => {
                return <SampleTree sample={sample}></SampleTree>;
            })
        }
    </Container>
}

export default SampleLevelTracker;
