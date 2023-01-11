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
import {faComment, faQuestion, faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@material-ui/core/IconButton";
import {Container} from "react-bootstrap";
import Feedback from "./feedback";
import {useDispatch, useSelector} from "react-redux";
import {STATE_MODAL_UPDATER, STATE_USER_SESSION} from "../../redux/reducers";
import {updateUserSession} from "../../redux/dispatchers";
import {USER_VIEW} from "../../utils/api-util";
import {MODAL_UPDATE, sendUpdate} from "object-modal";

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
    const dispatch = useDispatch();

    const modalUpdater = useSelector(state => state[STATE_MODAL_UPDATER] );
    const userSession = useSelector(state => state[STATE_USER_SESSION] );
    const userName = userSession['firstName'];
    const [showFeedback, setShowFeedback] = useState(false);

    const showUserViewToggle = userSession['isAdmin'] || userSession['isLabMember'];
    const showUserView = userSession[USER_VIEW] || false;

    const getUserSessionRole = () => {
        const isAdmin = userSession['isAdmin'] || false;
        const isLabMember = userSession['isLabMember'] || false;
        const isPM =  userSession['isPM'] || false;
        console.log(userName);
        if (userName === 'fahimeh') return 'User';
        // return isAdmin ? 'Admin' :
        //     isLabMember ? 'IGO' :
        //         isPM ? 'PM' : 'User';   // Everyone is a user if they don't have a special role
    };
    const role = showUserView ? 'User' : getUserSessionRole();

    /**
     * Updates the user session in the store
     */
    const toggleUserView = () => {
        const updated = !showUserView;
        let message = `Switching back to ${getUserSessionRole()} view`;
        let messageTime = 3000;
        if(updated) {
            message = 'Showing user view (Only projects in your hierarchy will be visible)'
            messageTime = 7000;
        }
        sendUpdate(modalUpdater, message, MODAL_UPDATE, messageTime);

        const updatedSession = { ...userSession };
        updatedSession[USER_VIEW] = !showUserView;
        updateUserSession(dispatch, updatedSession);
    };

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
                            (userName || true) ? <p className={"italic  no-margin-bottom"}>{userName} ({role})</p> : <span></span>
                        }
                        {
                            showUserViewToggle ? <FontAwesomeIcon className={'hover'}
                                             icon={showUserView ? faToggleOn : faToggleOff}
                                             onClick={toggleUserView}/>
                                : <span></span>
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
