import React, {useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal, { sendUpdate, MODAL_UPDATE, MODAL_ERROR, MODAL_SUCCESS } from 'object-modal';

import './App.css';
import {getDeliveredProjectsRequest, getUndeliveredProjectsRequest, getUserSession} from './services/services';
import {updateDelivered, updateModalUpdater, updateUndelivered} from './redux/dispatchers';
import {Col, Container} from 'react-bootstrap';
import {faHome, faQuestion, faComment, faSearch, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import IconButton from '@material-ui/core/IconButton';
import ProjectSection from './components/project-section/project-section';
import {STATE_DELIVERED_REQUESTS, STATE_MODAL_UPDATER, STATE_PENDING_REQUESTS} from './redux/reducers';
import {HOME} from './config';
import HelpSection from './components/help-section/help';
import Feedback from './components/common/feedback';
import {Subject} from 'rxjs';
import {getRequestState, getSortedRequests, getTargetValue} from './utils/utils';
import Row from 'react-bootstrap/Row';
import {REQ_deliveryDate, REQ_receivedDate} from './utils/api-util';
import TextField from '@material-ui/core/TextField/TextField';
import {
    renderDateFilter,
    mapDateFilter,
    DF_WEEK,
    renderRecipeFilters,
    RecipeFilter, DF_ALL
} from "./components/common/project-filters";
import { makeStyles } from '@material-ui/core/styles';
import FilterIndicator from './components/common/filter-indicator';
const useStyles = makeStyles({
    root: {
        'margin': '5px 0px 0px 5px',
        '& label': {
            'color': 'white !important'
        },
        '& input': {
            'caret-color': 'white',
            'color': 'white'
        }
    },
    positionBottom: {
        'position': 'absolute',
        'padding': '0px',
        'bottom': '0px',
        'left': '50%',
        'transform': 'translate(-50%,0%)'
    }
});

function App() {
    const classes = useStyles();

    const [showFeedback, setShowFeedback] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [recipeSet, setRecipeSet] = useState(new Set());
    const [filteredRecipes, setFilteredRecipes] = useState(new Set());
    const [deliveredRequestsList, setDeliveredRequestsList] = useState([]);
    const [pendingRequestsList, setPendingRequestsList] = useState([]);

    const [dateFilter, setDateFilter] = useState(DF_WEEK);

    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );
    const dispatch = useDispatch();

    // TODO - Temp helpers for locating projects
    const [requestIdQuery, setRequestIdQuery] = useState('');

    useEffect(() => {
        const modalUpdater = new Subject();
        updateModalUpdater(dispatch, modalUpdater);

        getDeliveredProjectsRequest()
            .then((projectList) => {
                const requests = getSortedRequests(projectList['requests'] || []);

                // TODO - unsafe (if pending and delivered happen at the same time)
                updateRecipes(requests);

                /** Take the deliveryDate that is the most recent (greatest)
                 * req: {
                 *     deliveryDate: [
                 *         UNIX_TIMESTAMP               <-- Have yet to see more than one
                 *     ],
                 *     receivedDate: UNIX_TIMESTAMP     <-- Want this format
                 * }
                 */
                requests.map((req) => {
                    const deliveryDate = req['deliveryDate'] || [];
                    if(deliveryDate.length > 0){
                        req['deliveryDate'] = deliveryDate.reduce(
                            (accumulator, currentValue) => {
                                return (accumulator > currentValue) ? accumulator : currentValue;
                            }, 0
                        );
                    } else {
                        req['deliveryDate'] = null;
                    }
                });

                setDeliveredRequestsList(requests);
                const deliveredRequests = getRequestState(requests);
                sendUpdate(modalUpdater, 'Loaded delivered requests', MODAL_SUCCESS, 1000);
                updateDelivered(dispatch, deliveredRequests);
            })
            .catch((err) => {
                console.error(err);
                sendUpdate(modalUpdater, 'Failed to load delivered requests', MODAL_ERROR, 5000);
            });
        getUndeliveredProjectsRequest()
            .then((projectList) => {
                const requests = getSortedRequests(projectList['requests'] || []);

                // TODO - unsafe (if pending and delivered happen at the same time)
                // updateRecipes(requests);

                setPendingRequestsList(requests);
                const pendingRequests = getRequestState(requests);
                sendUpdate(modalUpdater, 'Loaded pending requests', MODAL_SUCCESS, 1000);
                updateUndelivered(dispatch, pendingRequests);
            })
            .catch((err) => {
                console.error(err);
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
                console.error('Failed to retrieve user data');
            });
    }, [dispatch]);

    const updateRecipes = (projectList) => {
        let projectRecipe;
        for(const project of projectList){
            projectRecipe = project['requestType'];
            // TODO - Project should have a constant
            if(projectRecipe){
                recipeSet.add(projectRecipe);
            }
        }
        setRecipeSet(recipeSet);
    };

    /**
     * Updates the date filter of the application based on a user input event
     *
     * @param evt
     */
    const handleDateFilterToggle = (evt) => {
        const val = getTargetValue(evt);
        setDateFilter(val);
    };

    /**
     * Generates the search input box to query projects
     *
     * @param label, e.g. 'Request ID'
     * @param val, e.g. requestIdQuery
     * @param fn, e.g. setRequestIdQuery
     * @param required, e.g. t/f
     * @returns {*}
     */
    const generateSearchContainer = (label, val, fn, required = false) => {
        return <Container className={"black-border background-igo-orange padding-vert-20"}>
                <Row>
                    <Col xs={12} md={6} lg={4}
                        className={'search-container'}>
                        <div className={'search-box'}>
                            <div className={'search-icon-container'}>
                                <FontAwesomeIcon className={'inline search-icon'} icon={faSearch}/>
                            </div>
                            <TextField  id='standard-basic'
                                        label={label}
                                        value={val}
                                        onChange={(evt) => fn(getTargetValue(evt))}
                                        required={required}
                                        className={classes.root}
                                        InputProps={{ disableUnderline: true }}/>
                        </div>
                        <div className={'filters-toggle-container inline-block'}>
                            <p className={'advanced-search'}>Filters</p>
                            <FontAwesomeIcon className={'filters-icon hover'}
                                             icon={showFilters ? faToggleOn : faToggleOff}
                                             onClick={() => setShowFilters(!showFilters)}/>
                        </div>
                    </Col>
                    {
                        showFilters ?  <Col xs={12} md={8}>
                            <div className={'filters-container'}>
                                <div>
                                    {renderDateFilter('Submitted/Delivered in past: ', dateFilter, handleDateFilterToggle, dateFilter)}
                                </div>
                                <div>
                                    <RecipeFilter recipeSet={recipeSet} filteredRecipes={filteredRecipes} setFilteredRecipes={setFilteredRecipes}/>
                                </div>
                            </div>
                        </Col> : <Col xs={12} md={8}>
                            <div>
                                <FilterIndicator label={'Past'}
                                                 value={mapDateFilter(dateFilter)}
                                                 showCondition={dateFilter !== DF_ALL}
                                                 clear={console.log}/>
                                <FilterIndicator label={'Recipes'}
                                                 value={Array.from(filteredRecipes).join(', ')}
                                                 showCondition={filteredRecipes.size > 0}
                                                 clear={console.log}/>
                            </div>
                        </Col>
                    }
            </Row>
        </Container>;
    };

    return (
            <div>
            {
                Object.keys(modalUpdater).length > 0 ? <Modal modalUpdater={modalUpdater}/> : <div></div>
            }
            <Router basename={'/'}>

                <header className='App-header background-sample-sub-blue padding-vert-10 text-align-center'>
                    <Container>
                        <Row>
                            <Col xs={2}>
                                <span className={'position-bottom'}>
                                    <Link to={`${HOME}/`}>
                                        <FontAwesomeIcon className={'font-1p5em text-align-center mskcc-white'} icon={faHome}/>
                                    </Link>
                                </span>
                            </Col>
                            <Col xs={6} md={8}>
                                <h1 className={'text-align-center'}>IGO Request Tracker (BETA)</h1>
                            </Col>
                            <Col xs={2} md={1}>
                                <span className={'position-bottom'}>
                                    <Link to={`${HOME}/help`}>
                                        <FontAwesomeIcon className={'font-1p5em text-align-center mskcc-white'} icon={faQuestion}/>
                                    </Link>
                                </span>
                            </Col>
                            <Col xs={2} md={1}>
                                <IconButton aria-label='feedback'
                                            onClick={() => setShowFeedback(!showFeedback)}
                                            className={classes.positionBottom}>
                                    <FontAwesomeIcon className={'font-2em text-align-center mskcc-white'} icon={faComment}/>
                                </IconButton>
                            </Col>
                        </Row>
                    </Container>
                </header>
                { showFeedback ? <Feedback closeFeedback={() => setShowFeedback(false)}/> : <div></div> }
                <Container>
                    <Switch>
                        <Route exact path={`${HOME}/`}>
                            {generateSearchContainer('Request ID', requestIdQuery, setRequestIdQuery)}
                            <ProjectSection requestList={pendingRequestsList}
                                            projectState={STATE_PENDING_REQUESTS}
                                            dateFilter={dateFilter}
                                            dateFilterField={REQ_receivedDate}
                                            requestIdQuery={requestIdQuery}
                                            filteredRecipes={filteredRecipes}></ProjectSection>
                            <ProjectSection requestList={deliveredRequestsList}
                                            projectState={STATE_DELIVERED_REQUESTS}
                                            dateFilter={dateFilter}
                                            dateFilterField={REQ_deliveryDate}
                                            requestIdQuery={requestIdQuery}
                                            filteredRecipes={filteredRecipes}></ProjectSection>
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
