import React, {useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal, { sendUpdate, MODAL_ERROR } from 'object-modal';
import LoadingOverlay from 'react-loading-overlay';
import Paper from "@material-ui/core/Paper";
import {Col, Container, Row} from 'react-bootstrap';
import {faSearch, faToggleOff, faToggleOn} from '@fortawesome/free-solid-svg-icons';
import {Subject} from 'rxjs';
import TextField from '@material-ui/core/TextField/TextField';
import { makeStyles } from '@material-ui/core/styles';

import {getDeliveredProjectsRequest, getUndeliveredProjectsRequest, getUserSession} from './services/services';
import {updateDelivered, updateModalUpdater, updateUndelivered, updateUserSession} from "./redux/dispatchers";
import Header from "./components/common/header";
import ProjectSection from './components/project-section/project-section';
import HelpSection from './components/help-section/help';
import FilterIndicator from './components/common/filter-indicator';
import {
    STATE_DELIVERED_REQUESTS,
    STATE_MODAL_UPDATER,
    STATE_PENDING_REQUESTS,
    STATE_USER_SESSION
} from "./redux/reducers";
import {HOME} from './config';
import {getRequestState, getTargetValue} from './utils/utils';
import {
    renderDateFilter,
    mapDateFilter,
    DF_WEEK,
    RecipeFilter, DF_ALL
} from "./components/common/project-filters";
import './App.css';
import {USER_VIEW} from "./utils/api-util";

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
    secondary: {
        'background-color': '319AE8'
    },
    positionBottom: {
        'position': 'absolute',
        'padding': '0px',
        'bottom': '0px',
        'left': '50%',
        'transform': 'translate(-50%,0%)'
    },
    container: {
        gridArea: 'form',
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        margin: '2em auto',
        padding: '2em',
        marginBottom: '4em',
    },
});


function App() {
    const classes = useStyles();

    const [showFilters, setShowFilters] = useState(false);
    const [recipeSet, setRecipeSet] = useState(new Set());
    const [filteredRecipes, setFilteredRecipes] = useState(new Set());
    const [deliveredRequestsList, setDeliveredRequestsList] = useState([]);
    const [pendingRequestsList, setPendingRequestsList] = useState([]);
    const [dateFilter, setDateFilter] = useState(DF_ALL);

    // Loading Indicators - Loading message reflects state of loaded* state
    const [loadingMessage, setLoadingMessage] = useState('Loading projects...');
    const [loadedDelivered, setLoadedDelivered] = useState(false);
    const [loadedPending, setLoadedPending] = useState(false);

    const dispatch = useDispatch();
    const userSession = useSelector(state => state[STATE_USER_SESSION] );
    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );


    // TODO - Temp helpers for locating projects
    const [requestIdQuery, setRequestIdQuery] = useState('');

    useEffect(() => {
        // NOT_INITIALIZED is in the initial state for the userSession in redux
        if( userSession['NOT_INITIALIZED'] ) return;

        const modalUpdater = new Subject();
        updateModalUpdater(dispatch, modalUpdater);

        getDeliveredProjectsRequest(userSession[USER_VIEW])
            .then((projectList) => {
                setLoadedDelivered(true);
                const requests = projectList['requests'] || [];

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

                const deliveredRequests = getRequestState(requests);
                setLoadingMessage('Loaded delivered requests');
                updateDelivered(dispatch, deliveredRequests);
                setDeliveredRequestsList(requests); // NOTE - MUST update after store so data is available globally
            })
            .catch((err) => {
                console.error(err);
                sendUpdate(modalUpdater, 'Failed to load delivered requests', MODAL_ERROR, 5000);
            });
        getUndeliveredProjectsRequest(userSession[USER_VIEW])
            .then((projectList) => {
                setLoadedPending(true);
                const requests = projectList['requests'] || [];

                // TODO - unsafe (if pending and delivered happen at the same time)
                updateRecipes(requests);

                const pendingRequests = getRequestState(requests);
                setLoadingMessage('Loaded pending requests');
                updateUndelivered(dispatch, pendingRequests);
                setPendingRequestsList(requests); // NOTE - MUST update after store so data is available globally
            })
            .catch((err) => {
                console.error(err);
                sendUpdate(modalUpdater, 'Failed to load pending requests', MODAL_ERROR, 5000);
            });
    }, [dispatch, userSession]);

    useEffect(() => {
        getUserSession()
            .then((session) => {
                updateUserSession(dispatch, session);
                const userName = session.firstName;
                if (userName) {
                    setLoadingMessage(`Hi ${userName}. We're loading your projects...`);
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
        return  <Container className={"black-border background-mskcc-dark-gray padding-vert-20"}>
                        <Row>
                            <Col xs={12} lg={6} xl={5}
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
                                showFilters ?  <Col xs={12} lg={6} xl={7}>
                                    <div className={'filters-container'}>
                                        <div>
                                            {renderDateFilter('Submitted/Delivered in past: ', dateFilter, handleDateFilterToggle, dateFilter)}
                                        </div>
                                        <div>
                                            <RecipeFilter recipeSet={recipeSet} filteredRecipes={filteredRecipes} setFilteredRecipes={setFilteredRecipes}/>
                                        </div>
                                    </div>
                                </Col> : <Col xs={12} lg={6} xl={7}>
                                    <div>
                                        <FilterIndicator label={'Past'}
                                                         value={mapDateFilter(dateFilter)}
                                                         showCondition={dateFilter !== DF_ALL}/>
                                        <FilterIndicator label={'Recipes'}
                                                         value={Array.from(filteredRecipes).join(', ')}
                                                         showCondition={filteredRecipes.size > 0}/>
                                    </div>
                                </Col>
                            }
                    </Row>
                </Container>;
    };

    const isLoading = !(loadedDelivered && loadedPending);

    return (
        <div>
            {
                Object.keys(modalUpdater).length > 0 ? <Modal modalUpdater={modalUpdater}
                                                              successColor={'#49A078'}
                                                              updateColor={'#006098'}
                                                              errorColor={'#C03B5A'}/> : <div></div>
            }
            <Router basename={'/'}>
                <Header></Header>
                <Container>
                    <Switch>
                        <Route exact path={`${HOME}/`}>
                            {
                                isLoading ? <LoadingOverlay
                                        active={isLoading}
                                        spinner
                                        text={loadingMessage}
                                        styles={{
                                            overlay: (base) => ({
                                                ...base,
                                                'min-height': '95vh',
                                                'background': 'rgba(255, 255, 255, 0.8)',
                                                'color': '#9e9e98',
                                                'margin-top': '5vh'
                                            }),
                                            spinner: (base) => ({
                                                ...base,
                                                width: '100px',
                                                '& svg circle': {
                                                    stroke: 'rgba(158, 158, 152, 0.8)'
                                                }
                                            })
                                        }}></LoadingOverlay>
                                    : <Paper className={classes.container} elevation={1}>
                                        {generateSearchContainer('Request ID', requestIdQuery, setRequestIdQuery)}
                                        <ProjectSection requestList={pendingRequestsList}
                                                        projectState={STATE_PENDING_REQUESTS}
                                                        dateFilter={dateFilter}
                                                        requestIdQuery={requestIdQuery}
                                                        filteredRecipes={filteredRecipes}></ProjectSection>
                                        <ProjectSection requestList={deliveredRequestsList}
                                                        projectState={STATE_DELIVERED_REQUESTS}
                                                        dateFilter={dateFilter}
                                                        requestIdQuery={requestIdQuery}
                                                        filteredRecipes={filteredRecipes}></ProjectSection>
                                    </Paper>
                            }
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
