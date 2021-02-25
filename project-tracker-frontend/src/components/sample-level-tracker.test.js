import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import SampleLevelTracker from './sample-level-tracker';
import reducer, {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS, STATE_USER_SESSION} from "../redux/reducers/index";
import resp from '../mocks/requests_05420';

test('Extracts delivered date when STATE_DELIVERED_REQUESTS', () => {
    const TEST_PROJECT_ID = 'TEST_PROJECT_ID';

    const { getByText, debug } = render(<Provider store={createStore(reducer, {
        [STATE_USER_SESSION]: {
            'isUser': false
        }
    })}>
        <SampleLevelTracker igoCompleteDate={new Date()}
                            samples={resp.data.samples}
                            requestName={'05240_W'}/>
    </Provider>);
    const wkflwHeader = getByText("Workflow Progress");
    expect(wkflwHeader).toBeInTheDocument();
});
