import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faCircle} from "@fortawesome/free-solid-svg-icons";
import Tooltip from '@material-ui/core/Tooltip';

/**
 * Shows progress of a pending request
 *
 * @param summaryColorClass, e.g. 'update-blue', 'fail-red'
 * @param label, e.g. 4/15
 * @returns {*}
 * @constructor
 */
export function RequestStatusIndicator({summaryColorClass, completed, total}) {
    const tooltip = `Completed: ${completed}, Total: ${total}`;
    return <Tooltip title={tooltip} aria-label={tooltip} placement="right">
             <span className={`large-icon fa-layers fa-fw hover inline-block ${summaryColorClass}`}>
                    <FontAwesomeIcon icon={faCircle}/>
                    <span className="fa-layers-text fa-inverse project-summary-text numerator">{completed}</span>
                    <span className="fa-layers-text fa-inverse project-summary-text denominator">{total}</span>
            </span>
        </Tooltip>

}

/**
 * Indicator of a delivered request
 *
 * @returns {*}
 * @constructor
 */
export function DoneCheck() {
    return <span className={`small-icon fa-layers fa-fw hover inline-block success-green`}>
                <FontAwesomeIcon icon={faCheck}/>
            </span>
}
