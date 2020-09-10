import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal, { sendUpdate, MODAL_UPDATE, MODAL_ERROR, MODAL_SUCCESS } from "object-modal";

import './App.css';
import {getDeliveredProjectsRequest, getUndeliveredProjectsRequest, getUserSession} from "./services/services";
import {updateDelivered, updateModalUpdater, updateUndelivered} from "./redux/dispatchers";
import {Col, Container} from "react-bootstrap";
import {faHome, faQuestion, faComment, faSearch, faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@material-ui/core/IconButton";
import ProjectSection, {DF_ALL, DF_MONTH, DF_WEEK} from "./components/project-section/project-section";
import {STATE_DELIVERED_REQUESTS, STATE_MODAL_UPDATER, STATE_PENDING_REQUESTS} from "./redux/reducers";
import {HOME} from "./config";
import HelpSection from "./components/help-section/help";
import Feedback from "./components/common/feedback";
import {Subject} from "rxjs";
import {getRequestState, getSortedRequests} from "./utils/utils";
import Row from "react-bootstrap/Row";
import {REQ_deliveryDate, REQ_receivedDate} from "./utils/api-util";
import TextField from "@material-ui/core/TextField/TextField";

import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
const useStyles = makeStyles({
    root: {
        'border-bottom': '1px solid white',
        '& label': {
            'color': 'white !important'
        },
        '& Mui-focused': {
            'color': 'white !important'
        },
        '& input': {
            'caret-color': 'white',
            'color': 'white'
        }
    }
});
const theme = createMuiTheme({
    palette: {
        primary: {
            main: 'rgb(255,255,255)',
        },
        secondary: {
            main: 'rgb(255,255,255)',
        },
    },
});

function App() {
    const classes = useStyles();

    const [showFeedback, setShowFeedback] = useState(false);
    const deliveredRequests = useSelector(state => state[STATE_DELIVERED_REQUESTS] );
    const pendingRequests = useSelector(state => state[STATE_PENDING_REQUESTS] );
    const [showFilters, setShowFilters] = useState(false);
    const [deliveredRequestsList, setDeliveredRequestsList] = useState([]);
    const [pendingRequestsList, setPendingRequestsList] = useState([]);

    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );
    const dispatch = useDispatch();

    // TODO - Temp helpers for locating projects
    const [requestQuery, setRequestQuery] = useState('');
    const [pendingQuery, setPendingQuery] = useState('');
    const [deliveredQuery, setDeliveredQuery] = useState('');
    const [locatorPrompt, setLocatorPrompt] = useState('');
    const [pendingDateFilter, setPendingDateFilter] = useState(DF_WEEK);
    const [deliveredDateFilter, setDeliveredDateFilter] = useState(DF_WEEK);

    useEffect(() => {
        const modalUpdater = new Subject();
        updateModalUpdater(dispatch, modalUpdater);

        getDeliveredProjectsRequest()
            .then((projectList) => {
                const requests = getSortedRequests(projectList['requests'] || []);

                /** Take the deliveryDate that is the most recent (greatest)
                 * req: {
                 *     deliveryDate: [
                 *         UNIX_TIMESTAMP               <-- Have yet to see more than one
                 *     ],
                 *     receivedDate: UNIX_TIMESTAMP     <-- Want this format
                 * }
                 */
                requests.map((req) => {
                    const deliveryDate = req["deliveryDate"] || [];
                    if(deliveryDate.length > 0){
                        req["deliveryDate"] = deliveryDate.reduce(
                            (accumulator, currentValue) => {
                                return (accumulator > currentValue) ? accumulator : currentValue;
                            }, 0
                        );
                    } else {
                        req["deliveryDate"] = null;
                    }
                });

                setDeliveredRequestsList(requests);
                const deliveredRequests = getRequestState(requests);
                sendUpdate(modalUpdater, 'Loaded delivered requests', MODAL_SUCCESS, 1000);
                updateDelivered(dispatch, deliveredRequests);
            })
            .catch((err) => {
                sendUpdate(modalUpdater, 'Failed to load delivered requests', MODAL_ERROR, 5000);
            });
        getUndeliveredProjectsRequest()
            .then((projectList) => {
                const requests = getSortedRequests(projectList['requests'] || []);
                setPendingRequestsList(requests);
                const pendingRequests = getRequestState(requests);
                sendUpdate(modalUpdater, 'Loaded pending requests', MODAL_SUCCESS, 1000);
                updateUndelivered(dispatch, pendingRequests);
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
        if(deliveredRequests[requestQuery] !== undefined){
            setLocatorPrompt(`Request '${requestQuery}' has been delivered`);
            setDeliveredQuery(requestQuery);
            setDeliveredDateFilter(DF_MONTH);
        } else if(pendingRequests[requestQuery] !== undefined){
            setLocatorPrompt(`Request '${requestQuery}' is pending`);
            setPendingQuery(requestQuery);
            setPendingDateFilter(DF_ALL);
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

    const getTargetValue = (evt) => {
        return evt.target.value;
    };

    /**
     * Generates the search input box to query projects
     *
     * @param label, e.g. "Request ID"
     * @param val, e.g. requestQuery
     * @param fn, e.g. setRequestQuery
     * @param required, e.g. t/f
     * @returns {*}
     */
    const generateTextInput = (label, val, fn, required = false) => {
        return <div className={"search-container"}>
            <div className={"search-box"}>
                <FontAwesomeIcon className={"inline search-icon"} icon={faSearch}/>
                <TextField  id="standard-basic"
                            label={label}
                            value={val}
                            onChange={(evt) => fn(getTargetValue(evt))}
                            required={required}
                            className={classes.root}
                            color="primary"
                            InputProps={{ disableUnderline: true }}/>
            </div>
            <div className={"inline-block"}>
                <p className={"advanced-search"}>Filters</p>
                <FontAwesomeIcon className={"hover search-icon"}
                                 icon={showFilters ? faToggleOn : faToggleOff}
                                 onClick={() => setShowFilters(!showFilters)}/>
            </div>
        </div>;
    };

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
                                    <Row className={"black-border background-igo-orange padding-vert-20 padding-hor-20"}>
                                        <Col xs={12}>
                                            {generateTextInput("Request ID", requestQuery, setRequestQuery)}
                                        </Col>
                                        <Col xs={6}></Col>
                                        <Col xs={6}>
                                            <h5 className={"italic"}>{locatorPrompt}</h5>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                            <ProjectSection requestList={pendingRequestsList}
                                            projectState={STATE_PENDING_REQUESTS}
                                            parentQuery={pendingQuery}
                                            initialDateFilter={pendingDateFilter}
                                            dateFilterField={REQ_receivedDate}></ProjectSection>
                            <ProjectSection requestList={deliveredRequestsList}
                                            projectState={STATE_DELIVERED_REQUESTS}
                                            parentQuery={deliveredQuery}
                                            initialDateFilter={deliveredDateFilter}
                                            dateFilterField={REQ_deliveryDate}></ProjectSection>
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
