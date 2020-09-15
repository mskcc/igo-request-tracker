import {Col, Container, Row} from "react-bootstrap";
import StageLevelTracker from "./stage-level-tracker";
import Tree from "react-d3-tree";
import React, {useState} from "react";
import {faFlask, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSelector} from "react-redux";
import {STATE_USER_SESSION} from "../redux/reducers";

const treeContainerHeight = 600;

const treeContainerStyle = {
    height: `${treeContainerHeight}px`
};

const translate = {
    y: treeContainerHeight/2,
    x: 20
};

function SampleTree({sample, idx}){
    const userSession = useSelector(state => state[STATE_USER_SESSION] );
    // TODO - constant
    const isUser = userSession['isUser'] || false;

    const [showTree, setShowTree] = useState(false);

    const root = sample['root'] || {};
    const sampleId = root['recordName'] || sample['sampleId'];
    const plus1Idx = idx+1;
    const status = sample['status'];

    let toggleClasses = "large-icon fa-layers fa-fw hover inline-block";
    if(showTree) {
        toggleClasses += ' fade-color'
    }

    // TODO - api constants
    if(status === 'Complete'){
        toggleClasses += ' mskcc-black';
    } else if (status === 'Failed'){
        toggleClasses += ' fail-red';
    } else {
        toggleClasses += ' update-blue';
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
                        isUser ? <span></span> : <FontAwesomeIcon className={"tiny-icon hover"}
                                         icon={faProjectDiagram}
                                         onClick={toggleTree}/>
                    }

                </div>
            </div>
        </Col>
        <Col xs={6} sm={7} md={9} className={"padding-vert-10 overflow-x-auto"}>
            <StageLevelTracker label={sample['sampleId']}
                               stages={sample.stages}
                               orientation={"horizontal"}
                               projectView={false}></StageLevelTracker>
        </Col>
        <Col xs={3} md={2}  className={"padding-vert-10"}>
            <span className={toggleClasses}
                  onClick={toggleTree}>
                <FontAwesomeIcon icon={faFlask}/>
                <span className="fa-layers-bottom fa-layers-text fa-inverse sample-count-layers-text-override">{plus1Idx}</span>
            </span>
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
        <Row>
            <Col xs={3} sm={2} md={1} className={"padding-vert-10 text-align-center"}>
                <p>Sample</p>
            </Col>
            <Col xs={6} sm={7} md={9} className={"padding-vert-10 text-align-center overflow-x-auto"}>
                <p>Stage Progress</p>
            </Col>
            <Col xs={3} md={2}  className={"padding-vert-10 text-align-center"}>
                <p>Status</p>
            </Col>
        </Row>
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
