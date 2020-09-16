import React, {useState} from "react";
import { NavLink } from 'react-router-dom'
import {
    Avatar,
    AppBar,
    Toolbar,
    Button,
    Typography,
    withStyles,
} from '@material-ui/core'

import image from '../../img/msk.png'
import {HOME} from "../../config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment, faQuestion} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@material-ui/core/IconButton";
import {Container} from "react-bootstrap";
import Feedback from "./feedback";
import {useSelector} from "react-redux";
import {STATE_USER_SESSION} from "../../redux/reducers";

const styles = theme => ({
    header: {
        backgroundColor: theme.palette.primary.logo,
        color: 'white',
        textAlign: 'center',
    },
    title: {
        '&:hover': {
            'text-decoration': 'none',
        }
    },
    navlink: {
        color: theme.palette.textSecondary,
        textDecoration: 'none',
        marginRight: theme.spacing(1),
        '&:focus': {
            'outline': '0',
        }
    },
    active: {
        color: 'white',
        fontSize: '1em',
    },
    iconContainer: {
        position: 'absolute',
        right: '10px'
    },
    icon: {
        color: 'white',
        fontSize: '1.5em'
    }
});

export function Header({ classes }) {
    const userSession = useSelector(state => state[STATE_USER_SESSION] );
    const userName = userSession['firstName'];

    const [showFeedback, setShowFeedback] = useState(false);
    return <AppBar position="static" title={image} className={classes.header}>
        <Container>
            <Toolbar>
                <NavLink to={`${HOME}/`} className={classes.title}>
                    <Avatar alt="mskcc logo" src={image} className={classes.avatar}/>
                </NavLink>
                <NavLink to={`${HOME}/`} className={classes.title}>
                    <Typography color="secondary" variant="h6" className={classes.title}>
                        IGO Request Tracker
                    </Typography>
                </NavLink>
                <div className={classes.iconContainer}>
                    <div className={"greeting-container"}>
                        {
                            userName ? <p className={"italic"}>Hi {userName}</p> : <span></span>
                        }
                    </div>
                    <NavLink to={`${HOME}/help`}
                             activeClassName={classes.active}
                             className={classes.navlink}>
                        <Button>
                            <FontAwesomeIcon className={classes.icon} icon={faQuestion}/>
                        </Button>
                    </NavLink>
                    <IconButton aria-label='feedback'
                                onClick={() => setShowFeedback(!showFeedback)}
                                className={classes.navlink}>
                        <FontAwesomeIcon className={classes.icon} icon={faComment}/>
                    </IconButton>
                    {showFeedback ? <Feedback closeFeedback={() => setShowFeedback(false)}/> : <div></div>}
                </div>

            </Toolbar>
        </Container>

    </AppBar>
}

export default withStyles(styles)(Header)
