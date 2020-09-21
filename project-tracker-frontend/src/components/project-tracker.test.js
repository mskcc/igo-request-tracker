import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ProjectTracker from './project-tracker';
import reducer, {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS} from "../redux/reducers/index";
import Project from "../utils/Project";
import {MOCK_REQUEST} from "../test-utils/mock-request";

test('Extracts delivered date when STATE_DELIVERED_REQUESTS', () => {
    const TEST_PROJECT_ID = 'TEST_PROJECT_ID';

    const { getByText } = render(<Provider store={createStore(reducer, {
        [STATE_DELIVERED_REQUESTS]: {
            [TEST_PROJECT_ID]: new Project(MOCK_REQUEST.data)
        }
    })}>
        <ProjectTracker projectName={TEST_PROJECT_ID}
                        projectState={STATE_DELIVERED_REQUESTS}/>
    </Provider>);
    const linkElement = getByText(/9\/16\/2020/i);
    expect(linkElement).toBeInTheDocument();
});


test('Extracts received date when STATE_PENDING_REQUESTS', () => {
    const TEST_PROJECT_ID = 'TEST_PROJECT_ID';
    const STATE = STATE_PENDING_REQUESTS;

    const { getByText } = render(<Provider store={createStore(reducer, {
        [STATE]: {
            [TEST_PROJECT_ID]: new Project(MOCK_REQUEST.data)
        }
    })}>
        <ProjectTracker projectName={TEST_PROJECT_ID}
                        projectState={STATE}/>
    </Provider>);
    const linkElement = getByText(/9\/13\/2020/i);
    expect(linkElement).toBeInTheDocument();
});
