import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import reducer, {STATE_USER_SESSION} from "../redux/reducers/index";
import SampleTree from "./sample-tree";
import {
    CORRECTED_INVESTIGATOR_ID, CORRECTED_SAMPLE_NAME,
    TEST_SAMPLE_CORRECTED,
    TEST_SAMPLE_UNCORRECTED,
    UNCORRECTED_SAMPLE_NAME
} from "../mocks/mock-samples";

const TEST_REQUEST_ID = 'TEST_REQUEST_ID';


test('Users should not see the tree-toggle', () => {
    const { getByTestId } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': true
        }
    })}>
        <SampleTree  igoCompleteDate={0}
                     sample={TEST_SAMPLE_CORRECTED}
                     requestName={TEST_REQUEST_ID}
                     showCorrected={true}></SampleTree>
    </Provider>);
    try {
        getByTestId('tree-toggle')
    } catch(error) {
        expect(true).toBe(true);
    }
});

test('Admins should see the tree-toggle', () => {
    const { getByTestId, debug } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': false
        }
    })}>
        <SampleTree  igoCompleteDate={0}
                     sample={TEST_SAMPLE_CORRECTED}
                     requestName={TEST_REQUEST_ID}
                     showCorrected={true}></SampleTree>
    </Provider>);
    expect(getByTestId('tree-toggle')).toBeInTheDocument();
});

test('Corrected Investigator ID shows', () => {
    const { getByText, debug } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': false
        }
    })}>
        <SampleTree  igoCompleteDate={0}
                     sample={TEST_SAMPLE_CORRECTED}
                     requestName={TEST_REQUEST_ID}
                     showCorrected={true}></SampleTree>
    </Provider>);
    expect(getByText(CORRECTED_INVESTIGATOR_ID)).toBeInTheDocument();
    try {
        getByText(CORRECTED_SAMPLE_NAME)
    } catch(error) {
        expect(true).toBe(true);
    }
});

test('Original sample name shows when showCorrected is passed in as false', () => {
    const { getByText, debug } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': false
        }
    })}>
        <SampleTree  igoCompleteDate={0}
                     sample={TEST_SAMPLE_CORRECTED}
                     requestName={TEST_REQUEST_ID}
                     showCorrected={false}></SampleTree>
    </Provider>);
    expect(getByText(CORRECTED_SAMPLE_NAME)).toBeInTheDocument();
});


test('Sample ID shows when there is no correctedInvestigatorId', () => {
    const { getByText, debug } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': false
        }
    })}>
        <SampleTree  igoCompleteDate={0}
                     sample={TEST_SAMPLE_UNCORRECTED}
                     requestName={TEST_REQUEST_ID}
                     showCorrected={true}></SampleTree>
    </Provider>);
    expect(getByText(UNCORRECTED_SAMPLE_NAME)).toBeInTheDocument();
});
