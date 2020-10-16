import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faExclamationTriangle, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
import Tooltip from '@material-ui/core/Tooltip';

/**
 * Returns an icon & tooltip to indicate the current progress of a request
 *
 * @param isDelivered
 * @param isComplete
 * @param pendingStage
 * @param completedCt
 * @param totalCt
 * @param failedCt
 * @returns {*}
 * @constructor
 */
export function RequestStatusIndicator({ isDelivered, isComplete, pendingStage, completedCt, totalCt, failedCt }) {
        const hasFailed = (failedCt && failedCt > 0);
        const summaryColorClass = hasFailed ? 'fail-red' : isDelivered ? 'success-green' : 'update-blue';
        let icon = null;
        let tooltip = '';

        const showCompletionIcon = isDelivered || isComplete;

        if( showCompletionIcon ){
            // requests that have completed the workflow or been delivered should just show a check mark
            icon=faCheck;
            tooltip = isDelivered ? 'Delivered' : 'Pending Delivery';
        } else {
            tooltip = `Completed: ${completedCt}, Total: ${totalCt}`;
        }
        if(hasFailed) {
            tooltip += ` (Failed: ${failedCt})`;
        }

        return showCompletionIcon ?
                    <Tooltip title={tooltip} aria-label={'Complete tooltip'} placement="right">
                        <span className={`small-icon fa-layers fa-fw hover inline-block ${summaryColorClass}`}>
                            <FontAwesomeIcon icon={faCheck}/>
                        </span>
                    </Tooltip>
                    :
                    <div className="request-pending-stage-container">
                        <Tooltip title={tooltip} aria-label={tooltip} placement="right">
                            <h5 className={'hover no-margin-bottom text-align-center'}>
                                {pendingStage}
                            </h5>
                        </Tooltip>
                        {   hasFailed ? <Tooltip title={"Has Failed Samples"} aria-label={tooltip} placement="right">
                                <span className={`tiny-icon fa-layers fa-fw hover inline-block ${summaryColorClass}`}>
                                    <FontAwesomeIcon icon={faExclamationTriangle}/>
                                </span>
                            </Tooltip>: <span></span>
                        }
                    </div>
}

/**
 * Indicator of a delivered request
 *
 * @returns {*}
 * @constructor
 */
export function LoadingIcon() {
    return <span className={'small-icon mskcc-black fa-layers fa-fw hover inline-block'}>
        <FontAwesomeIcon icon={faEllipsisH}/>
    </span>;
}