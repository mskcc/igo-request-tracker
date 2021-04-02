import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch, useStore} from "react-redux";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal, { sendUpdate, MODAL_ERROR, MODAL_UPDATE, MODAL_SUCCESS } from 'object-modal';
import LoadingOverlay from 'react-loading-overlay';
import Paper from "@material-ui/core/Paper";
import {Col, Container, Row} from 'react-bootstrap';
import {faDownload, faSearch, faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
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
import {
    convertUnixTimeToDateStringFull,
    downloadExcel,
    extractQuantifyInfoXlsx,
    filterRequestList,
    getRequestState, getRequestTrackingInfoForRequest,
    getTargetValue
} from "./utils/utils";
import {
    renderDateFilter,
    mapDateFilter,
    RecipeFilter,
    DF_ALL
} from "./components/common/project-filters";
import './App.css';
import {REQ_deliveryDate, REQ_dueDate, REQ_receivedDate, USER_VIEW} from "./utils/api-util";
import DownloadIndicator from "./components/common/download-indicator";

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
    rootContainer: {
        'max-width': '1600px !important'
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

    const MAX_DOWNLOAD_LENGTH = 300;

    const [showFilters, setShowFilters] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [recipeSet, setRecipeSet] = useState(new Set());
    const [filteredRecipes, setFilteredRecipes] = useState(new Set());
    const [deliveredRequestsList, setDeliveredRequestsList] = useState([]);
    const [pendingRequestsList, setPendingRequestsList] = useState([]);
    const [dateFilter, setDateFilter] = useState(DF_ALL);
    const [isDownloading, setIsDownloading] = useState(false);

    // Loading Indicators - Loading message reflects state of loaded* state
    const [loadingMessage, setLoadingMessage] = useState('Loading projects...');
    const [loadedDelivered, setLoadedDelivered] = useState(false);
    const [loadedPending, setLoadedPending] = useState(false);

    const store = useStore();
    const dispatch = useDispatch();
    const userSession = useSelector(state => state[STATE_USER_SESSION] );
    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );

    const pendingRequestsState = useSelector(state => state[STATE_PENDING_REQUESTS] );
    const deliveredRequestsState = useSelector(state => state[STATE_DELIVERED_REQUESTS] );

    const generateExportDescription = () => {
        const filteredRecipesList = Array.from(filteredRecipes);
        const time = mapDateFilter(dateFilter);
        const queryString = (requestIdQuery !== '') ? ` Request ID: "${requestIdQuery}"` : '';
        const recipeString = (filteredRecipesList.length > 0) ? ` Recipes: "${filteredRecipesList.join(', ')}"` : '';
        const dateString = (dateFilter !== DF_ALL) ? ` Time: "${time}"` : '';

        const toAdd = [queryString, recipeString, dateString].filter((p) => p !== '');
        return toAdd.join(', ');
    };

    // TODO - Temp helpers for locating projects
    const [requestIdQuery, setRequestIdQuery] = useState('');

    const pendingFilterField = REQ_dueDate;
    const deliveredFilterField = REQ_deliveryDate;
    const filteredPendingRequests = filterRequestList(pendingRequestsList, filteredRecipes, requestIdQuery, dateFilter, pendingFilterField);
    const filteredDeliveredRequests = filterRequestList(deliveredRequestsList, filteredRecipes, requestIdQuery, dateFilter, deliveredFilterField);

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
     * TODO - maybe add back ability to just get request-level info
     */
    const getRequestLevelExcel = (requestList) => {
        const xlsxObjList = [];
        // TODO - constants
        const boolFields = [ "analysisRequested" ];
        const stringFields = [
            "requestId",
            "requestType",
            "pi",
            "investigator",
            "analysisType",
            "dataAccessEmails",
            "labHeadEmail",
            "qcAccessEmail"
        ];
        const dateFields = [REQ_receivedDate, REQ_deliveryDate];
        const numFields = [
            "recordId",
            "sampleNumber"
        ];
        const noFormattingFields = [...stringFields, ...numFields];

        for(const request of requestList){
            const xlsxObj = {};
            for(const field of noFormattingFields){
                const val = request[field];
                xlsxObj[field] = val ? val : "Not Available";
            }
            for(const dField of dateFields){
                const val = request[dField];
                xlsxObj[dField] = (val && val !== "") ? convertUnixTimeToDateStringFull(val) : "Not Available";
            }
            for(const field of boolFields){
                const val = request[field];
                xlsxObj[field] = val ? "yes" : "no";
            }
            xlsxObjList.push(xlsxObj);
        }

        return xlsxObjList;
    };

    /**
     * Retrieves the state of the requestId as stored in the REDUX store
     *
     * @param requestId
     * @returns {{}|*}
     */
    const retrieveRequestData = (requestId) => {
        if(requestId in pendingRequestsState){
            return pendingRequestsState[requestId];
        } else if(requestId in deliveredRequestsList){
            return deliveredRequestsList[requestId];
        }
        return {};
    };

    /**
     * Retrieves the sample tracking info for the list of requests
     *
     * @param requestList
     * @param requestState
     * @returns {[]}
     */
    const getSampleTrackingInfoForRequests = (requestList, requestState) => {
        let samplesInRequestList = [];
        for(const request of requestList){
            const requestId = request['requestId'];
            if(requestId === null || requestId === undefined || requestId === ''){
                console.error('invalid requestId');
                continue;
            }
            const requestTrackingData = requestState[requestId];
            const samples = requestTrackingData.getSamples();
            const sampleXlsxInfo = extractQuantifyInfoXlsx(samples);


            const enrichedSampleXlsxInfo = sampleXlsxInfo.map((obj) => {
                return Object.assign(obj, {
                    requestId,
                    delivered: requestTrackingData.isDelivered()
                });
            });

            samplesInRequestList = samplesInRequestList.concat(enrichedSampleXlsxInfo);
        }
        return samplesInRequestList
    };

    /**
     * Submits requests for tracking information about a list of requests
     *
     * @param requestList
     * @param stateId
     * @param requestState
     * @param store
     * @param dispatch
     * @returns {[]}
     */
    const submitRequestsForRequestTrackingInfo = (requestList, stateId, requestState, store, dispatch) => {
        const promises = [];
        for(const request of requestList){
            const requestId = request['requestId'];
            if(requestId === null || requestId === undefined || requestId === ''){
                console.error('invalid requestId');
                continue
            }

            const requestTrackingData = requestState[requestId];
            retrieveRequestData(requestId);

            // If request isn't present, or null, this should show a pending icon
            if(!requestTrackingData.isEnriched()){
                promises.push(getRequestTrackingInfoForRequest(requestId, stateId, store, dispatch));
            }
        }
        return promises;
    };

    /**
     * Generates a list of tracking information from a list of requests
     *
     * @param pReqs
     * @param dReqs
     * @returns {Promise<*[]>}
     */
    const createSampleListXlsx = async (pReqs, dReqs) => {
        // Submit requests to retrieve tracking data
        const pendingRequestPromises = submitRequestsForRequestTrackingInfo(pReqs, STATE_PENDING_REQUESTS, pendingRequestsState, store, dispatch);
        const deliveredRequestPromises = submitRequestsForRequestTrackingInfo(dReqs, STATE_DELIVERED_REQUESTS, deliveredRequestsState, store, dispatch);
        const allPromises = pendingRequestPromises.concat(deliveredRequestPromises);
        await Promise.all(allPromises);

        const pendingSampleInfo = getSampleTrackingInfoForRequests(pReqs, pendingRequestsState);
        const deliveredSampleInfo = getSampleTrackingInfoForRequests(dReqs, deliveredRequestsState);

        return pendingSampleInfo.concat(deliveredSampleInfo);
    };

    /**
     * Outputs download for user of input pending & delivered reqeusts
     *
     * @param pReqs
     * @param dReqs
     * @param name
     * @returns {Promise<void>}
     */
    const createSampleXlsxListReq = async (pReqs, dReqs, name, showWarning) => {
        const headers = [
            'requestId',
            'igoId',
            'investigatorId',
            'correctedInvestigatorId',
            'sampleName',
            'status',
            'delivered',
            'NA Concentration (ng/µL)',
            'NA Volume (µL)',
            'NA Mass (ng)',
            'libraryConcentration (ng/µL)',
            'libraryVolume (µL)',
            'libraryMass (ng)'
        ];

        if(isDownloading){
            sendUpdate(modalUpdater, `please wait for previous download to complete`, MODAL_ERROR, 10000);
            return;
        }

        setIsDownloading(true);

        if(showWarning){
            sendUpdate(modalUpdater, `[ERROR] Number of requests exceeds limit (${MAX_DOWNLOAD_LENGTH}). Please apply filters and try again.`, MODAL_ERROR, 10000);
            return;
        } else {
            sendUpdate(modalUpdater, 'Retrieving download...', MODAL_UPDATE, 5000);
        }

        const xlsx = await createSampleListXlsx(pReqs, dReqs);
        downloadExcel(xlsx, name, headers);
        sendUpdate(modalUpdater, 'Download available', MODAL_SUCCESS, 3000);
        setIsDownloading(false);
    };

    /**
     * Slices input arrays so that they will always add up to the MAX_DOWNLOAD_LENGTH (if they equal or exceed it in length)
     * @param l1
     * @param l2
     * @returns {*[]}
     */
    const filterDownToLimit = (l1, l2) => {
        const halfMax = MAX_DOWNLOAD_LENGTH/2;

        const l1Lower = l1.length < halfMax;
        const l2Lower = l2.length < halfMax;

        if(l1Lower && l2Lower) {
            return [l1, l2];
        } else if(l1Lower) {
            const l2Limit= Math.max(MAX_DOWNLOAD_LENGTH - l1.length, halfMax);
            return [l1, l2.slice(0,l2Limit)];
        } else if(l2Lower) {
            const l1Limit= Math.max(MAX_DOWNLOAD_LENGTH - l2.length, halfMax);
            return [l1.slice(0,l1Limit), l2];
        }
        return [l1.slice(0,halfMax), l2.slice(0,halfMax)];
    };

    /**
     * Generates the JSX for the download buttons
     *
     * @param allPending
     * @param filteredPending
     * @param allDelivered
     * @param filteredDelivered
     * @returns {*}
     */
    const generateDownloadOptions = (allPending, filteredPending, allDelivered, filteredDelivered) => {
        const [limitedAllPending, limitedAllDelivered] = filterDownToLimit(allPending, allDelivered);
        const [limitedFilteredPending, limitedFilterdDelivered] = filterDownToLimit(filteredPending, filteredDelivered);

        const showAllWarning = allPending.length + allDelivered.length > MAX_DOWNLOAD_LENGTH;
        const showFilteredWarning = filteredPending.length + filteredDelivered.length > MAX_DOWNLOAD_LENGTH;

        const allDownloadFn = () => createSampleXlsxListReq(limitedAllPending, limitedAllDelivered, 'sample_tracking_all', showAllWarning);
        const filteredDownloadFn = () => createSampleXlsxListReq(limitedFilteredPending, limitedFilterdDelivered, 'sample_tracking_filtered', showFilteredWarning);

        return <div className={'display-inline'}>
                <DownloadIndicator label={'All'}
                               tooltip={'Export all requests'}
                               downloadFn={allDownloadFn}></DownloadIndicator>
            {
                (filteredRecipes.size > 0 || requestIdQuery !== '' || dateFilter !== DF_ALL) ?
                    <DownloadIndicator label={'Filtered'}
                                       tooltip={`Export filtered requests in current view - ${generateExportDescription()}`}
                                       downloadFn={filteredDownloadFn}></DownloadIndicator>
                    : <span></span>
            }
        </div>
    };

    /**
     * Toggles Download state (untoggles showFilters toggle if
     */
    const toggleDownload = () => {
        const newShowDownload = !showDownload;
        if(newShowDownload){
            setShowFilters(false);
        }
        setShowDownload(!showDownload)
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
                                                     onClick={() => {
                                                         const newShowFilters = !showFilters;
                                                         if(newShowFilters){
                                                             setShowDownload(false);
                                                         }
                                                         setShowFilters(!showFilters)
                                                     }}/>
                                </div>
                                <div className={'filters-toggle-container inline-block'}>
                                    <p className={'advanced-search'}>Export</p>
                                    <FontAwesomeIcon className={`filters-icon hover ${showDownload ? 'mskcc-white' : 'mskcc-light-gray'}`}
                                                     icon={faDownload}
                                                     onClick={toggleDownload}/>
                                </div>
                            </Col>
                            {
                                showFilters ?  <Col xs={12} lg={6} xl={7}>
                                    <div className={'display-inline'}>
                                        <div>
                                            {renderDateFilter('Submitted/Delivered in past: ', dateFilter, handleDateFilterToggle, dateFilter)}
                                        </div>
                                        <div>
                                            <RecipeFilter recipeSet={recipeSet} filteredRecipes={filteredRecipes} setFilteredRecipes={setFilteredRecipes}/>
                                        </div>
                                    </div>
                                </Col> :
                                showDownload ? <Col xs={12} lg={6} xl={7}>
                                        { generateDownloadOptions(pendingRequestsList, filteredPendingRequests, deliveredRequestsList, filteredDeliveredRequests) }
                                    </Col> :
                                <Col xs={12} lg={6} xl={7}>
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
                <Container className={classes.rootContainer}>
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
                                        {generateSearchContainer('Request ID', requestIdQuery, (query) => {setRequestIdQuery(query.toUpperCase())})}
                                        <ProjectSection requestList={filteredPendingRequests}
                                                        projectState={STATE_PENDING_REQUESTS}
                                                        dateFilterField={pendingFilterField}></ProjectSection>
                                        <ProjectSection requestList={filteredDeliveredRequests}
                                                        projectState={STATE_DELIVERED_REQUESTS}
                                                        dateFilterField={deliveredFilterField}></ProjectSection>
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
