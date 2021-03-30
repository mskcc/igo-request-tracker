import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const useStyles = makeStyles({
    downloadCol: {
        'padding': '8px 0px',
    },
    downloadSep: {
        'padding': '8px',
        'border-left': '1px solid black',
        'background-color': '#d5d4c7'
    },
    button: {
        'margin': '0px 5px',
        'width': '150px',
        'display': 'inline-block'
    },
    container: {
        'display': 'flex',
        'background-color': 'white',
        'position': 'relative',
        'margin': '2px 0px',
        'border-radius': '4px',
        'hover': 'cursor',
        'text-align': 'center',
        '&:hover': {
            'cursor': 'pointer'
        }
    },
    label: {
        'display': 'inline-block',
    },
    paramsContainer: {
        'position': 'relative',
        'padding': '8px',
        'margin': '2px 0px',
        'border-radius': '8px',
        'display': 'inline-block',
        'hover': 'cursor',
        'text-align': 'center',
        'background-color': '#d5d4c7',
        'white-space': 'nowrap',
        'overflow-x': 'hidden'
    },
    params: {
        'display': 'inline-block',
        'margin': '0px'
    },
    filler: {
        'display': 'inline-block',
        'margin': '2px 0px',
        'text-align': 'center',
        'padding': '4px 0px',
    },
    tooltip: {
        fontSize: 16,
        maxWidth: 1000
    }
});

export default function DownloadIndicator({label, tooltip, params}) {
    const classes = useStyles();
    return <div className={classes.button}>
        <Tooltip classes={classes} title={tooltip} aria-label={'Complete tooltip'} placement="bottom">
            <Row className={classes.container}>
                <Col xs={9} className={classes.downloadCol}>
                        <p className="inline-block no-margin-bottom">
                            <span className={"bold"}>{label}</span>
                        </p>
                </Col>
                <Col xs={3} className={classes.downloadSep}>
                    <FontAwesomeIcon className={classes.icon} icon={faDownload}/>
                </Col>
            </Row>
        </Tooltip>
    </div>;
}
