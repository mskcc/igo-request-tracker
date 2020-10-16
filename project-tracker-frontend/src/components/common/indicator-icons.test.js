import React from 'react';
import { render } from '@testing-library/react';
import { RequestStatusIndicator } from './indicator-icons';

test('Successful icon & "Delivered" Tooltip when isDelivered === true', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, queryByText, getByTitle, debug } = render(<RequestStatusIndicator
                                         isDelivered={true}
                                         isComplete={true}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={5}
                                         totalCt={5}
                                         failedCt={0}></RequestStatusIndicator>);
    expect(queryByText(TEST_PENDING_STAGE)).toBeNull();
    expect(container.firstChild).toHaveClass('success-green');
    const linkElement = getByTitle('Delivered');
    expect(linkElement).toBeInTheDocument();
});

test('Successful icon & "Delivered" Tooltip when isDelivered === true', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, queryByText, getByTitle, debug } = render(<RequestStatusIndicator
                                         isDelivered={true}
                                         isComplete={false}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={5}
                                         totalCt={5}
                                         failedCt={0}></RequestStatusIndicator>);
    expect(queryByText(TEST_PENDING_STAGE)).toBeNull();
    expect(container.firstChild).toHaveClass('success-green');
    const linkElement = getByTitle('Delivered');
    expect(linkElement).toBeInTheDocument();
});

test('Failure indicator when failed count > 0', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, queryByText, getByTitle, debug } = render(<RequestStatusIndicator
                                         isDelivered={true}
                                         isComplete={false}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={5}
                                         totalCt={5}
                                         failedCt={1}></RequestStatusIndicator>);
    expect(queryByText(TEST_PENDING_STAGE)).toBeNull();
    expect(container.firstChild).toHaveClass('fail-red');
    const linkElement = getByTitle('Delivered (Failed: 1)');
    expect(linkElement).toBeInTheDocument();
});

test('"Pending Delivery" indicator when completed, but not delivered', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, queryByText, getByTitle, debug } = render(<RequestStatusIndicator
                                         isDelivered={false}
                                         isComplete={true}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={5}
                                         totalCt={5}
                                         failedCt={0}></RequestStatusIndicator>);
    expect(queryByText(TEST_PENDING_STAGE)).toBeNull();
    expect(container.firstChild).toHaveClass('update-blue');
    const linkElement = getByTitle('Pending Delivery');
    expect(linkElement).toBeInTheDocument();
});

test('"Failed" indicator when completed, but not delivered w/ failed samples', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, queryByText, getByTitle, debug } = render(<RequestStatusIndicator
                                         isDelivered={false}
                                         isComplete={true}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={5}
                                         totalCt={5}
                                         failedCt={2}></RequestStatusIndicator>);
    expect(container.firstChild).toHaveClass('fail-red');
    expect(queryByText(TEST_PENDING_STAGE)).toBeNull();
    const linkElement = getByTitle('Pending Delivery (Failed: 2)');
    expect(linkElement).toBeInTheDocument();
});

test('Pending stage is present when not complete, tooltip indicates status w/ failures', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, getByTitle, getByText, debug } = render(<RequestStatusIndicator
                                         isDelivered={false}
                                         isComplete={false}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={3}
                                         totalCt={5}
                                         failedCt={2}></RequestStatusIndicator>);
    expect(container.firstChild).toHaveClass('request-pending-stage-container');
    const linkElement = getByTitle('Completed: 3, Total: 5 (Failed: 2)');
    expect(linkElement).toBeInTheDocument();
    const pendingStageElement = getByText(TEST_PENDING_STAGE);
    expect(pendingStageElement).toBeInTheDocument();
});

test('Pending stage is present when not complete, tooltip indicates status w/o failures', () => {
    const TEST_PENDING_STAGE = 'TEST_PENDING_STAGE';
    const { container, getByTitle, getByText, debug } = render(<RequestStatusIndicator
                                         isDelivered={false}
                                         isComplete={false}
                                         pendingStage={TEST_PENDING_STAGE}
                                         completedCt={3}
                                         totalCt={5}
                                         failedCt={0}></RequestStatusIndicator>);
    expect(container.firstChild).toHaveClass('request-pending-stage-container');
    const linkElement = getByTitle('Completed: 3, Total: 5');
    expect(linkElement).toBeInTheDocument();
    const pendingStageElement = getByText(TEST_PENDING_STAGE);
    expect(pendingStageElement).toBeInTheDocument();
});