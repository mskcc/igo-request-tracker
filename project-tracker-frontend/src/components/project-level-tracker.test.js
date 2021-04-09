import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ProjectLevelTracker from './project-level-tracker';
import reducer, {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS, STATE_USER_SESSION} from "../redux/reducers/index";
import Project from "../utils/Project";

const TEST_PROJECT_ID = 'TEST_PROJECT_ID';
const request_template = {
    "summary":{
        "total": 0,
        "RecentDeliveryDate":null,
        "stagesComplete":false,
        "isIgoComplete":false,
        "completed": 0,
        "failed": 0,
        "CompletedDate":null
    },
    "metaData":{
        "childRequests":[],
        "ProjectName":"test",
        "sourceProjects": [],
        "QcAccessEmails":"",
        "LaboratoryHead":"",
        "RequestName":"test",
        "TATFromInProcessing":"",
        "Investigator":"",
        "ProjectManager":"",
        "ReceivedDate":0,
        "TATFromReceiving":"",
        "GroupLeader":"",
        "requestId": TEST_PROJECT_ID,
        "LabHeadEmail":"",
        "DataAccessEmails":"",
        "serviceId":""
    },
    "requestId":TEST_PROJECT_ID,
    "stages":[],
    "samples":[]
}

test('Should have child requests, not source requests', () => {
    const request = JSON.parse(JSON.stringify(request_template));   // Deep-clone
    request["metaData"]["childRequests"] = [ "CHILD_REQUEST_ID" ]
    const project = new Project(TEST_PROJECT_ID, 0, 0, '', true);
    project.addRequestTrackingInfo(request);

    const { getByText, queryByText } = render(<ProjectLevelTracker project={project}/>);
    const childRequests = getByText("Child Requests");
    expect(childRequests).toBeInTheDocument();

    expect(queryByText("Source Requests")).toBeNull();
});

test('Should have source requests, not child requests', () => {
    const request = JSON.parse(JSON.stringify(request_template));   // Deep-clone
    request["metaData"]["sourceRequests"] = [ "SOURCE_REQUEST_ID" ]
    const project = new Project(TEST_PROJECT_ID, 0, 0, '', true);
    project.addRequestTrackingInfo(request);

    const { getByText, queryByText } = render(<ProjectLevelTracker project={project}/>);
    const childRequests = getByText("Source Requests");
    expect(childRequests).toBeInTheDocument();

    expect(queryByText("Child Requests")).toBeNull();
});

test('Should have source requests, not child requests', () => {
    const request = JSON.parse(JSON.stringify(request_template));   // Deep-clone
    request["metaData"]["sourceRequests"] = [ "SOURCE_REQUEST_ID" ]
    const project = new Project(TEST_PROJECT_ID, 0, 0, '', true);
    project.addRequestTrackingInfo(request);

    const { getByText, queryByText } = render(<ProjectLevelTracker project={project}/>);
    const childRequests = getByText("Source Requests");
    expect(childRequests).toBeInTheDocument();

    expect(queryByText("Child Requests")).toBeNull();
});
