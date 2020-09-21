import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ProjectSection from './project-section';
import reducer, { STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS } from "../../redux/reducers/index";
import { DF_WEEK } from "../common/project-filters";


test('Shows received date field if STATE_PENDING_REQUESTS', () => {
    const { getByText } = render(<Provider store={createStore(reducer, {})}>
        <ProjectSection dateFilter={DF_WEEK}
                        requestList={[]}
                        projectState={STATE_PENDING_REQUESTS}
                        requestIdQuery={''}
                        filteredRecipes={new Set()}/>
    </Provider>);
    const linkElement = getByText(/Received/i);
    expect(linkElement).toBeInTheDocument();
});

test('Shows delivered date field if STATE_DELIVERED_REQUESTS', () => {
    const { getByText } = render(<Provider store={createStore(reducer, {})}>
        <ProjectSection dateFilter={DF_WEEK}
                        requestList={[]}
                        projectState={STATE_DELIVERED_REQUESTS}
                        requestIdQuery={''}
                        filteredRecipes={new Set()}/>
    </Provider>);
    const linkElement = getByText('Delivered');
    expect(linkElement).toBeInTheDocument();
});
