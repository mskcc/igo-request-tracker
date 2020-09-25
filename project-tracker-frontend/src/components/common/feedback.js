import React, { useEffect, useState }  from "react";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";
import MuiDownshift from 'mui-downshift'
import MuiButton from "@material-ui/core/Button/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import {faComment, faTimes, faUsers} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {sendUpdate, MODAL_UPDATE, MODAL_ERROR, MODAL_SUCCESS} from "object-modal";

import {STATE_DELIVERED_REQUESTS, STATE_MODAL_UPDATER, STATE_PENDING_REQUESTS} from "../../redux/reducers";
import IconButton from "@material-ui/core/IconButton";
import {goToTeamWorks} from "../../utils/utils";

const INCORRECT_STATUS = "INCORRECT_STATUS";
const OTHER = "OTHER";

const Feedback = ({closeFeedback}) => {
    const [feedbackType, setFeedbackType] = useState(INCORRECT_STATUS);
    const [feedbackBody, setFeedbackBody] = useState("");
    const [feedbackSubject, setFeedbackSubject] = useState("");
    const [bugProject, setBugProject] = useState("");
    const [bugSamples, setBugSamples] = useState("");
    const [bugStages, setBugStages] = useState("");
    const [projectList, setProjectList] = useState(new Set());

    const unDelivered = useSelector(state => state[STATE_PENDING_REQUESTS] );
    const delivered =  useSelector(state => state[STATE_DELIVERED_REQUESTS] );

    useEffect(() => {
        const updatedSet = updateProjectList(unDelivered);
        setProjectList(updatedSet);
    }, [unDelivered]);
    useEffect(() => {
        const updatedSet = updateProjectList(delivered);
        setProjectList(updatedSet);
    }, [delivered]);

    const getProjectStages = (prjName) => {
        const project = unDelivered[prjName];
        if(!project){
            return [];
        }
        const stages = project.getStages();
        return stages.map((s) => {return s.stage});
    };

    const updateProjectList = (projectState) => {
        const pList = Object.keys(projectState);
        if(pList && pList.length > 0){
            for(const project of pList){
                projectList.add(project);
            }
        }
        return projectList;
    };

    const formatStringList = (list) => {
        const formatted = list.map((item) => {
            return {
                label: item
            }
        });
        return formatted;
    };


    return <div className={"feedback-form padding-24"}>
        <FontAwesomeIcon className={"status-change-close hover"}
                         icon={faTimes}
                         onClick={closeFeedback}/>
        <div className={"feedback-container margin-hor-20"}>
            <form className={"fill-width"}>
                <h5 className={"text-align-center bold"}>Feedback?</h5>
                <p className={"text-align-left"}>
                    Please fill out a teamworks request. Or, email the IGO data team (
                    <span className={"bold"}>zzPDL_SKI_IGO_DATA@mskcc.org</span>)
                </p>
                <div className={"fill-width text-align-center"}>
                    <IconButton aria-label="teamworks-link"
                                onClick={goToTeamWorks}
                                className={"border hover"}>
                        <FontAwesomeIcon className={"hover"}
                                         icon={faUsers}/>
                    </IconButton>
                </div>
            </form>
        </div>
    </div>;
};

export default Feedback;

Feedback.propTypes = {
    addModalUpdate: PropTypes.func,
    closeFeedback: PropTypes.bool
};
