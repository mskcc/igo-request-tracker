import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal, {sendUpdate, MODAL_UPDATE, MODAL_ERROR, MODAL_SUCCESS} from "object-modal";

import './App.css';
import {getDeliveredProjectsRequest, getUndeliveredProjectsRequest, getUserSession} from "./services/services";
import {updateDelivered, updateModalUpdater, updateUndelivered} from "./redux/dispatchers";
import {Col, Container} from "react-bootstrap";
import {faHome, faQuestion, faComment} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@material-ui/core/IconButton";
import ProjectSection from "./components/project-section/project-section";
import {STATE_DELIVERED_REQUESTS, STATE_MODAL_UPDATER, STATE_PENDING_REQUESTS} from "./redux/reducers";
import {HOME} from "./config";
import HelpSection from "./components/help-section/help";
import Feedback from "./components/common/feedback";
import {Subject} from "rxjs";
import {generateTextInput, getHumanReadable} from "./utils/utils";
import ProjectTracker from "./components/project-tracker";
import Row from "react-bootstrap/Row";

function App() {
    const [showFeedback, setShowFeedback] = useState(false);
    const deliveredRequests = useSelector(state => state[STATE_DELIVERED_REQUESTS] );
    const pendingRequests = useSelector(state => state[STATE_PENDING_REQUESTS] );

    const [xlsxDeliveredList, setXlsxDeliveredList] = useState([]);
    const [xlsxPendingRequests, setXlsxPendingRequests] = useState([]);

    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );
    const dispatch = useDispatch();

    // TODO - Temp helpers for locating projects
    const [requestQuery, setRequestQuery] = useState('');
    const [pendingQuery, setPendingQuery] = useState('');
    const [deliveredQuery, setDeliveredQuery] = useState('');
    const [locatorPrompt, setLocatorPrompt] = useState('');

    useEffect(() => {
        const modalUpdater = new Subject();
        updateModalUpdater(dispatch, modalUpdater);

        getDeliveredProjectsRequest()
            .then((projectList) => {
                const requests = projectList['requests'] || [];
                setXlsxDeliveredList(requests);
                const deliveredProjects = {};
                for (const project of requests) {
                    // TODO - api
                    const requestId = project['requestId'];
                    if(requestId){
                        deliveredProjects[requestId] = null;
                    }
                }
                sendUpdate(modalUpdater, 'Loaded delivered requests', MODAL_SUCCESS, 1000);
                updateDelivered(dispatch, deliveredProjects);
            })
            .catch((err) => {
                sendUpdate(modalUpdater, 'Failed to load delivered requests', MODAL_ERROR, 5000);
            });
        getUndeliveredProjectsRequest()
            .then((projectList) => {
                const requests = projectList['requests'] || [];
                setXlsxPendingRequests(requests);
                const unDelivered = {};
                for (const project of requests) {
                    // TODO - api
                    const requestId = project['requestId'];
                    if(requestId){
                        unDelivered[requestId] = null;
                    }
                }
                sendUpdate(modalUpdater, 'Loaded pending requests', MODAL_SUCCESS, 1000);
                updateUndelivered(dispatch, unDelivered);
            })
            .catch((err) => {
                sendUpdate(modalUpdater, 'Failed to load pending requests', MODAL_ERROR, 5000);
            });

        getUserSession()
            .then((session)=> {
                const greeting = session.firstName;
                if(greeting) {
                    sendUpdate(modalUpdater, `Hi ${greeting}`, MODAL_UPDATE, 4000);
                }
            })
            .catch((err) => {
                console.error("Failed to retrieve user data");
            });
    }, [dispatch]);

    useEffect(() => {
        console.log(requestQuery);
        console.log(deliveredRequests[requestQuery]);
        if(deliveredRequests[requestQuery] !== undefined){
            setLocatorPrompt(`Request '${requestQuery}' has been delivered`);
            setDeliveredQuery(requestQuery);
        } else if(pendingRequests[requestQuery] !== undefined){
            setLocatorPrompt(`Request '${requestQuery}' is pending`);
            setPendingQuery(requestQuery);
        }  else {
            if(requestQuery.length >= 5 && requestQuery.length < 9){
                setLocatorPrompt(`Request '${requestQuery}' not found. If this is a valid request ID, please submit feedback`);
            } else if (requestQuery.length >= 9){
                const truncated = requestQuery.substring(0,8);
                setLocatorPrompt(`Request '${truncated}...' not found. If this is a valid request ID, please submit feedback`);
            } else {
                setLocatorPrompt('');
            }
        }
    }, [requestQuery]);

    return (
        <div>
            {
                Object.keys(modalUpdater).length > 0 ? <Modal modalUpdater={modalUpdater}/> : <div></div>
            }
            <Router basename={"/"}>
                <header className="App-header background-mskcc-black padding-vert-10 text-align-center">
                    <span className={"float-left inline-block width-100 padding-vert-10"}>
                        <Link to={`${HOME}/`}>
                            <FontAwesomeIcon className={"font-1p5em text-align-center mskcc-white"} icon={faHome}/>
                        </Link>
                    </span>
                    <h1 className={"inline-block"}>IGO Request Tracker (BETA)</h1>
                    <span className={"float-right inline-block width-100 padding-vert-10"}>
                        <Link to={`${HOME}/help`}>
                            <FontAwesomeIcon className={"font-1p5em text-align-center mskcc-white"} icon={faQuestion}/>
                        </Link>
                    </span>
                    <IconButton aria-label="feedback"
                                onClick={() => setShowFeedback(!showFeedback)}
                                className={"project-search-submit hover inline-block float-right"}>
                        <FontAwesomeIcon className={"font-1p5em text-align-center mskcc-white"} icon={faComment}/>
                    </IconButton>
                </header>
                { showFeedback ? <Feedback closeFeedback={() => setShowFeedback(false)}/> : <div></div> }
                <Container className={"margin-vert-20"}>
                    <Switch>
                        <Route exact path={`${HOME}/`}>
                            <div className={"border"}>
                                <Container>
                                    <Row className={"black-border backgorund-light-gray padding-vert-20 padding-hor-20"}>
                                        <Col xs={12}>
                                            <h2>Where is my request?</h2>
                                        </Col>
                                        <Col xs={6}>{generateTextInput("Request ID", requestQuery, setRequestQuery)}</Col>
                                        <Col xs={6}>
                                            <h5 className={"italic"}>{locatorPrompt}</h5>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                            <ProjectSection projectMapping={pendingRequests}
                                            projectState={STATE_PENDING_REQUESTS}
                                            xlsxData={xlsxPendingRequests}
                                            parentQuery={pendingQuery}></ProjectSection>
                            <ProjectSection projectMapping={deliveredRequests}
                                            projectState={STATE_DELIVERED_REQUESTS}
                                            xlsxData={xlsxDeliveredList}
                                            parentQuery={deliveredQuery}></ProjectSection>
                        </Route>
                        <Route exact path={`${HOME}/help`}>
                            <HelpSection/>
                        </Route>
                    </Switch>
                </Container>
            </Router>
        </div>
    );
}

export default App;
