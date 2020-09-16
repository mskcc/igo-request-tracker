import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faFlask} from "@fortawesome/free-solid-svg-icons";

/**
 * Shows progress of a pending request
 *
 * @param summaryColorClass, e.g. 'update-blue', 'fail-red'
 * @param label, e.g. 4/15
 * @returns {*}
 * @constructor
 */
export function IndicatorFlask({summaryColorClass, label}) {
    return <span className={`large-icon fa-layers fa-fw hover inline-block ${summaryColorClass}`}>
            <FontAwesomeIcon icon={faFlask}/>
            <span className="fa-layers-bottom fa-layers-text fa-inverse project-summary-text-override">{label}</span>
        </span>;
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
