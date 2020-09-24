import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
    container: {
        'background-color': 'white',
        'position': 'relative',
        'padding': '8px',
        'border-radius': '8px',
        'display': 'inline-block',
        'margin-right': '10px',
        'margin-bottom': '10px'
    },
    label: {
        'display': 'inline-block',
    },
});

export default function FilterIndicator({label, value, showCondition}) {
    const classes = useStyles();
    return showCondition ? <div className={classes.container}>
            <p className="inline-block no-margin-bottom">
                <span className={"bold"}>{label}: </span>
                {value}
            </p>
        </div> : <div></div>;
}
