import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles({
    container: {
        'display': 'inline',
        'background-color': 'white',
        'position': 'relative',
        'padding': '8px',
        'border-radius': '8px'
    },
    label: {
        'display': 'inline-block',
    },
});

export default function FilterIndicator({label, value}) {
    const classes = useStyles();
    return <div className={classes.container}>
        <p className="inline-block">
            <span className={"bold"}>{label}: </span>
            {value}
        </p>
    </div>
}
