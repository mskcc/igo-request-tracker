import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './App.css';
import {getDeliveredProjectsRequest, getUndeliveredProjectsRequest} from "./services/services";
import {updateDelivered, updateUndelivered} from "./redux/dispatchers";
import { Container } from "react-bootstrap";
import {faHome, faQuestion, faComment} from "@fortawesome/free-solid-svg-icons";
import MuiButton from "@material-ui/core/Button/Button";
import IconButton from "@material-ui/core/IconButton";
import ProjectSection from "./components/project-section/project-section";
import {STATE_DELIVERED_PROJECTS, STATE_UNDELIVERED_PROJECTS} from "./redux/reducers";
import {HOME} from "./config";
import HelpSection from "./components/help-section/help";
import Feedback from "./components/common/feedback";

function App() {
    const [showFeedback, setShowFeedback] = useState(true);
    const deliveredProjects = useSelector(state => state[STATE_DELIVERED_PROJECTS] );
    const undeliveredProjects = useSelector(state => state[STATE_UNDELIVERED_PROJECTS] );
    const dispatch = useDispatch();

    useEffect(() => {
        getDeliveredProjectsRequest()
            .then((projectList) => {
                const requests = projectList['requests'] || [];
                const deliveredProjects = {};
                for (const project of requests) {
                    // TODO - api
                    const requestId = project['requestId'];
                    if(requestId){
                        deliveredProjects[requestId] = null;
                    }
                }
                updateDelivered(dispatch, deliveredProjects);
            })
            .catch((err) => {
                // TODO - update UI
                console.error(`Failed to retrieve projects: ${err}`);
            });
        getUndeliveredProjectsRequest()
            .then((projectList) => {
                const requests = projectList['requests'] || [];
                const unDelivered = {};
                for (const project of requests.slice(requests.length-100,requests.length-1)) {
                    // TODO - api
                    const requestId = project['requestId'];
                    if(requestId){
                        unDelivered[requestId] = null;
                    }
                }
                updateUndelivered(dispatch, unDelivered);
            })
            .catch((err) => {
                // TODO - update UI
                console.error(`Failed to retrieve projects: ${err}`);
            });
    }, [dispatch]);

    return (
        <div className="App">
            <Router basename={"/"}>
                <header className="App-header padding-vert-10">
                    <span className={"float-left inline-block width-100 padding-vert-10"}>
                        <Link to={`${HOME}/`}>
                            <FontAwesomeIcon className={"font-1p5em text-align-center white-color"} icon={faHome}/>
                        </Link>
                    </span>
                    <h1 className={"inline-block"}>IGO Project Tracker (BETA)</h1>
                    <span className={"float-right inline-block width-100 padding-vert-10"}>
                        <Link to={`${HOME}/help`}>
                            <FontAwesomeIcon className={"font-1p5em text-align-center white-color"} icon={faQuestion}/>
                        </Link>
                    </span>
                    <IconButton aria-label="feedback"
                                onClick={() => setShowFeedback(!showFeedback)}
                                className={"project-search-submit hover inline-block float-right"}>
                        <FontAwesomeIcon className={"font-1p5em text-align-center white-color"} icon={faComment}/>
                    </IconButton>
                </header>
                { showFeedback ? <Feedback closeFeedback={() => setShowFeedback(false)}/> : <div></div> }
                <body>
                    <Container className={"margin-vert-20"}>
                        <Switch>
                            <Route exact path={`${HOME}/`}>
                                <div className={"border"}>
                                    <ProjectSection projectMapping={undeliveredProjects}
                                                    projectState={STATE_UNDELIVERED_PROJECTS}></ProjectSection>
                                    <ProjectSection projectMapping={deliveredProjects}
                                                    projectState={STATE_DELIVERED_PROJECTS}></ProjectSection>
                                </div>
                            </Route>
                            <Route exact path={`${HOME}/help`}>
                                <HelpSection/>
                            </Route>
                        </Switch>
                    </Container>
                </body>
            </Router>
        </div>
    );
}

export default App;
