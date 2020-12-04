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
    const expectedDeliveryElement = getByText('Expected Delivery');
    expect(expectedDeliveryElement).toBeInTheDocument();

    const receivedElement = getByText('Received');
    expect(receivedElement).toBeInTheDocument();
});

test('Shows delivered date field if STATE_DELIVERED_REQUESTS', () => {
    const { getByText } = render(<Provider store={createStore(reducer, {})}>
        <ProjectSection dateFilter={DF_WEEK}
                        requestList={[]}
                        projectState={STATE_DELIVERED_REQUESTS}
                        requestIdQuery={''}
                        filteredRecipes={new Set()}/>
    </Provider>);
    const deliveredElement = getByText('Delivered');
    expect(deliveredElement).toBeInTheDocument();

    const receivedElement = getByText('Received');
    expect(receivedElement).toBeInTheDocument();
});
